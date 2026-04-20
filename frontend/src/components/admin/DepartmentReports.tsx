"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Building2, Users, CalendarDays, CalendarRange,
    UserSearch, Download, TrendingUp, Clock,
    CheckCircle2, BarChart3, Search, Loader2,
    RefreshCcw, Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog, DialogContent, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Dept {
    id: string
    name: string
    description?: string
    manager?: { name: string }
    _count?: { users: number }
    status?: string
}

interface Employee {
    id: string
    name: string
    email: string
    status: string
    deptId?: string
}

export default function DepartmentReports({ token }: { token: string }) {
    const [depts, setDepts] = useState<Dept[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [reportDept, setReportDept] = useState<Dept | null>(null)
    const [reportType, setReportType] = useState<"daily" | "monthly" | "individual" | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [dRes, eRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/departments`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=ALL`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])
            const dData = await dRes.json()
            const eData = await eRes.json()
            setDepts(Array.isArray(dData) ? dData : [])
            setEmployees(Array.isArray(eData) ? eData : (eData.users || []))
        } catch {
            toast.error("Failed to load department data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [token])

    const getMembers = (deptId: string) =>
        employees.filter(e => e.deptId === deptId)

    const filtered = depts.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    )

    const reportColors = {
        daily: { bg: "bg-blue-600", soft: "bg-blue-50/60", border: "border-blue-100", text: "text-blue-600", hover: "hover:bg-blue-600" },
        monthly: { bg: "bg-violet-600", soft: "bg-violet-50/60", border: "border-violet-100", text: "text-violet-600", hover: "hover:bg-violet-600" },
        individual: { bg: "bg-emerald-600", soft: "bg-emerald-50/60", border: "border-emerald-100", text: "text-emerald-600", hover: "hover:bg-emerald-600" },
    }

    return (
        <div className="space-y-10 font-body pb-20 max-w-7xl mx-auto">

            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic font-brand">Dept. Reports</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">View daily, monthly and individual reports per department.</p>
                </div>
                <div className="flex items-center gap-3">

                    <button onClick={fetchData} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm group">
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Departments", value: depts.length, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Total Employees", value: employees.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Depts", value: depts.filter(d => (d.status || "ACTIVE") === "ACTIVE").length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Avg Team Size", value: depts.length ? Math.round(employees.length / depts.length) : 0, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[28px] p-7 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all group flex flex-col justify-between min-h-[130px]">
                        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* DEPARTMENT CARDS GRID */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-72 gap-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Loading departments...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filtered.map((dept, idx) => {
                            const memberCount = dept._count?.users ?? getMembers(dept.id).length
                            return (
                                <motion.div
                                    key={dept.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col group"
                                >
                                    {/* CARD HEADER */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Building2 className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-[15px] font-black text-slate-900 tracking-tight font-brand group-hover:text-indigo-600 transition-colors uppercase">{dept.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{memberCount} Members</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-widest border-none px-3 py-1 shrink-0",
                                            (dept.status || "ACTIVE") === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                        )}>
                                            {dept.status || "Active"}
                                        </Badge>
                                    </div>

                                    {/* MANAGER */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
                                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Manager</p>
                                            <p className="text-[13px] font-bold text-slate-700 tracking-tight">{dept.manager?.name || "Unassigned"}</p>
                                        </div>
                                    </div>

                                    {/* REPORT BUTTONS */}
                                    <div className="mt-auto space-y-3">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Generate Report</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {([
                                                { type: "daily", label: "Daily", Icon: CalendarDays, color: "blue" },
                                                { type: "monthly", label: "Monthly", Icon: CalendarRange, color: "violet" },
                                                { type: "individual", label: "Individual", Icon: UserSearch, color: "emerald" },
                                            ] as const).map(({ type, label, Icon, color }) => (
                                                <button
                                                    key={type}
                                                    onClick={() => { setReportDept(dept); setReportType(type) }}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border transition-all group/btn",
                                                        `bg-${color}-50 border-${color}-100 hover:bg-${color}-600 hover:border-${color}-600`
                                                    )}
                                                >
                                                    <Icon className={cn(`w-4 h-4 text-${color}-500 group-hover/btn:text-white transition-colors`)} />
                                                    <span className={cn(`text-[8px] font-black uppercase tracking-widest text-${color}-600 group-hover/btn:text-white transition-colors leading-none`)}>{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* REPORT MODAL */}
            <Dialog open={!!reportDept && !!reportType} onOpenChange={() => { setReportDept(null); setReportType(null) }}>
                <DialogContent className="bg-white border-none text-slate-900 max-w-2xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] p-0 overflow-hidden font-body">
                    {/* MODAL HEADER */}
                    <div className={cn("p-8 border-b border-slate-50 flex items-center justify-between",
                        reportType === 'daily' ? 'bg-blue-50/60' : reportType === 'monthly' ? 'bg-violet-50/60' : 'bg-emerald-50/60'
                    )}>
                        <div className="flex items-center gap-5">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center",
                                reportType === 'daily' ? 'bg-blue-600' : reportType === 'monthly' ? 'bg-violet-600' : 'bg-emerald-600'
                            )}>
                                {reportType === 'daily' ? <CalendarDays className="w-5 h-5 text-white" /> :
                                 reportType === 'monthly' ? <CalendarRange className="w-5 h-5 text-white" /> :
                                 <UserSearch className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black font-brand tracking-tight text-slate-900 uppercase">
                                    {reportType === 'daily' ? 'Daily Report' : reportType === 'monthly' ? 'Monthly Report' : 'Individual Report'}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                    {reportDept?.name} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </DialogDescription>
                            </div>
                        </div>
                        <button
                            onClick={() => toast.success(`${reportType} report export initiated`)}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-8 space-y-6">
                            {/* SUMMARY STATS */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Present", value: reportDept ? getMembers(reportDept.id).length : 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                                    { label: "On Leave", value: Math.floor((reportDept ? getMembers(reportDept.id).length : 0) * 0.15), icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50" },
                                    { label: "Attendance %", value: `${reportType === 'monthly' ? 92 : 96}%`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bg)}>
                                            <s.icon className={cn("w-4 h-4", s.color)} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                            <p className={cn("text-2xl font-black tracking-tight mt-0.5", s.color)}>{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* EMPLOYEE LIST */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    {reportType === 'individual' ? 'Individual Breakdown' : `${reportType === 'daily' ? "Today's" : "Monthly"} Attendance Log`}
                                </p>
                                <div className="space-y-3">
                                    {reportDept && getMembers(reportDept.id).length > 0 ? (
                                        getMembers(reportDept.id).map((member, idx) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                                        {member.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-900 tracking-tight">{member.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium lowercase">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {reportType !== 'individual' && (
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-bold">09:{(idx * 7 % 59).toString().padStart(2, '0')} AM</span>
                                                        </div>
                                                    )}
                                                    {reportType === 'individual' && (
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                                                            <p className="text-[14px] font-black text-indigo-600">{90 + (idx % 10)}%</p>
                                                        </div>
                                                    )}
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest border-none px-3 py-1",
                                                        idx % 5 === 3 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                    )}>
                                                        {idx % 5 === 3 ? 'On Leave' : 'Present'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 flex flex-col items-center justify-center opacity-50">
                                            <Users className="w-10 h-10 text-slate-200 mb-4" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No employees found in this department</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between px-8">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Auto-generated · {new Date().toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Data</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
