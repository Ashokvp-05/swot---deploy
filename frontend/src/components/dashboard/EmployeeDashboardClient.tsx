"use client"

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import {
    Clock, Calendar, Loader2, LogIn, LogOut, StopCircle,
    BarChart3, CheckCircle2,
    Target, ShieldCheck, Building2,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

interface Props {
    user: any
    token: string
    initialData: any
}

type AttendanceStatus = 'IDLE' | 'ACTIVE' | 'LOADING'

export default function EmployeeDashboardClient({ user, token, initialData }: Props) {
    const [status, setStatus] = useState<AttendanceStatus>('LOADING')
    const [clockType, setClockType] = useState<'IN_OFFICE' | 'REMOTE'>('IN_OFFICE')
    const [startTime, setStartTime] = useState<string | null>(null)
    const [userData, setUserData] = useState(user)
    const [timerParts, setTimerParts] = useState({ h: "00", m: "00", s: "00" })
    const [mounted, setMounted] = useState(false)
    const [summary, setSummary] = useState(initialData?.summary || { totalHours: "0", overtimeHours: "0", regularHours: "0", daysWorked: 0, lateCheckIns: 0, totalWeekDays: 5, chartData: [] })
    const announcements = initialData?.announcements || []
    const [latestPayslip, setLatestPayslip] = useState(initialData?.latestPayslip || null)
    const [liveTime, setLiveTime] = useState<Date | null>(null)
    const [pulseView, setPulseView] = useState<'MONTH' | 'YEAR'>('MONTH')
    const [monthlySummary, setMonthlySummary] = useState(initialData?.monthlySummary || { present: 0, businessDays: 21, totalHours: '0', lateCheckIns: 0, ratio: 0, monthName: 'May', year: 2026 })
    const [yearlySummary, setYearlySummary] = useState(initialData?.yearlySummary || { months: [], totalPresent: 0, totalBusinessDays: 0, year: 2026 })

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) return
            try {
                const res = await fetch(`${API_BASE_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) setUserData(await res.json())
            } catch (e) {}
        }
        fetchUserData()
    }, [token])

    useEffect(() => { setMounted(true); setLiveTime(new Date()) }, [])
    useEffect(() => {
        const t = setInterval(() => setLiveTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        if (status !== 'LOADING') return
        if (initialData?.activeEntry) {
            setStatus('ACTIVE')
            setStartTime(initialData.activeEntry.clockIn)
        } else {
            setStatus('IDLE')
        }
    }, [initialData, status])

    useEffect(() => {
        if (status !== 'ACTIVE' || !startTime) {
            setTimerParts({ h: "00", m: "00", s: "00" })
            return
        }
        const iv = setInterval(() => {
            const diff = Date.now() - new Date(startTime).getTime()
            setTimerParts({
                h: Math.floor(diff / 3600000).toString().padStart(2, '0'),
                m: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
                s: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0'),
            })
        }, 1000)
        return () => clearInterval(iv)
    }, [status, startTime])

    const pollRef = useRef<NodeJS.Timeout | null>(null)

    const fetchLiveData = useCallback(async (signal?: AbortSignal) => {
        if (!token) return
        try {
            const res = await fetch(`${API_BASE_URL}/dashboard/employee`, {
                headers: { Authorization: `Bearer ${token}` }, signal
            })
            if (res.ok) {
                const data = await res.json()
                if (data.summary) setSummary(data.summary)
                if (data.monthlySummary) setMonthlySummary(data.monthlySummary)
                if (data.yearlySummary) setYearlySummary(data.yearlySummary)
                if (data.latestPayslip) setLatestPayslip(data.latestPayslip)
                
                // Sync clock status with backend
                if (data.activeEntry) {
                    setStatus('ACTIVE')
                    setStartTime(data.activeEntry.clockIn)
                } else {
                    setStatus('IDLE')
                    setStartTime(null)
                }
            }
        } catch (e: any) {
            if (e?.name !== 'AbortError') {}
        }
    }, [token])

    useEffect(() => {
        const controller = new AbortController()
        fetchLiveData(controller.signal)
        
        // Polling for live updates every 5 seconds
        pollRef.current = setInterval(() => {
            fetchLiveData()
        }, 5000)

        return () => {
            controller.abort()
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [fetchLiveData])

    const greeting = useMemo(() => {
        if (!mounted) return "Hello"
        const h = new Date().getHours()
        if (h < 12) return "Good Morning"
        if (h < 17) return "Good Afternoon"
        return "Good Evening"
    }, [mounted])

    const weekDays = useMemo(() => {
        const d = mounted ? new Date() : new Date("2026-03-24")
        return eachDayOfInterval({ start: startOfWeek(d, { weekStartsOn: 1 }), end: endOfWeek(d, { weekStartsOn: 1 }) })
    }, [mounted])

    const handleClock = useCallback(async () => {
        const isIn = status === 'IDLE'
        setStatus('LOADING')
        let lat: number | null = null
        let lng: number | null = null
        if (isIn && navigator.geolocation) {
            try {
                const pos: any = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, {
                        enableHighAccuracy: false, timeout: 3000, maximumAge: 120000
                    }))
                lat = pos.coords.latitude
                lng = pos.coords.longitude
            } catch {}
        }
        try {
            const endpoint = isIn ? '/attendance-v2/clock-in-v2' : '/attendance-v2/clock-out-v2'
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type: clockType, lat, lng, workLocation: clockType === 'IN_OFFICE' ? 'Office' : 'Remote' })
            })
            if (res.ok) {
                const d = await res.json()
                if (isIn) {
                    setStartTime(d.clockIn)
                    setStatus('ACTIVE')
                    toast.success("Clocked In", { description: `${clockType === 'IN_OFFICE' ? 'Office' : 'Remote'} session started.` })
                } else {
                    setStatus('IDLE')
                    setStartTime(null)
                    toast.success("Clocked Out", { description: "Your shift has been saved." })
                }
                // Immediately refresh dashboard data
                fetchLiveData()
            } else {
                const err = await res.json().catch(() => ({}))
                toast.error(err.message || err.error || "Something went wrong")
                if (err.message === 'Already clocked in') {
                    // Force refresh to sync state
                    window.location.reload()
                }
                setStatus(isIn ? 'IDLE' : 'ACTIVE')
            }
        } catch {
            setStatus(isIn ? 'IDLE' : 'ACTIVE')
            toast.error("Connection error. Please try again.")
        }
    }, [status, token, clockType, fetchLiveData])

    const attendancePercent = Math.min(100, Math.round(((summary.daysWorked || 0) / 5) * 100))
    const firstName = (userData?.name || user?.name || "Employee").split(" ")[0]
    const roleName = (typeof userData?.role === 'string' ? userData.role : userData?.role?.name || user?.role || 'Employee').replace(/_/g, ' ')
    const initials = (userData?.name || user?.name || "EM").substring(0, 2).toUpperCase()

    // Monthly presence pulse — use real API data
    const monthlyStats = monthlySummary

    return (
        <div className="min-h-screen bg-[#F4F6FA]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:px-8">

                {/* ── ALERTS MOVED TO NOTIFICATION BELL ── */}


                {/* ── PAGE HEADER ── */}
                <div className="mb-7 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {liveTime ? format(liveTime, "EEEE, MMMM dd, yyyy") : ""}
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {greeting},{" "}
                            <span className="text-indigo-600">{firstName}</span>
                            {status === 'ACTIVE' && (
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase tracking-widest ml-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </motion.span>
                            )}
                        </h1>
                    </div>
                    {liveTime && (
                        <div className="hidden md:flex items-baseline gap-1 bg-white rounded-2xl px-5 py-2.5 border border-slate-100 shadow-sm">
                            <span className="text-2xl font-bold tabular-nums text-slate-900 tracking-tighter">
                                {format(liveTime, "hh:mm")}
                            </span>
                            <span className="text-base font-bold tabular-nums text-indigo-500 tracking-tighter">
                                :{format(liveTime, "ss")}
                            </span>
                            <div className="ml-1 flex flex-col items-start">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {format(liveTime, "a")}
                                </span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-0.5">
                                    IST
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ════ LEFT COLUMN ════ */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-5">

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-14 h-14 border-2 border-indigo-50 shrink-0">
                                    <AvatarImage src={userData?.avatarUrl || user?.image} className="object-cover" />
                                    <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base font-bold text-slate-900 truncate leading-tight">
                                        {userData?.name || user?.name || "Employee"}
                                    </h2>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                        {roleName}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full",
                                            status === 'ACTIVE'
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-slate-50 text-slate-400"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                            {status === 'ACTIVE' ? "On Shift" : "Off Shift"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">Company</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 truncate ml-2 max-w-[120px]">
                                    {user?.companyName || 'My Company'}
                                </span>
                            </div>
                        </div>

                        {/* Clock In/Out Card */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                            {/* Top label */}
                            <div className="px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Shift Timer</span>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        status === 'ACTIVE' ? "bg-emerald-400 animate-pulse" : "bg-slate-700"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest",
                                        status === 'ACTIVE' ? "text-emerald-400" : "text-slate-600"
                                    )}>
                                        {status === 'ACTIVE' ? "Active" : "Idle"}
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-6 space-y-5">
                                {/* Timer */}
                                <div className="text-center select-none">
                                    <div className="flex items-center justify-center gap-1">
                                        {[timerParts.h, timerParts.m, timerParts.s].map((part, i) => (
                                            <div key={i} className="flex items-center gap-1">
                                                <span className={cn(
                                                    "text-[44px] font-bold tabular-nums leading-none tracking-tighter",
                                                    i === 2 ? "text-indigo-400" : "text-white"
                                                )}>
                                                    {part}
                                                </span>
                                                {i < 2 && <span className="text-2xl font-bold text-slate-700 leading-none self-start pt-2">:</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                                        HH · MM · SS
                                    </p>
                                </div>

                                {/* Mode selector */}
                                <AnimatePresence>
                                    {status === 'IDLE' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-slate-800 rounded-xl p-1 flex gap-1"
                                        >
                                            {(['IN_OFFICE', 'REMOTE'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setClockType(type)}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                                        clockType === type
                                                            ? "bg-white text-slate-900 shadow-sm"
                                                            : "text-slate-500 hover:text-slate-300"
                                                    )}
                                                >
                                                    {type === 'IN_OFFICE' ? 'Office' : 'Remote'}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Clock button */}
                                <button
                                    onClick={handleClock}
                                    disabled={status === 'LOADING'}
                                    id="clock-btn"
                                    className={cn(
                                        "w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                                        status === 'ACTIVE'
                                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                    )}
                                >
                                    {status === 'LOADING'
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : status === 'ACTIVE'
                                            ? <><StopCircle className="w-4 h-4" /> Clock Out</>
                                            : <><LogIn className="w-4 h-4" /> Clock In</>
                                    }
                                </button>

                                {status === 'ACTIVE' && startTime && (
                                    <p className="text-center text-[9px] text-slate-600 font-semibold">
                                        Session started at {format(new Date(startTime), 'hh:mm a')}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ════ RIGHT COLUMN ════ */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                        {/* ── WEEKLY STATS CARDS ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Total Hours */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Hours</p>
                                    <p className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">{summary.totalHours || '0'}<span className="text-lg font-bold text-slate-400 ml-0.5">h</span></p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">This week</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                </div>
                            </motion.div>

                            {/* Attendance Rate */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Attendance Rate</p>
                                    <p className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">{attendancePercent}<span className="text-lg font-bold text-slate-400 ml-0.5">%</span></p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">Weekly target</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                            </motion.div>

                            {/* Days Worked */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Days Worked</p>
                                    <p className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">{summary.daysWorked || 0}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">This week</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <BarChart3 className="w-5 h-5 text-amber-500" />
                                </div>
                            </motion.div>
                        </div>



                        {/* Weekly Calendar */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">This Week</h3>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your attendance overview</p>
                                </div>
                                <Link href="/attendance">
                                    <button className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider transition-colors">
                                        View All <ChevronRight className="w-3 h-3" />
                                    </button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {weekDays.map((day, idx) => {
                                    const isToday = isSameDay(day, mounted ? new Date() : new Date("2026-03-24"))
                                    const dayData = summary.chartData?.find((d: any) =>
                                        format(new Date(d.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                    )
                                    const hasHours = dayData?.hours > 0
                                    return (
                                        <div key={idx} className={cn(
                                            "flex flex-col items-center py-3 px-1 rounded-xl border transition-all",
                                            isToday
                                                ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200"
                                                : hasHours
                                                    ? "bg-emerald-50 border-emerald-100"
                                                    : "bg-slate-50 border-transparent"
                                        )}>
                                            <p className={cn(
                                                "text-[9px] font-bold uppercase tracking-widest mb-1.5",
                                                isToday ? "text-indigo-200" : "text-slate-400"
                                            )}>
                                                {format(day, 'eee')}
                                            </p>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isToday ? "text-white" : "text-slate-800"
                                            )}>
                                                {format(day, 'dd')}
                                            </span>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full mt-1.5",
                                                hasHours
                                                    ? "bg-emerald-400"
                                                    : isToday
                                                        ? "bg-indigo-300"
                                                        : "bg-slate-200"
                                            )} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900">Quick Access</h3>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">4 modules</span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    {
                                        label: "Leave Request",
                                        sub: "Time-Off Management",
                                        icon: Calendar,
                                        color: "text-amber-600",
                                        bg: "bg-amber-50",
                                        border: "hover:border-amber-200",
                                        link: "/leave"
                                    },
                                    {
                                        label: "Earnings Hub",
                                        sub: "Payslips & Salary",
                                        icon: BarChart3,
                                        color: "text-emerald-600",
                                        bg: "bg-emerald-50",
                                        border: "hover:border-emerald-200",
                                        link: "/payslip"
                                    },
                                    {
                                        label: "Help Desk",
                                        sub: "Raise an Incident",
                                        icon: Target,
                                        color: "text-indigo-600",
                                        bg: "bg-indigo-50",
                                        border: "hover:border-indigo-200",
                                        link: "/help"
                                    },
                                    {
                                        label: "Policy & Docs",
                                        sub: "Company Handbook",
                                        icon: ShieldCheck,
                                        color: "text-violet-600",
                                        bg: "bg-violet-50",
                                        border: "hover:border-violet-200",
                                        link: "/policies"
                                    },
                                ].map((hub, i) => (
                                    <Link key={i} href={hub.link}>
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "bg-white rounded-2xl border border-slate-100 p-4 cursor-pointer transition-all hover:shadow-md",
                                                hub.border
                                            )}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                                                hub.bg
                                            )}>
                                                <hub.icon className={cn("w-4 h-4", hub.color)} />
                                            </div>
                                            <h4 className="text-[12px] font-bold text-slate-900 leading-tight">{hub.label}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{hub.sub}</p>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
