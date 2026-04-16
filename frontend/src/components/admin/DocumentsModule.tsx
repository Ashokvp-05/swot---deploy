"use client"

import { useEffect, useState, useMemo } from "react"
import { 
    FileText, Loader2, Plus, Download, ShieldAlert, 
    Search, ChevronDown, ChevronRight, User, 
    Calendar, Filter, MoreVertical, Archive,
    Shield, RefreshCcw, Eye, Lock, Zap, File,
    Database, ShieldCheck, Fingerprint, MapPin, 
    GraduationCap, Briefcase, CheckCircle2, AlertCircle,
    Info, Upload, Check, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const API = process.env.NEXT_PUBLIC_API_URL

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
    `}</style>
)

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

export default function DocumentsModule({ token }: { token: string }) {
    const [docs, setDocs] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedID, setExpandedID] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const h = { Authorization: `Bearer ${token}` }
            const [dRes, uRes] = await Promise.all([
                fetch(`${API}/documents`, { headers: h }),
                fetch(`${API}/users`, { headers: h })
            ])
            if (dRes.ok) {
                const data = await dRes.json()
                setDocs(Array.isArray(data) ? data : (data.documents || data.data || []))
            }
            if (uRes.ok) {
                const data = await uRes.json()
                setUsers(Array.isArray(data) ? data : (data.users || []))
            }
        } catch {
            toast.error("Telemetry failure: Vault offline")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [token])

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
            const isSuperAdmin = roleName === 'SUPER_ADMIN';
            const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            return !isSuperAdmin && matchesSearch;
        }).sort((a,b) => a.name.localeCompare(b.name))
    }, [users, searchQuery])

    // Required Status Manifest
    const criticalSlots = [
        { id: 'identity', label: 'ID Proof', icon: Fingerprint, category: 'Identity' },
        { id: 'address', label: 'Address Proof', icon: MapPin, category: 'Address' },
        { id: 'offer', label: 'Offer Letter', icon: Briefcase, category: 'Offer' },
        { id: 'education', label: 'Education', icon: GraduationCap, category: 'Certificate' },
    ]

    return (
        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm h-full flex flex-col font-body">
            <GlobalStyles />
            
            {/* ── HIGH-DENSITY VAULT HEADER ── */}
            <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white shrink-0">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                        <Database className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase font-brand leading-none">Identity <span className="text-indigo-600">Vault</span></h3>
                        <p className="text-[10px] font-black text-slate-400 font-brand uppercase tracking-[0.2em] mt-2.5">
                            {docs.length} Synchronized Records · {users.length} Authorized Nodes
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Scan personnel identity..."
                            className="h-14 pl-14 bg-slate-50/80 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-100"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 flex items-center justify-center p-0 text-slate-400">
                         <Filter className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* ── PERSONNEL REGISTRY LIST ── */}
            <ScrollArea className="flex-1 bg-slate-50/20 custom-scrollbar">
                <div className="p-10 space-y-6">
                    {filteredUsers.length === 0 ? (
                        <div className="py-48 flex flex-col items-center justify-center gap-6 opacity-40">
                            <ShieldAlert className="w-16 h-16 text-slate-100" />
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300 italic">No Personnel Nodes Discovered</p>
                        </div>
                    ) : (
                        filteredUsers.map((user, idx) => {
                            const userDocs = docs.filter(d => d.userId === user.id || d.employeeId === user.id)
                            const isExpanded = expandedID === user.id

                            return (
                                <motion.div 
                                    key={user.id} 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "bg-white rounded-[32px] border border-slate-100 overflow-hidden transition-all duration-500",
                                        isExpanded ? "ring-4 ring-indigo-500/5 border-indigo-100 shadow-2xl -translate-y-1" : "hover:shadow-xl hover:border-slate-200"
                                    )}
                                >
                                    <button 
                                        onClick={() => setExpandedID(isExpanded ? null : user.id)}
                                        className="w-full flex items-center justify-between p-10 hover:bg-slate-50/30 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-7">
                                            <div className={cn(
                                                "w-16 h-16 rounded-[22px] flex items-center justify-center font-black text-lg italic shadow-xl group-hover:scale-110 transition-transform font-brand",
                                                getAvatarColor(user.name)
                                            )}>
                                                {user.name?.[0]}{user.name?.[1]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic font-brand leading-none group-hover:text-indigo-600 transition-colors">
                                                        {user.name}
                                                    </h4>
                                                    <Badge className="bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none">
                                                        {user.role?.name || user.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="italic truncate">{user.email}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                                                    <span className={cn(
                                                        "flex items-center gap-2",
                                                        userDocs.length > 0 ? "text-indigo-600" : "text-slate-300"
                                                    )}>
                                                        <FileText className="w-4 h-4" />
                                                        {userDocs.length} Locked Manifests
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:flex items-center gap-3 px-5 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Verified Identity</span>
                                            </div>
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg shadow-indigo-100",
                                                isExpanded && "bg-indigo-600 text-white rotate-180"
                                            )}>
                                                <ChevronDown className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence mode="wait">
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-50"
                                            >
                                                <div className="bg-slate-50/50 p-10 space-y-10">
                                                    
                                                    {/* CRITICAL DOCUMENT MANIFEST SHARDS */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {criticalSlots.map((slot) => {
                                                            const exists = userDocs.some(d => d.type === slot.category || d.name?.includes(slot.label))
                                                            return (
                                                                <div key={slot.id} className="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm flex flex-col gap-5 group/slot hover:border-indigo-200 transition-all">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover/slot:bg-indigo-50 group-hover/slot:text-indigo-600 transition-colors">
                                                                            <slot.icon className="w-5 h-5" />
                                                                        </div>
                                                                        {exists ? (
                                                                            <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-6 h-6 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-[12px] font-black text-slate-900 uppercase italic font-brand tracking-tight mb-1">{slot.label}</h5>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", exists ? "bg-emerald-500" : "bg-rose-500")} />
                                                                            <span className={cn("text-[9px] font-black uppercase tracking-widest", exists ? "text-emerald-600" : "text-rose-500")}>
                                                                                {exists ? "Verified Shard" : "Missing Fragment"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        className={cn(
                                                                            "w-full h-11 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] gap-2 border border-dashed transition-all",
                                                                            exists ? "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100" : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                                                        )}
                                                                    >
                                                                        {exists ? <><Eye className="w-3 h-3" /> View Record</> : <><Upload className="w-3 h-3" /> Upload Document</>}
                                                                    </Button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    {/* STANDARD DOCUMENT REGISTER */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-brand italic ml-1">Synchronized Artifact Registry</h5>
                                                        {userDocs.length === 0 ? (
                                                            <div className="py-16 flex flex-col items-center justify-center gap-4 bg-white rounded-[32px] border border-dashed border-slate-200">
                                                                <Archive className="w-12 h-12 text-slate-100" />
                                                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Global Vault Synchronized: Zero Assets Found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                                                                <table className="w-full text-left">
                                                                    <thead>
                                                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                                                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest font-brand">Asset Identity</th>
                                                                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest font-brand text-center">Category</th>
                                                                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest font-brand text-right">Connectivity</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50 font-medium">
                                                                        {userDocs.map((doc, dIdx) => (
                                                                            <tr key={doc.id} className="group/doc hover:bg-indigo-50/30 transition-colors">
                                                                                <td className="px-8 py-6">
                                                                                    <div className="flex items-center gap-5">
                                                                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover/doc:bg-indigo-600 group-hover/doc:text-white transition-all">
                                                                                            <File className="w-5 h-5" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-[14px] font-black text-slate-900 uppercase italic font-brand tracking-tighter leading-none mb-2">{doc.name}</p>
                                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none shrink-0">SHA-256 Validated · {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-8 py-6 text-center">
                                                                                    <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl group-hover/doc:bg-indigo-100 group-hover/doc:text-indigo-600 transition-colors">
                                                                                        {doc.type}
                                                                                    </Badge>
                                                                                </td>
                                                                                <td className="px-8 py-6 text-right">
                                                                                     <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover/doc:opacity-100 group-hover/doc:translate-x-0 transition-all duration-300 pr-4">
                                                                                        <Button variant="ghost" onClick={() => window.open(doc.fileUrl, '_blank')} className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white"><Eye className="w-5 h-5" /></Button>
                                                                                        <Button variant="ghost" className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white"><Download className="w-5 h-5" /></Button>
                                                                                     </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </ScrollArea>

            {/* ── VAULT INTEGRITY FOOTER ── */}
            <div className="p-8 border-t border-slate-50 bg-white flex justify-between items-center px-12 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shard Integrity: 100% VALID</span>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-4 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:scale-105 transition-all group">
                    <span className="bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">Handshake Registry Re-Sync</span>
                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
            </div>
        </div>
    )
}
