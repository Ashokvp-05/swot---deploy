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
        <div className="space-y-8 pb-10 min-h-full">
            {/* 📊 Attendance Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Units", value: stats?.totalUsers ?? "—", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Sign-ins Today", value: livePresence.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Absent Nodes", value: Math.max(0, (stats?.totalUsers || 0) - livePresence.length), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Sync Status", value: "Verified", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((s, i) => (
                    <Card key={i} className="p-6 rounded-[2rem] border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all group flex items-center gap-5">
                         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", s.bg)}>
                            <s.icon className={cn("w-5 h-5", s.color)} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-900 tabular-nums italic tracking-tighter leading-none">{s.value}</h4>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1.5">{s.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 🛡️ Primary Management Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden font-sans flex flex-col h-[700px]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10 mb-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-[20px] shadow-xl shadow-indigo-100 transition-transform hover:rotate-6">
                                        <Timer className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Attendance Matrix</h2>
                                </div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] ml-16">Configure Shifts & Protocols</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-14 px-6 border-slate-200 text-slate-600 rounded-[20px] font-black uppercase text-[10px] tracking-widest gap-2 bg-white hover:bg-slate-50">
                                            <Download className="w-4 h-4" /> Intelligence Exports
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 p-3 rounded-3xl border-slate-100 shadow-2xl bg-white">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 p-3 flex items-center gap-2">
                                            <Database className="w-3 h-3" /> Operational Reports
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="space-y-1 mt-2">
                                            <DropdownMenuItem onClick={() => handleExport('daily')} className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                <div className="flex items-center gap-3">
                                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[11px] font-bold text-slate-700 uppercase">Daily Synopsis</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('monthly')} className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-slate-50 group">
                                                <div className="flex items-center gap-3">
                                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                                    <span className="text-[11px] font-bold text-slate-700 uppercase">Monthly Ledger</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleExport('strategic')} className="flex items-center justify-between p-3 rounded-2xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-600 hover:text-white group transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                                                    <span className="text-[11px] font-black uppercase italic">Strategic Analysis</span>
                                                </div>
                                                <ShieldCheck className="w-3 h-3 opacity-50" />
                                            </DropdownMenuItem>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-[20px] shadow-xl shadow-slate-900/10 font-black uppercase text-[11px] tracking-widest gap-3 transition-all active:scale-95">
                                        <Plus className="w-4 h-4" />
                                        Design New Shift
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white border-slate-100 text-slate-900 max-w-md rounded-[40px] shadow-2xl p-10">
                                    <form onSubmit={handleCreateShift}>
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Shift Architecture</DialogTitle>
                                            <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Define operational timings and workweek cycles.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-8 py-10">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Name</label>
                                                <Input className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-lg font-black text-slate-900 px-6 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" placeholder="e.g. Core Morning" value={newShift.name} onChange={e => setNewShift({ ...newShift, name: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commencement</label>
                                                    <Input type="time" className="bg-slate-50 border-slate-100 h-14 rounded-2xl px-5 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" value={newShift.startTime} onChange={e => setNewShift({ ...newShift, startTime: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conclusion</label>
                                                    <Input type="time" className="bg-slate-50 border-slate-100 h-14 rounded-2xl px-5 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" value={newShift.endTime} onChange={e => setNewShift({ ...newShift, endTime: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Operational Workweek</label>
                                                <div className="flex justify-between gap-1">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => toggleDay(idx)}
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[11px] transition-all border-2 ${newShift.workDays.includes(idx)
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110"
                                                                : "bg-slate-50 border-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-black h-16 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-slate-900/10 transition-all active:scale-95">Deploy Profile</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 p-2">
                                {loading ? (
                                    <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 text-slate-400">
                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing synchronization nodes...</p>
                                    </div>
                                ) : shifts.length === 0 ? (
                                    <div className="col-span-full h-80 border-[3px] border-dashed border-slate-50 rounded-[50px] flex flex-col items-center justify-center text-center p-12 group hover:border-indigo-100 transition-all duration-700 bg-slate-50/20">
                                        <div className="p-8 bg-white rounded-[32px] border border-slate-50 mb-6 group-hover:scale-110 transition-transform duration-700 shadow-sm">
                                            <Clock className="w-12 h-12 text-slate-200" />
                                        </div>
                                        <h4 className="text-slate-900 font-black uppercase tracking-tight text-xl italic">No Active Policies</h4>
                                        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-3 max-w-sm leading-relaxed">Establish your first shift profile to begin automated personnel presence monitoring.</p>
                                    </div>
                                ) : (
                                    shifts.map((shift, idx) => (
                                        <motion.div
                                            key={shift.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ y: -10 }}
                                            className="group bg-white border border-slate-100 rounded-[44px] p-10 hover:border-indigo-100 transition-all shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-12">
                                                <div className="space-y-2">
                                                    <h4 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase leading-none">{shift.name}</h4>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-[0.1em] py-1 px-3 shadow-none">Operational</Badge>
                                                </div>
                                                <div className="flex gap-1.5 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-[14px] transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[14px] transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mb-12">
                                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-50 group-hover:border-indigo-50/50 transition-colors">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start</span>
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{shift.startTime}</span>
                                                </div>
                                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-50 group-hover:border-indigo-50/50 transition-colors">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">End</span>
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{shift.endTime}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-1.5 rounded-[22px] bg-slate-50/50 border border-slate-50">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-2xl transition-all ${shift.workDays.includes(i) ? "bg-white text-indigo-600 shadow-sm" : "text-slate-300"
                                                                }`}
                                                        >
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🕒 Real-time Presence Monitoring */}
                <div className="lg:col-span-4 h-full">
                    <Card className="p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm h-[700px] flex flex-col">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h3 className="text-lg font-black uppercase italic text-slate-900 tracking-tight leading-none">Presence Matrix</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Live Operational Stream</p>
                            </div>
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-xl shadow-emerald-500/30" />
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
                            {livePresence.length > 0 ? livePresence.map((p, i) => (
                                <div key={i} className="group p-5 rounded-3xl bg-slate-50/50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-black text-[10px] text-indigo-600 shadow-sm uppercase shrink-0">
                                                {p.name?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[120px]">{p.name || 'Personnel'}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic tracking-widest truncate">{p.unit || 'Standard Unit'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-indigo-600 tabular-nums italic">{format(new Date(p.clockIn), 'HH:mm')}</p>
                                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-0.5">SYNCED</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[7px] font-black px-2 py-0 border-slate-100 bg-white tracking-widest uppercase">
                                            {p.status || 'Active'}
                                        </Badge>
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <span className="text-[8px] font-bold text-indigo-400 uppercase">Operational</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center opacity-30 select-none">
                                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No nodes identified</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    )
}
