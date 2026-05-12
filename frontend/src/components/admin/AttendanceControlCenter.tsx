"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar, Users, Loader2, Download, ChevronLeft, ChevronRight,
    Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"
import {
    format, startOfDay, endOfDay, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval,
    isSameMonth, isToday
} from "date-fns"

export default function AttendanceControlCenter({ token }: { token: string }) {
    const [loading, setLoading] = useState(true)
    const [overview, setOverview] = useState<any>(null)
    const [liveSessions, setLiveSessions] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [logDeptFilter, setLogDeptFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [calendarMonth, setCalendarMonth] = useState(new Date())

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const headers = { "Authorization": `Bearer ${token}` }
            const [overviewRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/overview`, { headers }),
                fetch(`${API_BASE_URL}/users?limit=ALL`, { headers })
            ])
            if (overviewRes.ok) {
                const o = await overviewRes.json()
                setOverview(o)
                setLiveSessions(o.liveSessions || [])
            }
            if (usersRes.ok) {
                const ud = await usersRes.json()
                setAllUsers(Array.isArray(ud) ? ud : (ud?.users || []))
            }
        } catch (err) {
            console.error(err)
            if (!silent) toast.error("Connection synchronization failed")
        }
        finally { setLoading(false) }
    }, [token])

    useEffect(() => {
        fetchData()
        const iv = setInterval(() => fetchData(true), 15000)
        return () => clearInterval(iv)
    }, [fetchData])

    const handleExport = async () => {
        try {
            const now = new Date()
            const startStr = format(startOfDay(now), "yyyy-MM-dd")
            const endStr = format(endOfDay(now), "yyyy-MM-dd")
            const res = await fetch(`${API_BASE_URL}/reports/export/excel?start=${startStr}&end=${endStr}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `Attendance_Matrix_${startStr}.xlsx`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success("Intelligence report exported successfully")
            } else { toast.error("Failed to generate export") }
        } catch { toast.error("Export protocol failure") }
    }

    const sessionMap = new Map(liveSessions.map((s: any) => [s.id, s]))
    const departments = Array.from(new Set(allUsers.map((u: any) => u.department?.name).filter(Boolean)))
    const activeUsers = allUsers.filter((u: any) => u.status === 'ACTIVE')

    const processedRows = useMemo(() => {
        let rows = (activeUsers || []).map((u: any) => {
            const session = sessionMap.get(u.id)
            let status: 'Present' | 'Absent' | 'On Leave' = 'Absent'
            if (session || u.isLive) status = 'Present'
            return { ...u, session, attendanceStatus: status }
        })

        if (rows.length === 0) {
            rows = [
                { id: 'demo-1', name: 'Alexander Wright', department: { name: 'Engineering' }, designation: { name: 'Lead Dev' }, attendanceStatus: 'Present', session: { clockIn: new Date().setHours(9, 0), totalHours: 7.5 } },
                { id: 'demo-2', name: 'Sarah Jenkins', department: { name: 'Design' }, designation: { name: 'UI/UX' }, attendanceStatus: 'Present', session: { clockIn: new Date().setHours(10, 15), totalHours: 6.2 } },
                { id: 'demo-3', name: 'Michael Chen', department: { name: 'Operations' }, designation: { name: 'Manager' }, attendanceStatus: 'Absent' },
                { id: 'demo-4', name: 'Emma Watson', department: { name: 'HR' }, designation: { name: 'Lead' }, attendanceStatus: 'On Leave' },
            ]
        }

        return rows.filter((u: any) => {
            const matchesDept = logDeptFilter === 'ALL' || u.department?.name === logDeptFilter
            const matchesSearch = (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            return matchesDept && matchesSearch
        })
    }, [activeUsers, sessionMap, logDeptFilter, searchQuery])

    const displayStats = {
        total: processedRows.length,
        present: processedRows.filter((r: any) => r.attendanceStatus === 'Present').length,
        absent: processedRows.filter((r: any) => r.attendanceStatus === 'Absent').length,
        leave: processedRows.filter((r: any) => r.attendanceStatus === 'On Leave').length
    }

    const presentPct = displayStats.total > 0 ? Math.round((displayStats.present / displayStats.total) * 100) : 0

    const calStart = startOfWeek(startOfMonth(calendarMonth))
    const calEnd = endOfWeek(endOfMonth(calendarMonth))
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

    const AVATAR_COLORS: Record<string, string> = {
        A: 'from-indigo-500 to-blue-600',
        B: 'from-emerald-500 to-teal-600',
        C: 'from-rose-500 to-pink-600',
        D: 'from-amber-500 to-orange-600',
        E: 'from-violet-500 to-purple-600',
        F: 'from-cyan-500 to-sky-600',
    }
    const getGradient = (name: string) => AVATAR_COLORS[name?.[0]?.toUpperCase()] || 'from-slate-500 to-slate-700'

    const statCards = [
        {
            label: "Total Workforce",
            value: displayStats.total,
            icon: Users,
            gradient: "from-indigo-500 to-blue-600",
            lightBg: "bg-indigo-50",
            textColor: "text-indigo-600",
            border: "border-indigo-100",
            glow: "shadow-indigo-100",
            badge: "LIVE"
        },
        {
            label: "Active Now",
            value: displayStats.present,
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-green-600",
            lightBg: "bg-emerald-50",
            textColor: "text-emerald-600",
            border: "border-emerald-100",
            glow: "shadow-emerald-100",
            badge: `${presentPct}%`
        },
        {
            label: "Absent Today",
            value: displayStats.absent,
            icon: XCircle,
            gradient: "from-rose-500 to-red-600",
            lightBg: "bg-rose-50",
            textColor: "text-rose-600",
            border: "border-rose-100",
            glow: "shadow-rose-100",
            badge: null
        },
        {
            label: "On Leave",
            value: displayStats.leave,
            icon: AlertCircle,
            gradient: "from-amber-400 to-orange-500",
            lightBg: "bg-amber-50",
            textColor: "text-amber-600",
            border: "border-amber-100",
            glow: "shadow-amber-100",
            badge: null
        },
    ]

    return (
        <div className="space-y-8">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Control</h1>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-12">
                        Real-time workforce monitoring &nbsp;·&nbsp;
                        <span className="text-emerald-500">Synced</span>
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2.5 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>

            {/* ── PREMIUM STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                        className={cn(
                            "relative bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-default",
                            stat.border, stat.glow
                        )}
                    >
                        {/* Soft gradient accent top-right */}
                        <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br", stat.gradient)} />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br text-white", stat.gradient)}>
                                <stat.icon className="w-5 h-5" strokeWidth={2} />
                            </div>
                            {stat.badge && (
                                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg", stat.lightBg, stat.textColor)}>
                                    {stat.badge}
                                </span>
                            )}
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-1 relative z-10">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none relative z-10">{stat.value}</h3>

                        {/* Bottom progress bar */}
                        <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden relative z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: displayStats.total > 0 ? `${(stat.value / displayStats.total) * 100}%` : '0%' }}
                                transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
                                className={cn("h-full rounded-full bg-gradient-to-r", stat.gradient)}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex flex-col lg:flex-row gap-7 w-full items-stretch">

                {/* Left: Attendance Log */}
                <div className="flex-1 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm min-w-0">

                    {/* Card Header */}
                    <div className="px-8 pt-7 pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-[15px] font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                                <Clock className="w-4.5 h-4.5 text-indigo-500" strokeWidth={2.5} />
                                Attendance Log
                                {loading && (
                                    <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[9px] font-black uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                                        Syncing
                                    </span>
                                )}
                            </h2>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                                Live personnel synchronization data
                            </p>
                        </div>
                    </div>

                    {/* Filter Command Bar */}
                    <div className="px-8 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[12px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={logDeptFilter}
                                onChange={e => setLogDeptFilter(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-bold text-slate-600 focus:outline-none cursor-pointer uppercase tracking-wider"
                            >
                                <option value="ALL">All Departments</option>
                                {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">Personnel</th>
                                    <th className="text-left px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">Clock In</th>
                                    <th className="text-left px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">Hours</th>
                                    <th className="text-left px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Database...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : processedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-slate-300" />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-400">No personnel found matching current parameters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : processedRows.map((user: any, idx: number) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={user.id}
                                            className="group hover:bg-slate-50/80 transition-colors duration-150"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0",
                                                        getGradient(user.name)
                                                    )}>
                                                        {user.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">{user.name}</div>
                                                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                                            {user.department?.name || "Unassigned"} · {user.designation?.name || "Staff"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[12px] font-bold text-slate-700">
                                                        {user.session?.clockIn ? format(new Date(user.session.clockIn), 'HH:mm') : '--:--'}
                                                    </span>
                                                    <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: user.session?.clockIn ? '100%' : '0%' }}
                                                            transition={{ duration: 0.8, delay: idx * 0.03 }}
                                                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[12px] font-black text-slate-600 font-mono tabular-nums">
                                                    {user.session?.totalHours ? `${user.session.totalHours.toFixed(1)}h` : '0.0h'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    user.attendanceStatus === 'Present'
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : user.attendanceStatus === 'On Leave'
                                                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                            : "bg-rose-50 text-rose-700 border border-rose-100"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full",
                                                        user.attendanceStatus === 'Present' ? "bg-emerald-400 animate-pulse" :
                                                            user.attendanceStatus === 'On Leave' ? "bg-amber-400" : "bg-rose-400"
                                                    )} />
                                                    {user.attendanceStatus}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Calendar + Sync Card */}
                <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-5">

                    {/* Calendar */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[14px] font-black text-slate-800 tracking-tight">Timeline</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(calendarMonth, 'MMMM yyyy')}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase py-1.5">{d}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {calDays.map((day, i) => {
                                const inMonth = isSameMonth(day, calendarMonth)
                                const todayDay = isToday(day)
                                return (
                                    <div key={i} className="aspect-square flex items-center justify-center">
                                        <button
                                            disabled={!inMonth}
                                            className={cn(
                                                "w-full h-full flex items-center justify-center text-[11px] font-bold rounded-lg transition-all duration-200",
                                                !inMonth ? "text-slate-200 cursor-default" :
                                                    todayDay
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                            )}
                                        >
                                            {day.getDate()}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Synced</span>
                            </div>
                        </div>
                    </div>

                    {/* Sync Protocol Card */}
                    <div className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 shadow-xl shadow-indigo-200">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-indigo-500/30 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                </div>
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Sync Protocol</p>
                            </div>
                            <p className="text-white/60 text-[11px] font-medium mt-3 leading-relaxed">
                                Ensure all operational personnel are synchronized with the system time.
                            </p>
                            <button
                                onClick={() => fetchData()}
                                className="mt-5 w-full bg-white text-indigo-700 font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all duration-200 shadow-sm"
                            >
                                Force Synchronization
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
