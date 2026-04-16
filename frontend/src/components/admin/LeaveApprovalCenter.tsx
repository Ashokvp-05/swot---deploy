"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ClipboardList, CheckCircle2, XCircle, Clock,
    User, Calendar, Tag, Loader2, AlertCircle,
    MessageSquare, ChevronDown, Filter, Search, ArrowRight,
    Briefcase, ShieldCheck, Zap, RefreshCcw, UserCheck,
    CalendarDays, CornerDownRight, CloudOff, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface LeaveRequest {
    id: string
    user: { name: string; email: string; department?: { name: string } }
    type: string
    startDate: string
    endDate: string
    reason?: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
    SICK: "bg-rose-50 text-rose-600 border-none px-2 py-0.5",
    CASUAL: "bg-indigo-50 text-indigo-600 border-none px-2 py-0.5",
    EARNED: "bg-emerald-50 text-emerald-600 border-none px-2 py-0.5",
    MEDICAL: "bg-amber-50 text-amber-600 border-none px-2 py-0.5",
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-none",
    APPROVED: "bg-emerald-50 text-emerald-600 border-none",
    REJECTED: "bg-rose-50 text-rose-600 border-none",
}

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .enterprise-card {
            background: #ffffff;
            border: 1px solid #F1F5F9;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .enterprise-card:hover {
            border-color: #E2E8F0;
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.05);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
    `}</style>
)

export default function LeaveApprovalCenter({ token }: { token: string }) {
    const API = process.env.NEXT_PUBLIC_API_URL
    const [leaves, setLeaves] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING")
    const [search, setSearch] = useState("")
    const [rejectId, setRejectId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchLeaves = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}/leaves/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) setLeaves(await res.json())
        } catch { toast.error("Connection error") }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchLeaves() }, [token])

    const approve = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`${API}/leaves/${id}/approve`, {
                method: "PUT", headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success("Request accepted")
                setLeaves(l => l.map(x => x.id === id ? { ...x, status: "APPROVED" } : x))
            }
        } catch { toast.error("Execution failure") }
        finally { setActionLoading(null) }
    }

    const reject = async (id: string) => {
        if (!rejectReason.trim()) { toast.error("Audit reason required"); return }
        setActionLoading(id)
        try {
            const res = await fetch(`${API}/leaves/${id}/reject`, {
                method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ reason: rejectReason })
            })
            if (res.ok) {
                toast.success("Request declined")
                setLeaves(l => l.map(x => x.id === id ? { ...x, status: "REJECTED" } : x))
                setRejectId(null); setRejectReason("")
            }
        } catch { toast.error("Execution failure") }
        finally { setActionLoading(null) }
    }

    const filtered = leaves.filter(l => (filter === "ALL" || l.status === filter) &&
        (!search || l.user?.name?.toLowerCase().includes(search.toLowerCase())))

    const pendingCount = leaves.filter(l => l.status === "PENDING").length

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm h-full flex flex-col font-body">
            <GlobalStyles />

            {/* HIGH-DENSITY HEADER */}
            <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white shrink-0">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-50">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight font-brand">Leave Approval Registry</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{pendingCount} Active Tags · {leaves.length} Recorded Units</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-full xl:w-auto overflow-x-auto no-scrollbar">
                    {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={cn("h-9 px-4 md:px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                                filter === s ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50")}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* SCROLLABLE LIST - HIGH DENSITY */}
            <ScrollArea className="flex-1 bg-slate-50/10 custom-scrollbar">
                <div className="p-6 md:p-8 space-y-4">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing registry Nodes...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-40">
                            <ShieldCheck className="w-12 h-12 text-slate-100" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Zero active requests in manifest</p>
                        </div>
                    ) : (
                        filtered.map((leave) => (
                            <motion.div key={leave.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="enterprise-card p-6 md:p-8 rounded-[28px] group bg-white shadow-sm ring-1 ring-slate-100/50">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
                                    
                                    {/* CORE INFO GROUP */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start md:items-center gap-5 flex-col md:flex-row">
                                            {/* Avatar/Badge */}
                                            <div className="w-12 h-12 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                {leave.user?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                                    <h4 className="text-[16px] font-bold text-slate-900 tracking-tight font-brand group-hover:text-indigo-600 transition-colors uppercase truncate">{leave.user?.name}</h4>
                                                    <Badge className={cn("text-[8px] font-black uppercase tracking-widest", TYPE_COLORS[leave.type] || "bg-slate-50")}>{leave.type}</Badge>
                                                    <Badge className={cn("text-[8px] font-black uppercase tracking-widest", STATUS_COLORS[leave.status])}>{leave.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                                    <span className="truncate italic">{leave.user?.email}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                                                    <span className="uppercase tracking-widest text-[9px] font-bold">{leave.user?.department?.name || "Structural Node"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COMPACT METRICS */}
                                        <div className="mt-5 flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50">
                                                <CalendarDays className="w-4 h-4 text-indigo-500" />
                                                <span className="text-[11px] font-bold text-slate-700">
                                                    {new Date(leave.startDate).toLocaleDateString()}
                                                    <ArrowRight className="inline w-3 h-3 mx-2 text-slate-300" />
                                                    {new Date(leave.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[12px] font-black text-slate-900 tracking-tight font-brand">
                                                    {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86400000) + 1} DAYS
                                                </span>
                                            </div>
                                        </div>

                                        {/* INLINE REASON - REDUCED HEIGHT */}
                                        {leave.reason && (
                                            <div className="mt-4 flex items-start gap-3 pl-3 border-l-2 border-indigo-50 leading-relaxed">
                                                <CornerDownRight className="w-3.5 h-3.5 text-slate-200 mt-1 shrink-0" />
                                                <p className="text-[13px] text-slate-500 font-medium italic line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                                    "{leave.reason}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTION BLOCK - RESPONSIVE STACK */}
                                    {leave.status === "PENDING" && (
                                        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
                                            {rejectId === leave.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input autoFocus value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Personnel Insight..."
                                                        className="h-10 w-full sm:w-64 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold" />
                                                    <Button onClick={() => reject(leave.id)} disabled={actionLoading === leave.id} className="h-10 bg-rose-600 text-white font-bold rounded-lg px-6 text-xs">Commit</Button>
                                                    <Button onClick={() => setRejectId(null)} variant="ghost" className="h-10 text-slate-400 px-3 text-xs">Esc</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button onClick={() => approve(leave.id)} disabled={actionLoading === leave.id}
                                                        className="h-12 px-8 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all active:scale-95 group/btn">
                                                        {actionLoading === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Request"}
                                                    </Button>
                                                    <Button onClick={() => setRejectId(leave.id)} variant="ghost"
                                                        className="h-12 px-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-rose-100">
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* FOOTER - COMPACT */}
            <div className="p-6 border-t border-slate-50 bg-white flex justify-between items-center px-10 shrink-0">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Shard Integrity Validated 100%</span>
                <button onClick={fetchLeaves} className="flex items-center gap-2.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest transition-all">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Registry Re-sync
                    <RefreshCcw className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
}
