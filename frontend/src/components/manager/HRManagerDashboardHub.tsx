"use client"

import { useState, useEffect, useMemo } from "react"
import { 
    Users, Clock, Calendar, FileText, CheckCircle2, 
    XCircle, Clock8, Activity, BarChart3, Building2, 
    Bell, Search, MoreHorizontal, Download, ArrowUpRight,
    ArrowDownRight, Check, X, ShieldAlert, GraduationCap,
    UserPlus, Briefcase, Megaphone, Plus, Shield,
    Radio, Activity as Pulse, Zap
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"
import { toast } from "sonner"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import UserProfileView from "@/components/admin/UserProfileView"

interface ManagerDashboardProps {
    token: string
    onNavigate?: (tab: string) => void
}

export default function HRManagerDashboardHub({ token, onNavigate }: ManagerDashboardProps) {
    const [stats, setStats] = useState<any>(null)
    const [attendance, setAttendance] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncTime, setSyncTime] = useState(new Date())
    const [selectedUser, setSelectedUser] = useState<any>(null)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const headers = { Authorization: `Bearer ${token}` }
            const [statsRes, overviewRes, leaveRes, employeeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/admin/overview`, { headers }),
                fetch(`${API_BASE_URL}/admin/leave-requests`, { headers }),
                fetch(`${API_BASE_URL}/admin/employees?limit=ALL`, { headers })
            ])

            if (statsRes.ok && overviewRes.ok && leaveRes.ok && employeeRes.ok) {
                const statsData = await statsRes.json()
                const overviewData = await overviewRes.json()
                const leaveData = await leaveRes.json()
                const employeeData = await employeeRes.json()

                const totalPersonnel = statsData.totalUsers || employeeData.pagination?.total || 0
                const activeNow = overviewData.clockedIn || 0

                setStats({
                    total: totalPersonnel,
                    present: activeNow,
                    absent: Math.max(0, totalPersonnel - activeNow),
                    onLeave: Array.isArray(leaveData) 
                        ? leaveData.filter((l: any) => l.status === 'APPROVED' && new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length 
                        : 0,
                    pendingLeaves: overviewData.pendingApprovals || (Array.isArray(leaveData) ? leaveData.filter((l: any) => l.status === 'PENDING').length : 0)
                })

                // Manifest real attendance data for the Presence Matrix
                setAttendance(overviewData.remoteUsers || [])
                setSyncTime(new Date())
                
                if (overviewData.recentActivity?.length > 0) {
                    setActivities(overviewData.recentActivity.map((a: any) => ({
                        user: a.admin?.name || 'System',
                        time: format(new Date(a.createdAt), 'HH:mm'),
                        detail: a.details || a.action,
                        type: a.action
                    })))
                }
            }
        } catch (error) {
            console.error("Dashboard Sync Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchAll()
        const interval = setInterval(fetchAll, 30000) // High-frequency 30s sync
        return () => clearInterval(interval)
    }, [token])

    return (
        <div className="space-y-12 pb-24 font-body">
            
            {/* 1. DASHBOARD OVERVIEW SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-50 dark:border-white/5">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Dash<span className="text-indigo-600">board</span></h2>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1">Shard Integrity: Optimal</Badge>
                        <div className="flex items-center gap-2">
                            <Activity className={cn("w-3 h-3 text-indigo-400", loading && "animate-spin")} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Sync: {format(syncTime, 'HH:mm:ss')}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <button 
                        onClick={() => {
                            const win = window as any;
                            if(win.setIsAddEmployeeOpen) win.setIsAddEmployeeOpen(true);
                        }}
                        className="px-6 py-2.5 rounded-[14px] bg-slate-900 text-[10px] font-black uppercase text-white tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Initialize Personnel
                    </button>
                    <button 
                         onClick={() => { fetchAll(); toast.success("Real-time Matrix Synchronized") }}
                         className="p-2.5 rounded-[14px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all active:scale-90"
                    >
                         <Zap className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 2. STATISTICAL PERFORMANCE GRID */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-indigo-600">3. Administrative Pulse</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                    { label: "Personnel Shard", value: stats?.total ?? "...", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Active Nodes", value: stats?.present ?? "...", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Absent Shards", value: stats?.absent ?? "...", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Leave Matrix", value: stats?.onLeave ?? "...", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Pending Approvals", value: stats?.pendingLeaves ?? "...", icon: Clock8, color: "text-violet-600", bg: "bg-violet-50" },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="p-8 pb-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
                            <div className={cn("mb-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                            <h4 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic leading-none">{s.value}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2 px-0.5">{s.label}</p>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-slate-300" />
                            </div>
                        </Card>
                    </motion.div>
                ))}
                </div>
            </div>

            {/* 3. HIGH-FIDELITY PRESENCE MATRIX (REAL-TIME) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white flex items-center gap-3">
                            Presence <span className="text-indigo-600">Matrix</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Operational Stream</p>
                    </div>
                    <Button variant="ghost" onClick={() => onNavigate?.('attendance')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 gap-2 hover:bg-indigo-50">
                        View History Terminal <ChevronRight className="w-3 h-3" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {attendance.length > 0 ? (
                            attendance.map((person, i) => (
                                <motion.div
                                    key={person.id || i}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedUser(person)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-500 flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-inner group-hover:bg-indigo-50 transition-colors">
                                                    <span className="text-lg font-black text-indigo-600 uppercase font-brand italic">{person.name?.[0]}{person.name?.[1]}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{person.name || 'Personnel'}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Unit</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-black text-indigo-600 italic leading-none">{format(syncTime, 'HH:mm')}</p>
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1 leading-none">Synced</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50/50 border-slate-100 dark:bg-black/20 dark:border-white/10 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">Remote</Badge>
                                            <div className="flex items-center gap-2.5">
                                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic animate-pulse">Operational</p>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Placeholder matrix shard (matching user screenshot)
                            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] bg-slate-50/20">
                                <Radio className="w-10 h-10 text-slate-200 mb-4 animate-pulse" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Global Presence Shard: Searching Personnel...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 4. OPERATIONAL ACTIVITY STRIP (REAL-TIME) */}
            <Card className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-5 mb-10 overflow-x-auto no-scrollbar">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                         <Pulse className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col flex-shrink-0">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white leading-none">Operational Stream</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Activity Manifest</p>
                    </div>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 min-w-[100px]" />
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                        History Log <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pr-2">
                    {activities.map((act, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-5 p-5 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-50 dark:border-white/5 group hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex flex-col gap-2 shrink-0">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                </div>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter text-center">{act.time}</span>
                            </div>
                            <div className="min-w-0 pr-2 pb-1">
                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate italic">{act.user}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight font-medium">{act.detail}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* HIGH-FIDELITY PROFILE OVERLAY */}
            <AnimatePresence mode="wait">
                {selectedUser && (
                    <UserProfileView 
                        user={selectedUser} 
                        token={token} 
                        onClose={() => setSelectedUser(null)} 
                    />
                )}
            </AnimatePresence>

        </div>
    )
}

import { ChevronRight, Monitor } from "lucide-react"
