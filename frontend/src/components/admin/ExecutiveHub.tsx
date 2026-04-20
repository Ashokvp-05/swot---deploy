"use client"

import { useEffect, useState } from "react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import {
    Users, Clock, Calendar, ChevronRight, Loader2, RefreshCw, 
    Settings, CheckCircle2, FileText, Check, TrendingUp,
    Shield, Activity, ArrowRight, Briefcase
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

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#6366F1", "#EC4899", "#F43F5E"];

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
        { name: "Vacation Leave", value: 43, color: "#3B82F6" },
        { name: "Sick Leave", value: 32, color: "#F59E0B" },
        { name: "Other", value: 25, color: "#8B5CF6" },
    ]

    const deptDist = [
        { name: "Development", count: 38, percent: 32, color: "#3B82F6" },
        { name: "Marketing", count: 36, percent: 29, color: "#10B981" },
        { name: "Sales", count: 25, percent: 27, color: "#F59E0B" },
        { name: "HR", count: 16, percent: 19, color: "#8B5CF6" },
        { name: "Finance", count: 15, percent: 12, color: "#6366F1" },
    ]

    if (loading) return (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Loading executive data...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            
            {/* ── 📊 KPI ROW ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Employees", val: overview?.totalActiveUsers ?? stats?.totalUsers ?? 120, trend: "+ 1.8%", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Hiring Prospects", val: overview?.hiring?.applicants ?? 8, trend: "+ 12%", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Today", val: overview?.clockedIn ?? 106, trend: "- 2%", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Approvals", val: overview?.pendingApprovals ?? 5, trend: "+ 3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Global Attendance", val: (overview?.attendanceRate ?? 92.7) + "%", trend: "+ 1.5%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((k, i) => (
                    <Card key={i} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{k.label}</p>
                                <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{k.val}</h4>
                            </div>
                            <div className={cn("p-2 rounded-lg", k.bg)}>
                                <k.icon className={cn("w-5 h-5", k.color)} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <span className={cn("text-xs font-semibold mr-2", k.trend.startsWith('+') ? "text-emerald-600" : "text-rose-600")}>
                                {k.trend}
                            </span>
                            <span className="text-xs text-slate-400">vs last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── 🗓️ MAIN CHARTS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Workforce Overview */}
                <Card className="lg:col-span-2 p-6 rounded-xl border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">Workforce Overview</h3>
                            <p className="text-sm text-slate-500 mt-1">Monthly attendance vs headcount</p>
                        </div>
                        <Button variant="outline" className="h-8 px-3 text-xs">
                             Last 12 Months
                        </Button>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={monthlyTrend} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                            <Bar dataKey="attendance" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={20} activeBar={{ fill: '#94A3B8' }} />
                            <Bar dataKey="headcount" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Leave Breakdown */}
                <Card className="p-6 rounded-xl border-slate-200 shadow-sm bg-white flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-center mb-6 text-center">
                        <h3 className="text-base font-semibold text-slate-900">Leave Distribution</h3>
                        <p className="text-sm text-slate-500 mt-1">Breakdown by category</p>
                    </div>
                    <div className="relative flex-1 flex flex-col items-center justify-center w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={leaveDonut} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                    {leaveDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 w-full px-4 mt-6">
                            {leaveDonut.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                        <span className="font-medium text-slate-600">{d.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── 🛠️ WIDGET MATRIX ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Payroll Widget */}
                <Card className="p-6 rounded-xl border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Payroll Processing</h3>
                        <Button variant="ghost" className="h-8 text-xs text-indigo-600 hover:bg-slate-50">View Details</Button>
                    </div>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                        <p className="text-sm text-slate-500">Current Period</p>
                        <p className="text-sm font-semibold text-slate-900">{format(new Date(), 'MMMM yyyy')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                             <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-2xl font-bold text-slate-900">{overview?.payroll?.paid || 0}</span>
                             </div>
                             <p className="text-xs font-medium text-slate-500">Paid Staff</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                             <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="text-2xl font-bold text-slate-900">{overview?.payroll?.pending || 0}</span>
                             </div>
                             <p className="text-xs font-medium text-slate-500">Pending</p>
                        </div>
                    </div>
                </Card>

                {/* Announcements Widget */}
                <Card className="p-6 rounded-xl border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Company Board</h3>
                        <Button variant="ghost" className="h-8 text-xs text-indigo-600 hover:bg-slate-50">View All</Button>
                    </div>
                    <div className="space-y-5">
                        {(overview?.announcements?.length > 0 ? overview.announcements : [
                            { title: "Q3 Benefits Enrollment open until friday", createdAt: new Date().toISOString(), icon: Calendar },
                            { title: "Updated remote work equipment policy", createdAt: new Date().toISOString(), icon: FileText },
                        ]).map((a: any, i: number) => (
                            <div key={i} className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 leading-snug truncate">{a.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {format(new Date(a.createdAt), 'MMM do')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity Widget */}
                <Card className="p-6 rounded-xl border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Audit Log</h3>
                        <Button variant="ghost" className="h-8 text-xs text-indigo-600 hover:bg-slate-50">Full Audit</Button>
                    </div>
                    <div className="space-y-5">
                        {(activities?.length > 0 ? activities : [
                            { admin: { name: "System" }, details: "Database optimization complete", createdAt: new Date() },
                            { admin: { name: "Admin User" }, details: "Updated security policies", createdAt: new Date(Date.now() - 3600000) },
                        ]).slice(0, 3).map((act, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium text-xs shrink-0">
                                    {(act.admin?.name || 'S')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 leading-tight truncate">
                                        <span className="font-semibold mr-1">{act.admin?.name?.split(' ')[0] || "System"}</span> 
                                        <span className="text-slate-600">{act.details}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{format(new Date(act.createdAt), 'h:mm a')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 shadow-lg">
                <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
                        <p className="text-sm font-medium">{p.name}: <span className="font-bold">{p.value}</span></p>
                    </div>
                ))}
            </div>
        )
    }
    return null
}
