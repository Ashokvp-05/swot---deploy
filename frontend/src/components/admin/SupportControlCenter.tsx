"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Ticket, MessageSquare, Clock, AlertCircle, CheckCircle2, 
    Filter, Search, User, UserPlus, ChevronRight, MoreHorizontal,
    Send, Info, ShieldAlert, Activity, BarChart3, TrendingUp,
    Settings, Play, Download, Plus, Loader2, Save, Trash2,
    Bug, Lock, Unlock, Zap, Headphones, Cpu, AlertTriangle,
    RefreshCcw, Globe, CornerDownRight, ArrowRight, CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
    "bg-indigo-50 border-indigo-100 text-indigo-600",
    "bg-emerald-50 border-emerald-100 text-emerald-600",
    "bg-rose-50 border-rose-100 text-rose-600",
    "bg-amber-50 border-amber-100 text-amber-600",
    "bg-violet-50 border-violet-100 text-violet-600",
]

const getAvatarColor = (name: string) => {
    if (!name) return AVATAR_COLORS[0]
    const charCode = name.charCodeAt(0)
    return AVATAR_COLORS[charCode % AVATAR_COLORS.length]
}

const PRIORITY_THEMES: Record<string, string> = {
    LOW: "bg-slate-50 text-slate-400 border-none",
    MEDIUM: "bg-indigo-50 text-indigo-600 border-none",
    HIGH: "bg-amber-50 text-amber-600 border-none",
    CRITICAL: "bg-rose-50 text-rose-600 border-none",
}

const STATUS_THEMES: Record<string, string> = {
    OPEN: "bg-indigo-50 text-indigo-600 border-none",
    IN_PROGRESS: "bg-amber-50 text-amber-600 border-none",
    RESOLVED: "bg-emerald-50 text-emerald-600 border-none",
    CLOSED: "bg-slate-100 text-slate-400 border-none",
}

interface TicketComment {
    id: string
    userId: string
    content: string
    isInternal: boolean
    createdAt: string
    user: { name: string, avatarUrl?: string }
}

interface TicketData {
    id: string
    userId: string
    ticketNumber: number
    token: string
    title: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    category: 'BUG' | 'FEATURE' | 'ACCOUNT' | 'PAYROLL' | 'ATTENDANCE' | 'OTHER'
    createdAt: string
    user: { name: string, email: string, avatarUrl?: string }
    assignedTo?: { name: string, email: string }
    comments: TicketComment[]
}

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
    `}</style>
)

export default function SupportControlCenter({ token }: { token: string }) {
    const [tickets, setTickets] = useState<TicketData[]>([])
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('OPEN')

    const fetchData = async () => {
        setLoading(true)
        try {
            const [tRes, aRes] = await Promise.all([
                fetch(`${API_BASE_URL}/tickets`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/tickets/analytics`, { headers: { Authorization: `Bearer ${token}` } })
            ])
            if (tRes.ok) setTickets(await tRes.json())
            if (aRes.ok) setAnalytics(await aRes.json())
        } catch (e) {
            toast.error("Telemetry failure: Support node offline")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [token])

    const filtered = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.token.toLowerCase().includes(search.toLowerCase()) ||
                             t.user?.name?.toLowerCase().includes(search.toLowerCase())
        const matchesTab = filter === 'ALL' || t.status === filter
        return matchesSearch && matchesTab
    })

    const activeNodesCount = tickets.filter(t => t.status === 'OPEN').length

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm h-full flex flex-col font-body">
            <GlobalStyles />
            
            {/* ── HIGH-DENSITY HEADER (LEAVE STYLE) ── */}
            <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white shrink-0">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-50">
                        <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight font-brand uppercase italic">Support Center</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {activeNodesCount} Open · {tickets.length} Total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">

                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
                        {(["OPEN", "IN_PROGRESS", "RESOLVED", "ALL"] as const).map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={cn("h-9 px-4 md:px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                                    filter === s ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50")}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE MANIFEST (LEAVE STYLE) ── */}
            <ScrollArea className="flex-1 bg-slate-50/10 custom-scrollbar">
                <div className="p-6 md:p-8 space-y-5">
                    {loading && tickets.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing support nodes...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-indigo-500/10 rounded-[40px] animate-ping" />
                                <ShieldAlert className="w-10 h-10 text-indigo-600 relative z-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-800">Nothing Found</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-body">No tickets match your filter</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((ticket, idx) => (
                                <TicketCard key={ticket.id} ticket={ticket} token={token} onUpdate={fetchData} />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* ── FOOTER PROTOCOL (LEAVE STYLE) ── */}
            <div className="p-6 border-t border-slate-50 bg-white flex justify-between items-center px-10 shrink-0">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Shard Integrity Validated 100%</span>
                <button onClick={fetchData} className="flex items-center gap-2.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group font-brand">
                    Refresh
                </button>
            </div>
        </div>
    )
}

