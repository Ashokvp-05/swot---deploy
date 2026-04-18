"use client"

import { useState, useEffect, useMemo } from "react"
import { 
    Users, Clock, Calendar, FileText, CheckCircle2, 
    XCircle, Clock8, Activity, BarChart3, Building2, 
    Bell, Search, MoreHorizontal, Download, ArrowUpRight,
    ArrowDownRight, Check, X, ShieldAlert, GraduationCap,
    UserPlus, Briefcase, Megaphone, Plus, Shield,
    Radio, Activity as Pulse, Zap, ChevronRight, Monitor
} from "lucide-react"
import Link from "next/link"
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
            
            {/* Top header removed to favor global sticky frame */}

            {/* 2. OVERVIEW METRICS */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-indigo-600">Quick Stats</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                    { label: "Total Employees", value: stats?.total ?? "...", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Present Now", value: stats?.present ?? "...", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Absent Today", value: stats?.absent ?? "...", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "On Leave", value: stats?.onLeave ?? "...", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Awaiting Review", value: stats?.pendingLeaves ?? "...", icon: Clock8, color: "text-violet-600", bg: "bg-violet-50" },
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

            {/* 3. EMPLOYEE DISTRIBUTION */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white flex items-center gap-4">
                            Employee <span className="text-indigo-600">Distribution</span>
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Organizational Overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-slate-100 to-transparent dark:via-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Status</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "Employees", key: "employee", navTarget: "onboarding", icon: GraduationCap, color: "from-indigo-600 to-blue-500", glow: "indigo" },
                        { label: "HR Managers", key: "hr", navTarget: "payroll", icon: Shield, color: "from-emerald-600 to-teal-500", glow: "emerald" },
                        { label: "System Auditors", key: "auditor", navTarget: "reports", icon: BarChart3, color: "from-amber-600 to-orange-500", glow: "amber" },
                        { label: "Technical Support", key: "support", navTarget: "documents", icon: Radio, color: "from-rose-600 to-pink-500", glow: "rose" },
                    ].map((role, i) => {
                        const count = stats?.roleDistribution?.[role.key] || 0;
                        return (
                            <motion.div
                                key={role.key}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-20",
                                    role.glow === "indigo" ? "from-indigo-600/50" : 
                                    role.glow === "emerald" ? "from-emerald-600/50" : 
                                    role.glow === "amber" ? "from-amber-600/50" : "from-rose-600/50"
                                )} />
                                
                                <Card className="relative p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                    <div className="flex items-start justify-between mb-10">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform",
                                            role.color
                                        )}>
                                            <role.icon className="w-7 h-7" />
                                        </div>
                                        <div className="text-right">
                                            <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">Operational</Badge>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic">Unique Node Type</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">{role.label}</h4>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{count}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(x => (
                                                <div key={x} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                </div>
                                            ))}
                                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-900 flex items-center justify-center text-[7px] font-black text-white">+</div>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate?.(role.navTarget)}
                                            className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                                        >
                                            Open Control Center
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
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
                    <Link href="/history">
                        <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                            History Log <ChevronRight className="w-3 h-3" />
                        </button>
                    </Link>
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
