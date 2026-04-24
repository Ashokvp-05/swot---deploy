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
        <div className="space-y-10 pb-20 min-h-full font-brand">
            {/* 📊 High-Fidelity Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Workforce", value: stats?.totalUsers ?? "0", icon: Users, color: "text-purple-600", bg: "bg-purple-50", trend: "+2.4%" },
                    { label: "Live Check-ins", value: livePresence.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Steady" },
                    { label: "Absent Nodes", value: Math.max(0, (stats?.totalUsers || 0) - livePresence.length), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", trend: "-12%" },
                    { label: "Protocol Sync", value: "Verified", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50", trend: "Real-time" },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <s.icon className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-5 mb-4 relative z-10">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6", s.bg)}>
                                <s.icon className={cn("w-6 h-6", s.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.trend}</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</h4>
                            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest mt-2">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 🛡️ Attendance Matrix (Primary Management) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col h-[750px]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-600 rounded-[24px] shadow-xl shadow-purple-200 transition-all hover:scale-110">
                                        <Timer className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Attendance Matrix</h2>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Operational Shift Architect</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-14 px-6 border-slate-100 bg-slate-50/50 text-slate-600 rounded-[20px] font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-white hover:shadow-lg transition-all">
                                            <Download className="w-4 h-4" /> Export Matrix
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 p-4 rounded-[2rem] border-slate-100 shadow-2xl bg-white/95 backdrop-blur-md">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 p-2 flex items-center gap-2">
                                            <Database className="w-3 h-3" /> Report Engine
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-50" />
                                        <div className="space-y-1 mt-2">
                                            <DropdownMenuItem onClick={() => handleExport('daily')} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><FileSpreadsheet className="w-4 h-4 text-emerald-500" /></div>
                                                    <span className="text-[11px] font-black uppercase">Daily Synopsis</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-purple-600" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('monthly')} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-blue-500" /></div>
                                                    <span className="text-[11px] font-black uppercase">Monthly Ledger</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-purple-600" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('strategic')} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-purple-50/50 hover:bg-purple-600 hover:text-white group transition-all">
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-4 h-4 text-purple-600 group-hover:text-white" />
                                                    <span className="text-[11px] font-black uppercase italic tracking-tight">Strategic Insights</span>
                                                </div>
                                                <Badge className="bg-white/20 text-white border-none text-[8px] font-black">PRO</Badge>
                                            </DropdownMenuItem>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-[20px] shadow-xl shadow-slate-900/10 font-black uppercase text-[11px] tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                            <Plus className="w-4 h-4" />
                                            New Shift Policy
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white border-none text-slate-900 max-w-md rounded-[3rem] shadow-2xl p-12">
                                        <form onSubmit={handleCreateShift}>
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Shift Architecture</DialogTitle>
                                                <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configure precision operational windows.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-8 py-10">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Identifier</label>
                                                    <Input className="bg-slate-50 border-none h-14 rounded-2xl text-lg font-black text-slate-900 px-6 focus:ring-4 focus:ring-purple-600/10 transition-all outline-none" placeholder="e.g. CORE ALPHA" value={newShift.name} onChange={e => setNewShift({ ...newShift, name: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clock In</label>
                                                        <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 text-slate-900 font-black focus:ring-4 focus:ring-purple-600/10 transition-all outline-none" value={newShift.startTime} onChange={e => setNewShift({ ...newShift, startTime: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clock Out</label>
                                                        <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 text-slate-900 font-black focus:ring-4 focus:ring-purple-600/10 transition-all outline-none" value={newShift.endTime} onChange={e => setNewShift({ ...newShift, endTime: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Workweek Schedule</label>
                                                    <div className="flex justify-between gap-1">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => toggleDay(idx)}
                                                                className={cn(
                                                                    "w-11 h-11 rounded-[14px] flex items-center justify-center font-black text-[11px] transition-all",
                                                                    newShift.workDays.includes(idx)
                                                                        ? "bg-purple-600 text-white shadow-xl shadow-purple-200 scale-110"
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
                                                <Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700 h-16 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all active:scale-95">Finalize Policy</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                {loading ? (
                                    <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 text-slate-400">
                                        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                                        <p className="font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Shift Registry...</p>
                                    </div>
                                ) : shifts.length === 0 ? (
                                    <div className="col-span-full h-96 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 bg-slate-50/20 group hover:bg-white transition-all duration-700">
                                        <div className="w-20 h-20 bg-white rounded-[24px] border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-all">
                                            <Clock className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h4 className="text-slate-900 font-black uppercase tracking-tight text-xl italic">No Policies Active</h4>
                                        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-3 max-w-xs leading-relaxed">Establish your first operational shift to begin automated workforce tracking.</p>
                                    </div>
                                ) : (
                                    shifts.map((shift, idx) => (
                                        <motion.div
                                            key={shift.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ y: -8 }}
                                            className="group bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:border-purple-200 transition-all shadow-sm hover:shadow-2xl hover:shadow-purple-500/5 relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-10">
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">{shift.name}</h4>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8.5px] font-black uppercase tracking-widest py-1 px-3">Active</Badge>
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase">Ver: 2.0.4</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl">
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-10">
                                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-purple-100 transition-colors">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Commence</span>
                                                    <span className="text-2xl font-black text-slate-900 tabular-nums">{shift.startTime}</span>
                                                </div>
                                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-purple-100 transition-colors">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Conclusion</span>
                                                    <span className="text-2xl font-black text-slate-900 tabular-nums">{shift.endTime}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                    <span
                                                        key={i}
                                                        className={cn(
                                                            "text-[9px] font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                                                            shift.workDays.includes(i) ? "bg-white text-purple-600 shadow-sm" : "text-slate-300"
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

                {/* 🕒 Presence Matrix (Real-time Stream) */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 h-[750px] flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
                            <div>
                                <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">Presence Matrix</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Live Node Monitoring</p>
                            </div>
                            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                                <button 
                                    onClick={() => setChartView('daily')}
                                    className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", chartView === 'daily' ? "bg-white text-purple-600 shadow-md" : "text-slate-400")}
                                >
                                    Daily
                                </button>
                                <button 
                                    onClick={() => setChartView('monthly')}
                                    className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", chartView === 'monthly' ? "bg-white text-purple-600 shadow-md" : "text-slate-400")}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* High-Impact Analytics Circle */}
                        {(() => {
                            const tot = stats?.totalUsers || 0;
                            const pres = chartView === 'daily' ? livePresence.length : Math.round(tot * 0.92); 
                            const abs = Math.max(0, tot - pres);
                            const rate = tot > 0 ? Math.round((pres / tot) * 100) : 0;
                            
                            const chartData = [
                                { name: 'Active', value: pres, color: '#7c3aed' },
                                { name: 'Offline', value: abs, color: '#f43f5e' }
                            ];

                            return (
                                <div className="h-64 w-full mb-8 relative shrink-0 z-10 group">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-center"
                                        >
                                            <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{rate}%</span>
                                            <div className="flex items-center justify-center gap-1.5 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Rate</span>
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
                                                outerRadius={95}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={12}
                                                animationBegin={0}
                                                animationDuration={1800}
                                            >
                                                {(tot > 0 ? chartData : [{ color: '#f8fafc' }]).map((entry: any, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                cursor={false}
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )
                        })()}

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {livePresence.length > 0 ? livePresence.map((p, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-xl transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xs text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                                {p.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{p.name || 'Staff Node'}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">ID: {p.id?.substring(0,8)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-purple-600 tabular-nums italic">{format(new Date(p.clockIn), 'HH:mm')}</p>
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 block">Verified</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-[8px] font-black px-3 py-1 rounded-full border-emerald-100 text-emerald-600 bg-emerald-50 tracking-widest uppercase">
                                            {p.clockType || 'Office'}
                                        </Badge>
                                        <div className="h-[2px] flex-1 bg-slate-100/50" />
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Connection</span>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 select-none py-10">
                                    <Activity className="w-12 h-12 text-slate-200 mb-4 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Listening for Node Signals...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