function TicketCard({ ticket, token, onUpdate }: { ticket: TicketData, token: string, onUpdate: () => void }) {
    const [actionLoading, setActionLoading] = useState(false)

    const handleQuickResolve = async () => {
        setActionLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'RESOLVED' })
            })
            if (res.ok) {
                toast.success("Ticket Symmetrical: Resolved")
                onUpdate()
            }
        } catch { toast.error("Communication failure") }
        finally { setActionLoading(false) }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-6 md:p-8 rounded-[28px] group bg-white shadow-sm ring-1 ring-slate-100/50 relative overflow-hidden"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12 relative z-10">
                
                {/* CORE INFO GROUP */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start md:items-center gap-5 flex-col md:flex-row">
                        {/* Dynamic Avatar with Multi-Hue System */}
                        <div className={cn(
                            "w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-transparent transition-all duration-300 group-hover:scale-110",
                            getAvatarColor(ticket.user.name)
                        )}>
                            {ticket.user?.name?.[0]?.toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1.5">
                                <h4 className="text-[17px] font-bold text-slate-900 tracking-tight font-brand group-hover:text-indigo-600 transition-colors uppercase truncate leading-none">
                                    {ticket.title}
                                </h4>
                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", PRIORITY_THEMES[ticket.priority])}>
                                    {ticket.priority}
                                </Badge>
                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", STATUS_THEMES[ticket.status])}>
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                <span className="text-indigo-500 font-black tracking-widest uppercase text-[10px] bg-indigo-50/50 px-2 py-0.5 rounded-lg">{ticket.token}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                                <span className="font-bold text-slate-600 uppercase tracking-tight">{ticket.user.name}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                                <span className="italic truncate">{ticket.user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* COMPACT METRICS */}
                    <div className="mt-5 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50">
                            <CalendarDays className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Registered: {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Category:</Label>
                            <span className="text-[11px] font-black text-slate-900 tracking-tight font-brand uppercase px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                {ticket.category}
                            </span>
                        </div>
                    </div>

                    {/* PAYLOAD PREVIEW (LEAVE STYLE) */}
                    {ticket.description && (
                        <div className="mt-5 flex items-start gap-3 pl-4 border-l-2 border-indigo-50 leading-relaxed">
                            <CornerDownRight className="w-4 h-4 text-slate-200 mt-1 shrink-0" />
                            <p className="text-[13.5px] text-slate-500 font-medium italic line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                "{ticket.description}"
                            </p>
                        </div>
                    )}
                </div>

                {/* ACTION BLOCK - LEAVE STYLE ARRANGEMENT */}
                <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {ticket.status !== 'RESOLVED' && (
                            <Button 
                                onClick={handleQuickResolve} 
                                disabled={actionLoading}
                                className="h-12 px-8 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-xl transition-all active:scale-95 font-brand"
                            >
                                {actionLoading ? "..." : "Resolve"}
                            </Button>
                        )}
                        
                        <TicketDetailSheet ticket={ticket} token={token} onUpdate={onUpdate} />

                        <Button 
                            variant="ghost"
                            className="h-12 px-6 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-slate-100"
                            onClick={() => toast.info(`Accessing logs for ${ticket.token}`)}
                        >
                            Audit
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* BACKGROUND DECOR (LEAVE STYLE) */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Headphones className="w-32 h-32 rotate-12" />
            </div>
        </motion.div>
    )
}

function TicketDetailSheet({ ticket, token, onUpdate }: { ticket: TicketData, token: string, onUpdate: () => void }) {
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleUpdate = async (data: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                toast.success("Synchronized")
                onUpdate()
            }
        } catch (e) {}
    }

    const addComment = async (isInternal = false) => {
        if (!comment) return
        setSubmitting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${ticket.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: comment, isInternal })
            })
            if (res.ok) {
                setComment("")
                onUpdate()
                toast.success("Packet deployed")
            }
        } catch (e) {} finally { setSubmitting(false) }
    }

    const statusColor = {
        OPEN: "bg-indigo-50 text-indigo-600",
        IN_PROGRESS: "bg-amber-50 text-amber-600",
        RESOLVED: "bg-emerald-50 text-emerald-600",
        CLOSED: "bg-slate-100 text-slate-400"
    }

    const priorityColor = {
        LOW: "bg-slate-50 text-slate-400",
        MEDIUM: "bg-indigo-50 text-indigo-600",
        HIGH: "bg-amber-50 text-amber-600",
        CRITICAL: "bg-rose-100 text-rose-700"
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className="h-12 px-8 text-indigo-600 hover:bg-indigo-50 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-indigo-100/30 font-brand">
                    View
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-white border-l border-slate-50 w-[600px] sm:w-[720px] p-0 rounded-l-[60px] shadow-2xl overflow-y-auto custom-scrollbar font-body">
                <SheetHeader className="pt-24 px-14 pb-12 border-b border-slate-50/60 bg-slate-50/20 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <Badge className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border-none ring-4 ring-white/80 shadow-sm", statusColor[ticket.status])}>{ticket.status}</Badge>
                                        <span className="text-[12px] font-black text-indigo-500 uppercase tracking-widest bg-white border border-indigo-100 px-4 py-1.5 rounded-2xl shadow-sm">{ticket.token}</span>
                                    </div>
                                    <SheetTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none font-brand text-slate-900">{ticket.title}</SheetTitle>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="p-14 space-y-16">
                    {/* REQUESTOR NODE */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] pl-1">Primary Origin Node</Label>
                            <div className="h-20 bg-slate-50/80 rounded-[32px] flex items-center gap-5 px-7 border border-slate-100 shadow-sm">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md", getAvatarColor(ticket.user.name))}>{ticket.user.name?.[0]}</div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">{ticket.user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate italic">{ticket.user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] pl-1">Severity / Impact</Label>
                            <div className="flex items-center gap-2">
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                                    <button 
                                        key={p}
                                        onClick={() => handleUpdate({ priority: p })}
                                        className={cn(
                                            "h-14 flex-1 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all",
                                            ticket.priority === p ? priorityColor[p] + " shadow-xl shadow-black/5 ring-4 ring-white scale-105 z-10" : "bg-slate-50 text-slate-300 opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CORE DESCRIPTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pl-1">
                            <Label className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.5em]">Packet Payload (Description)</Label>
                        </div>
                        <div className="p-12 bg-slate-50/50 rounded-[50px] text-sm font-semibold text-slate-700 leading-relaxed border border-slate-100 italic shadow-[inset_0_4px_12px_rgba(0,0,0,0.02)]">
                            "{ticket.description}"
                        </div>
                    </div>

                    {/* ORCHESTRATION CONTROLS */}
                    <div className="space-y-8">
                        <Label className="text-[11px] font-black text-amber-600 uppercase tracking-[0.5em] pl-1">Lifecycle Orchestration</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { s: 'OPEN', label: 'Open' },
                                { s: 'IN_PROGRESS', label: 'Working' },
                                { s: 'RESOLVED', label: 'Done' }
                            ].map((action) => (
                                <Button 
                                    key={action.s}
                                    variant="ghost" 
                                    className={cn(
                                        "h-20 rounded-[32px] flex flex-col items-center justify-center gap-2 group border-2 border-transparent transition-all",
                                        ticket.status === action.s ? "bg-white border-indigo-600/10 shadow-[0_15px_40px_rgba(0,0,0,0.05)] -translate-y-1 scale-105" : "bg-slate-50 hover:bg-white"
                                    )}
                                    onClick={() => handleUpdate({ status: action.s })}
                                >
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", ticket.status === action.s ? "text-slate-900" : "text-slate-400")}>{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* PACKET LOGS */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between pl-1">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Communication Stream</Label>
                            <Badge className="bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase px-5 py-2 rounded-full border-none shadow-sm">{ticket.comments.length} Log Entries</Badge>
                        </div>

                        <div className="space-y-8 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar pb-10">
                            {ticket.comments.map((c, i) => (
                                <div key={i} className={cn("flex gap-5", c.userId === ticket.userId ? "justify-start" : "justify-end flex-row-reverse")}>
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[11px] shadow-sm shrink-0", getAvatarColor(c.user.name))}>
                                        {c.user.name[0]}
                                    </div>
                                    <div className={cn("space-y-3 max-w-[85%]", c.userId !== ticket.userId && "flex flex-col items-end")}>
                                        <div className={cn(
                                            "p-8 rounded-[36px] relative shadow-lg",
                                            c.userId === ticket.userId ? "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100" : "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100",
                                            c.isInternal && "ring-8 ring-amber-500/10 bg-amber-50 text-amber-700 border-amber-200"
                                        )}>
                                            {c.isInternal && <Badge className="absolute -top-4 right-6 bg-amber-500 text-white text-[9px] font-black uppercase px-4 py-1.5 shadow-xl border-none">Secure Internal Link</Badge>}
                                            <p className="text-[13px] font-medium leading-relaxed">{c.content}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] px-4 italic">Synchronized Node: {new Date(c.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* INPUT CHANNEL */}
                        <div className="space-y-6 pt-6 border-t border-slate-50 sticky bottom-0 bg-white pb-6 z-10">
                            <div className="relative group">
                                <Input 
                                    placeholder="Write a message..." 
                                    className="h-24 bg-slate-50/80 border-none rounded-[40px] px-12 text-[13px] font-bold tracking-widest uppercase italic shadow-[inset_0_4px_16px_rgba(0,0,0,0.03)] focus-visible:ring-indigo-600/10 placeholder:text-slate-200"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        className="h-16 w-16 rounded-[28px] bg-white shadow-xl border border-slate-50 hover:bg-amber-50 group/internal active:scale-95 transition-all"
                                        onClick={() => addComment(true)}
                                    >
                                        Lock
                                    </Button>
                                    <Button 
                                        disabled={submitting || !comment} 
                                        className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[28px] px-10 gap-4 group/send shadow-2xl shadow-indigo-200 active:scale-95 transition-all"
                                        onClick={() => addComment(false)}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{submitting ? "..." : "Send"}</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Internal notes are private.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
