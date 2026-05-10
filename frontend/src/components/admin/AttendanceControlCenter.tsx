"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar, Users, Loader2, Download, ChevronLeft, ChevronRight, 
    Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle
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

    // Data Processing
    const sessionMap = new Map(liveSessions.map((s: any) => [s.id, s]))
    const departments = Array.from(new Set(allUsers.map((u: any) => u.department?.name).filter(Boolean)))
    const activeUsers = allUsers.filter((u: any) => u.status === 'ACTIVE')
    
    const attendanceRows = activeUsers
        .map((u: any) => {
            const session = sessionMap.get(u.id)
            let status: 'Present' | 'Absent' | 'On Leave' = 'Absent'
            if (session || u.isLive) status = 'Present'
            return { ...u, session, attendanceStatus: status }
        })
        .filter((u: any) => {
            const matchesDept = logDeptFilter === 'ALL' || u.department?.name === logDeptFilter
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 u.email.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesDept && matchesSearch
        })

    const totalStaff = overview?.totalActiveUsers ?? activeUsers.length
    const checkedIn = overview?.clockedIn ?? 0
    const absent = Math.max(0, totalStaff - checkedIn)
    const onLeave = overview?.pendingApprovals ?? 0

    // Calendar logic
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

    return (
        <div className="space-y-8">
            {/* ── Stat Cards Matrix ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Operational Force", value: totalStaff, icon: Users, color: "text-white", bg: "bg-slate-900/50", border: "border-slate-800" },
                    { label: "Active Personnel", value: checkedIn, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "Zero Signature", value: absent, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                    { label: "Extended Leave", value: onLeave, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={cn(
                            "relative overflow-hidden p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10",
                            stat.bg, stat.border
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Status</div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</div>
                            <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{stat.label}</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 opacity-[0.03] scale-150 rotate-12">
                            <stat.icon className="w-24 h-24 text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Main Operations Hub ── */}
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left: Deployment Log */}
                <div className="flex-1 bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Header Protocol */}
                    <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                <Clock className="w-6 h-6 text-indigo-500" />
                                Deployment Log
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Real-time personnel synchronization data</p>
                        </div>
                        <Button 
                            onClick={handleExport} 
                            variant="outline" 
                            className="bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl h-12 px-6 gap-2 transition-all duration-300"
                        >
                            <Download className="w-4 h-4" /> Export Matrix
                        </Button>
                    </div>

                    {/* Filter Command Bar */}
                    <div className="px-8 py-6 flex flex-wrap items-center gap-4 border-b border-slate-800/50 bg-white/[0.02]">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Search personnel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <select 
                                    value={logDeptFilter} 
                                    onChange={e => setLogDeptFilter(e.target.value)}
                                    className="bg-transparent border-none text-sm text-slate-300 focus:outline-none cursor-pointer pr-4"
                                >
                                    <option value="ALL">All Departments</option>
                                    {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* High-Fidelity Data Grid */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="text-left px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronization</th>
                                    <th className="text-left px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operations</th>
                                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Current State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accessing Secure Database...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : attendanceRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-slate-500 text-sm italic font-medium">
                                                No personnel found matching current parameters.
                                            </td>
                                        </tr>
                                    ) : attendanceRows.map((user: any, idx: number) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={user.id} 
                                            className="group hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform duration-500",
                                                        getGradient(user.name)
                                                    )}>
                                                        {user.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                                            {user.department?.name || "Unassigned"} • {user.designation?.name || "Staff"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-300">
                                                            {user.session?.clockIn ? format(new Date(user.session.clockIn), 'HH:mm') : '--:--'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Entry</span>
                                                    </div>
                                                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            user.session?.clockIn ? "w-full bg-emerald-500" : "w-0"
                                                        )} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-slate-400 text-xs font-mono">
                                                {user.session?.totalHours ? `${user.session.totalHours.toFixed(1)}h` : '0.0h'}
                                            </td>
                                            <td className="px-8 py-5 text-right sm:text-left">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    user.attendanceStatus === 'Present' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                    user.attendanceStatus === 'On Leave' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                    "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                                                        user.attendanceStatus === 'Present' ? "bg-emerald-400" :
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

                {/* Right: Temporal Interface (Calendar) */}
                <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl">
                        {/* Temporal Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Timeline</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{format(calendarMonth, 'MMMM yyyy')}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                    variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-indigo-600 transition-all text-slate-400 hover:text-white"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button 
                                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                    variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-indigo-600 transition-all text-slate-400 hover:text-white"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-black text-slate-600 uppercase tracking-widest py-2">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calDays.map((day, i) => {
                                const inMonth = isSameMonth(day, calendarMonth)
                                const todayDay = isToday(day)
                                return (
                                    <div key={i} className="aspect-square flex flex-col items-center justify-center relative">
                                        <button 
                                            disabled={!inMonth}
                                            className={cn(
                                                "w-full h-full flex items-center justify-center text-xs font-bold rounded-2xl transition-all duration-300",
                                                !inMonth ? "text-slate-800 cursor-default" :
                                                todayDay ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110" :
                                                "text-slate-400 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {day.getDate()}
                                        </button>
                                        {inMonth && Math.random() > 0.8 && !todayDay && (
                                            <div className="absolute bottom-2 w-1 h-1 rounded-full bg-indigo-500/50" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Node</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synced</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Protocol */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Sync Protocol</h4>
                            <p className="text-indigo-100 text-xs font-medium opacity-80 mb-6 leading-relaxed">Ensure all operational personnel are synchronized with the central hive.</p>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]">
                                Force Synchronization
                            </Button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-125 transition-transform duration-700">
                            <Clock className="w-40 h-40" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
