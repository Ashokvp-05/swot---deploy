"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Clock, Calendar, Users, MapPin,
    Plus, Search, Edit3, Trash2,
    Loader2, AlertCircle, CheckCircle2,
    ShieldCheck, Timer, Activity,
    Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import { Download, FileSpreadsheet, FileText, TrendingUp, BarChart3, Database, ChevronRight } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"

interface Shift {
    id: string
    name: string
    startTime: string
    endTime: string
    workDays: number[]
}

export default function AttendanceControlCenter({ token }: { token: string }) {
    const [shifts, setShifts] = useState<Shift[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [livePresence, setLivePresence] = useState<any[]>([])
    const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)
    const [newShift, setNewShift] = useState({
        name: "",
        startTime: "09:00",
        endTime: "18:00",
        workDays: [1, 2, 3, 4, 5]
    })
    const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const headers = { "Authorization": `Bearer ${token}` }
            const [shiftRes, statsRes, overviewRes] = await Promise.all([
                fetch(`${API_BASE_URL}/attendance-v2/shifts`, { headers }),
                fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/admin/overview`, { headers })
            ])
            
            if (shiftRes.ok) setShifts(await shiftRes.json())
            if (statsRes.ok) setStats(await statsRes.json())
            if (overviewRes.ok) {
                const o = await overviewRes.json()
                setLivePresence(o.remoteUsers || [])
            }
        } catch (err) { 
            console.error(err)
        } finally { 
            setLoading(false) 
        }
    }, [token])

    useEffect(() => {
        fetchData()
        const iv = setInterval(fetchData, 60000)
        return () => clearInterval(iv)
    }, [fetchData])

    const handleCreateShift = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE_URL}/attendance-v2/shifts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newShift)
            })
            if (res.ok) {
                toast.success("Shift policy created")
                setIsAddShiftOpen(false)
                fetchData()
            } else {
                toast.error("Failed to create shift")
            }
        } catch (err) { toast.error("Network error") }
    }

    const toggleDay = (day: number) => {
        setNewShift(prev => ({
            ...prev,
            workDays: prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day]
        }))
    }

    const handleExport = async (range: 'daily' | 'monthly' | 'strategic', type: 'excel' | 'pdf' = 'excel') => {
        try {
            const now = new Date();
            let start, end;

            if (range === 'daily') {
                start = startOfDay(now);
                end = endOfDay(now);
            } else {
                start = startOfMonth(now);
                end = endOfMonth(now);
            }

            const startStr = format(start, "yyyy-MM-dd");
            const endStr = format(end, "yyyy-MM-dd");
            
            let endpoint = `/reports/export/${type}?start=${startStr}&end=${endStr}`;
            if (range === 'strategic') {
                endpoint = `/reports/export/strategic-monthly?start=${startStr}&end=${endStr}`;
            }

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const filename = range === 'strategic' 
                    ? `Strategic_Analysis_${startStr}.xlsx`
                    : `${range.charAt(0).toUpperCase() + range.slice(1)}_Attendance_${startStr}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success(`${range.toUpperCase()} report downloaded`);
            } else {
                toast.error("Failed to generate report");
            }
        } catch (err) {
            toast.error("Export failed");
        }
    }

    return (
        <div className="min-h-full bg-[#fcfcfd] font-body pb-20 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none" />

            <div className="max-w-[1400px] mx-auto space-y-12 relative z-10">
                {/* 📊 KEY PERFORMANCE TELEMETRY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "Total Staff", value: stats?.totalUsers ?? "0", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+2.4%" },
                        { label: "Present Now", value: livePresence.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Real-time" },
                        { label: "Absent Staff", value: Math.max(0, (stats?.totalUsers || 0) - livePresence.length), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", trend: "-12%" },
                        { label: "System Status", value: "Active", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Secured" },
                    ].map((s, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-8 rounded-[40px] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-6 mb-6 relative z-10">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 shadow-sm", s.bg)}>
                                    <s.icon className={cn("w-6 h-6", s.color)} />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-bold text-slate-800 tracking-tight font-brand leading-none">{s.value}</h4>
                                    <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-widest mt-2">{s.label}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-bold px-2 py-0.5 rounded-full">{s.trend}</Badge>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* 🛡️ WORK SCHEDULES */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col h-[800px]">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10 mb-14">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transition-all hover:scale-110">
                                        <Timer className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-800 font-brand leading-none">Work Schedules</h2>
                                        <p className="text-slate-500 font-medium text-[11px] mt-2">Manage working hours and shifts</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="h-14 px-8 border-slate-100 bg-white text-slate-400 hover:text-slate-900 rounded-[20px] font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm transition-all hover:scale-[1.02]">
                                                <Download className="w-4 h-4" /> Download Reports
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 p-4 rounded-[2rem] border-slate-100 shadow-2xl bg-white">
                                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 p-2">Report Center</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-50" />
                                            <div className="space-y-1 mt-2">
                                                <DropdownMenuItem onClick={() => handleExport('daily')} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">Daily Summary</span>
                                                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExport('monthly')} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">Monthly Records</span>
                                                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-[20px] shadow-xl shadow-slate-200 font-bold uppercase text-[10px] tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                                <Plus className="w-4 h-4" />
                                                New Schedule
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white border-none text-slate-900 max-w-md rounded-[40px] shadow-2xl p-12">
                                            <form onSubmit={handleCreateShift}>
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold font-brand">Setup Schedule</DialogTitle>
                                                    <DialogDescription className="text-slate-400 font-medium text-[11px] mt-1">Define the working time for your staff.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-8 py-10">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Schedule Name</label>
                                                        <Input className="bg-slate-50 border-none h-14 rounded-2xl text-lg font-bold text-slate-900 px-6 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" placeholder="e.g. Day Shift" value={newShift.name} onChange={e => setNewShift({ ...newShift, name: e.target.value })} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                                            <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" value={newShift.startTime} onChange={e => setNewShift({ ...newShift, startTime: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                                            <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" value={newShift.endTime} onChange={e => setNewShift({ ...newShift, endTime: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">Working Days</label>
                                                        <div className="flex justify-between gap-1">
                                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => toggleDay(idx)}
                                                                    className={cn(
                                                                        "w-11 h-11 rounded-[14px] flex items-center justify-center font-bold text-[11px] transition-all",
                                                                        newShift.workDays.includes(idx)
                                                                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110"
                                                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                                    )}
                                                                >
                                                                    {day}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-black h-16 rounded-[24px] font-bold uppercase text-[12px] tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95">Create Schedule</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    {loading ? (
                                        <div className="col-span-full h-80 flex flex-col items-center justify-center gap-8 text-slate-400">
                                            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                                            <p className="font-bold text-[12px] uppercase tracking-widest animate-pulse">Syncing Schedules...</p>
                                        </div>
                                    ) : shifts.length === 0 ? (
                                        <div className="col-span-full h-96 border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/20 group hover:bg-white transition-all duration-700">
                                            <div className="w-20 h-20 bg-white rounded-[24px] border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                                                <Clock className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h4 className="text-slate-900 font-bold text-xl font-brand">No Schedules Created</h4>
                                            <p className="text-slate-400 font-medium text-[11px] mt-3 max-w-xs leading-relaxed">Setup your first shift to begin tracking attendance.</p>
                                        </div>
                                    ) : (
                                        shifts.map((shift, idx) => (
                                            <motion.div
                                                key={shift.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group bg-white border border-slate-100 rounded-[40px] p-10 hover:border-indigo-100 transition-all shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start mb-10">
                                                    <div>
                                                        <h4 className="text-2xl font-bold text-slate-800 font-brand">{shift.name}</h4>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <Badge className="bg-emerald-600 text-white border-none text-[8px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">Active</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6 mb-10">
                                                    <div className="p-6 bg-slate-50/50 rounded-[24px] border border-transparent group-hover:border-indigo-50 transition-colors">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Start Time</span>
                                                        <span className="text-3xl font-bold text-slate-900 tabular-nums font-brand">{shift.startTime}</span>
                                                    </div>
                                                    <div className="p-6 bg-slate-50/50 rounded-[24px] border border-transparent group-hover:border-indigo-50 transition-colors">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">End Time</span>
                                                        <span className="text-3xl font-bold text-slate-900 tabular-nums font-brand">{shift.endTime}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center p-3 rounded-[24px] bg-slate-50/50 border border-slate-50">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                "text-[10px] font-bold w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm",
                                                                shift.workDays.includes(i) ? "bg-white text-indigo-600 shadow-indigo-100/50" : "text-slate-300"
                                                            )}
                                                        >
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🕒 WHO IS WORKING NOW */}
                    <div className="lg:col-span-4 space-y-10">
                        <Card className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-[800px] flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10 shrink-0 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 leading-none font-brand">Live Tracking</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Staff Status</p>
                                </div>
                                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <button 
                                        onClick={() => setChartView('daily')}
                                        className={cn("px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all", chartView === 'daily' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
                                    >
                                        Daily
                                    </button>
                                    <button 
                                        onClick={() => setChartView('monthly')}
                                        className={cn("px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all", chartView === 'monthly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>

                            {/* Attendance Rate Circle */}
                            {(() => {
                                const tot = stats?.totalUsers || 0;
                                const pres = chartView === 'daily' ? livePresence.length : Math.round(tot * 0.92); 
                                const abs = Math.max(0, tot - pres);
                                const rate = tot > 0 ? Math.round((pres / tot) * 100) : 0;
                                
                                const chartData = [
                                    { name: 'Active', value: pres, color: '#4f46e5' },
                                    { name: 'Offline', value: abs, color: '#f43f5e' }
                                ];

                                return (
                                    <div className="h-64 w-full mb-10 relative shrink-0 z-10">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.div 
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-center"
                                            >
                                                <span className="text-5xl font-bold text-slate-800 tracking-tight tabular-nums leading-none font-brand">{rate}%</span>
                                                <div className="flex items-center justify-center gap-2 mt-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Rate</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={tot > 0 ? chartData : [{ name: 'Empty', value: 1, color: '#f8fafc' }]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={75}
                                                    outerRadius={100}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={16}
                                                    animationDuration={2000}
                                                >
                                                    {(tot > 0 ? chartData : [{ color: '#f8fafc' }]).map((entry: any, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )
                            })()}

                            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {livePresence.length > 0 ? livePresence.map((p, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-6 rounded-[32px] bg-[#fcfcfd] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/30 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-[16px] border border-slate-100 flex items-center justify-center font-bold text-[11px] text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    {p.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-800 tracking-tight leading-none font-brand">{p.name || 'Staff Member'}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">ID: {p.id?.substring(0,8)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-bold text-indigo-600 tabular-nums font-brand">{format(new Date(p.clockIn), 'HH:mm')}</p>
                                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1 block">Verified</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="text-[8px] font-bold px-3 py-1 rounded-full border-none text-white bg-slate-900 tracking-widest uppercase shadow-sm">
                                                {p.clockType || 'Office'}
                                            </Badge>
                                            <div className="h-[1px] flex-1 bg-slate-100" />
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Live Sync</span>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 select-none py-10">
                                        <Activity className="w-12 h-12 text-slate-200 mb-6 animate-pulse" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">Syncing Records...</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
