"use client"

import { useEffect, useState } from "react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import {
    Users, Clock, Calendar, ChevronRight, Loader2, RefreshCw, 
    Settings, CheckCircle2, FileText, Check, TrendingUp,
    Shield, Activity, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const API = process.env.NEXT_PUBLIC_API_URL
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const PIE_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#A855F7", "#3B82F6", "#EC4899", "#F43F5E"];

export default function ExecutiveHub({ token, hideVitals = false }: { token: string, hideVitals?: boolean }) {
    const [overview, setOverview] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [leaveData, setLeaveData] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [ovRes, stRes, lvRes, actRes] = await Promise.all([
                fetch(`${API}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/leave/all?limit=100`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
                fetch(`${API}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
            ])
            if (ovRes.ok) setOverview(await ovRes.json())
            if (stRes.ok) setStats(await stRes.json())
            if (lvRes?.ok) {
                const data = await lvRes.json()
                setLeaveData(Array.isArray(data) ? data : data.requests || [])
            }
            if (actRes?.ok) setActivities(await actRes.json().catch(() => []))
        } catch { toast.error("Failed to load analytics") }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchAll() }, [token])

    const monthlyTrend = MONTHS.map((m, i) => ({
        month: m,
        attendance: Math.floor(75 + Math.random() * 20),
        headcount: Math.floor(60 + Math.random() * 30),
    }))

    const leaveDonut = [
        { name: "Vacation Leave", value: 43, color: "#6366F1" },
        { name: "Sick Leave", value: 32, color: "#F59E0B" },
        { name: "Other", value: 25, color: "#8B5CF6" },
    ]

    const deptDist = [
        { name: "Development", count: 38, percent: 32, color: "#6366F1" },
        { name: "Marketing", count: 36, percent: 29, color: "#22C55E" },
        { name: "Sales", count: 25, percent: 27, color: "#F59E0B" },
        { name: "HR", count: 16, percent: 19, color: "#A855F7" },
        { name: "Finance", count: 15, percent: 12, color: "#3B82F6" },
    ]

    if (loading) return (
        <div className="h-[600px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Syncing Matrix...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            
            {/* Executive Internal Header removed for high-fidelity frame integration */}

            {/* ── 📊 KPI ROW (MATCHING IMAGE) ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total Employees", val: overview?.totalActiveUsers ?? stats?.totalUsers ?? 120, trend: "+ 1.8%", icon: Settings, color: "bg-indigo-50 text-indigo-600", desc: "Featured in departments" },
                    { label: "Employees Onboarding", val: overview?.hiring?.applicants ?? 8, trend: "+ 72", icon: Users, color: "bg-emerald-50 text-emerald-500", desc: "Active today" },
                    { label: "Active Employees", val: overview?.clockedIn ?? 106, trend: "- 71", icon: CheckCircle2, color: "bg-blue-50 text-blue-500", desc: "Contact activity" },
                    { label: "Pending Approvals", val: overview?.pendingApprovals ?? 5, trend: "+ 31", icon: Clock, color: "bg-amber-50 text-amber-500", desc: "2 urgent 3" },
                    { label: "Attendance Rate", val: (overview?.attendanceRate ?? 92.7) + "%", trend: "- 5%", icon: Activity, color: "bg-slate-50 text-slate-900", desc: "Data analysis" },
                ].map((k, i) => (
                    <Card key={i} className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", k.color.split(' ')[0])}>
                                <k.icon className={cn("w-6 h-6", k.color.split(' ')[1])} />
                            </div>
                            <div className="flex flex-col items-end">
                                <Badge className={cn("bg-transparent border-none font-black text-[10px]", k.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>
                                    {k.trend}
                                </Badge>
                                <div className="w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }} animate={{ width: "65%" }}
                                        className={cn("h-full rounded-full", k.trend.startsWith('+') ? "bg-emerald-500" : "bg-rose-500")} 
                                     />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">{k.val}</h4>
                            <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight pt-1">{k.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── 🗓️ MAIN CHARTS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Workforce Overview */}
                <Card className="lg:col-span-2 p-10 rounded-[3rem] border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase italic">WORKFORCE OVERVIEW</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5">MONTHLY ATTENDANCE VS LEAVE • <span className="text-slate-900">2024</span> • FAST 12 MONTHS</p>
                        </div>
                        <Button variant="ghost" className="h-10 px-6 rounded-xl bg-slate-50 text-[10px] font-black uppercase text-slate-500 gap-3 border border-slate-100">
                             Last 2 years <ChevronRight className="w-4 h-4 rotate-90" />
                        </Button>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={monthlyTrend} barGap={12}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#CBD5E1' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                            <Bar dataKey="attendance" fill="#E0E7FF" radius={[6, 6, 0, 0]} barSize={28} activeBar={{ fill: '#6366F1' }} />
                            <Bar dataKey="headcount" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Leave Breakdown */}
                <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white flex flex-col items-center overflow-hidden">
                    <div className="w-full flex items-center justify-between mb-10">
                        <h3 className="text-base font-black text-slate-900 uppercase italic">LEAVE BREAKDOWN</h3>
                        <Button variant="ghost" className="h-10 px-5 rounded-xl border border-slate-100 text-[10px] font-black uppercase text-slate-400 gap-3">
                             This Year <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative flex-1 flex flex-col items-center justify-center w-full">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={leaveDonut} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={6} dataKey="value" strokeWidth={0}>
                                    {leaveDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4 w-full px-6 mt-8">
                            {leaveDonut.map((d, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: d.color }} />
                                        <span className="text-[12px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-tight">{d.name}</span>
                                    </div>
                                    <span className="text-[13px] font-black text-slate-900">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── 🛠️ WIDGET MATRIX ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Payroll Widget */}
                <Card className="p-10 rounded-[3.5rem] border-none shadow-sm bg-white relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Payroll Status</h3>
                        <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View Details</button>
                    </div>
                    <div className="flex items-center justify-between mb-10 pb-10 border-b border-slate-50">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Processing Period</p>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-slate-900 mt-1 uppercase tracking-widest">{format(new Date(), 'd MMMM yyyy')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100/50">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100"><Check className="w-5 h-5" /></div>
                                <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{overview?.payroll?.paid || 0}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid Staff</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/50">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100"><Clock className="w-5 h-5" /></div>
                                <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{overview?.payroll?.pending || 0}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
                        </div>
                    </div>
                </Card>

                {/* Announcements Widget */}
                <Card className="p-10 rounded-[3.5rem] border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Announcements</h3>
                        <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-8">
                        {(overview?.announcements?.length > 0 ? overview.announcements : [
                            { title: "Company holiday schedule announced", createdAt: new Date().toISOString(), icon: Calendar },
                            { title: "New policy update effective next week.", createdAt: new Date().toISOString(), icon: FileText },
                        ]).map((a: any, i: number) => (
                            <div key={i} className="flex gap-5 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{a.title}</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                        {format(new Date(a.createdAt), 'do MMM')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-10 py-4 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-100 transition-all">View All</button>
                </Card>

                {/* Recent Activity Widget */}
                <Card className="p-10 rounded-[3.5rem] border-none shadow-sm bg-white relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">System Activity</h3>
                        <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Full Audit</button>
                    </div>
                    <div className="space-y-8 relative z-10">
                        {activities.slice(0, 3).map((act, i) => (
                            <div key={i} className="flex items-start gap-5">
                                <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-[11px] italic shrink-0 shadow-lg">
                                    {(act.admin?.name || 'A')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12.5px] font-bold text-slate-900 leading-tight mb-1.5 uppercase tracking-tight truncate">
                                        <span className="font-black italic text-indigo-600">{act.admin?.name?.split(' ')[0]}</span> {act.details.length > 20 ? act.details.substring(0,25)+'...' : act.details}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(act.createdAt), 'HH:mm')} Today</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── 🏢 DISTRIBUTION & HIRING ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Distribution Overview */}
                <Card className="lg:col-span-5 p-12 rounded-[4rem] border-none shadow-sm bg-white overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-base font-black text-slate-900 uppercase italic">Employee Distribution</h3>
                        <button className="text-[11px] font-black uppercase text-indigo-600 hover:border-b-2 border-indigo-600 transition-all gap-2 flex items-center">View All <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-12">
                        <div className="relative w-56 h-56 shrink-0 group">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={overview?.distribution?.length > 0 ? overview.distribution.map((d: any, i: number) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] })) : deptDist} 
                                        cx="50%" cy="50%" innerRadius={70} 
                                        outerRadius={95} paddingAngle={2} dataKey="count" strokeWidth={0}
                                    >
                                        {(overview?.distribution?.length > 0 ? overview.distribution : deptDist).map((e: any, i: number) => <Cell key={i} fill={e.color || PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                                <span className="text-4xl font-black text-slate-900 italic tracking-tighter">{overview?.totalActiveUsers || 0}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            {(overview?.distribution?.length > 0 ? overview.distribution.map((d: any, i: number) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] })) : deptDist).map((d: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: d.color }} />
                                        <span className="text-[12px] font-bold text-slate-400 capitalize group-hover:text-slate-600">{d.name}</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="text-[13px] font-black text-slate-800">{d.percent}%</span>
                                        <Badge className="bg-slate-50 text-slate-500 border-none font-black text-[10px] w-10 justify-center h-6">{d.count}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Department Performance */}
                <Card className="lg:col-span-7 p-12 rounded-[4rem] border-none shadow-sm bg-white overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-base font-black text-slate-900 uppercase italic">Department Performance</h3>
                        <Button variant="ghost" className="h-11 px-8 rounded-2xl bg-slate-50 text-[11px] font-black uppercase text-indigo-600 border border-slate-100 hover:border-indigo-200">Full Report</Button>
                    </div>
                    
                    <div className="space-y-6">
                         {/* Header labels */}
                         <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50">
                             <div className="col-span-4">Department</div>
                             <div className="col-span-2 text-center">Staff</div>
                             <div className="col-span-3 text-center">Attendance %</div>
                             <div className="col-span-3 text-center">Leave Usage</div>
                         </div>

                         {(overview?.distribution?.length > 0 ? overview.distribution : [
                             { name: 'Development', count: 38, percent: 32, attendanceRate: 89, leaveUsage: 8 },
                             { name: 'Marketing', count: 36, percent: 29, attendanceRate: 90, leaveUsage: 5 },
                             { name: 'Sales', count: 25, percent: 27, attendanceRate: 91, leaveUsage: 8 },
                             { name: 'HR', count: 16, percent: 19, attendanceRate: 93, leaveUsage: 5 },
                         ]).map((d: any, i: number) => {
                             const attRate = d.attendanceRate ?? 0;
                             const leaveDays = d.leaveUsage ?? 0;
                             return (
                                <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 items-center group">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{d.name}</span>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <Badge className="bg-slate-100 text-slate-900 border-none font-black text-[11px] h-7 px-4 rounded-xl">{d.count}</Badge>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-col items-center gap-1.5">
                                             <span className="text-[12px] font-black text-slate-900 italic tracking-tighter">{attRate}%</span>
                                             <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                 <motion.div initial={{ width: 0 }} animate={{ width: `${attRate}%` }} className="h-full bg-emerald-500 rounded-full" />
                                             </div>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-col items-center gap-1.5">
                                             <span className="text-[12px] font-black text-slate-900 italic tracking-tighter">{leaveDays} Days</span>
                                             <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                 <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(leaveDays * 10, 100)}%` }} className="h-full bg-amber-500 rounded-full" />
                                             </div>
                                        </div>
                                    </div>
                                </div>
                             )
                         })}
                    </div>

                    <div className="mt-8 flex justify-end">
                         <button className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50 px-6 py-2.5 rounded-2xl hover:text-indigo-600 transition-all">Optimize Operations</button>
                    </div>
                </Card>
            </div>

        </div>
    )
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 pb-3 border-b border-white/5">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 mb-1.5 last:mb-0">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color || p.fill }} />
                        <p className="text-[11px] font-bold text-white/80">{p.name}: <span className="font-black text-white italic">{p.value}</span></p>
                    </div>
                ))}
            </div>
        )
    }
    return null
}
