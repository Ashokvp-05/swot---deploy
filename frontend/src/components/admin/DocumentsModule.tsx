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

        .focus-shard {
            background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
            border-color: #6366f1 !important;
            box-shadow: 0 40px 80px -20px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.1);
        }

        .matrix-gradient {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.03), transparent 400px),
                        radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.02), transparent 400px);
        }

        .vault-card {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .vault-card:hover:not(.focus-shard) {
            transform: translateY(-2px);
            border-color: #e2e8f0;
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.05);
        }

        .glass-slot {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .status-pulse-red {
            box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4);
            animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
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
            toast.error("Failed to load documents")
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
            
            {/* ── DOCUMENTS OVERVIEW ── */}
            <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white shrink-0">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                        <Database className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-brand leading-none">Employee <span className="text-indigo-600">Documents</span></h3>
                        <p className="text-[10px] font-bold text-slate-400 font-brand uppercase tracking-widest mt-2.5">
                            {docs.length} Total Documents · Secure Storage
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="h-14 pl-14 bg-slate-50/80 border-none rounded-2xl text-[11px] font-bold uppercase tracking-widest placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-100"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 flex items-center justify-center p-0 text-slate-400">
                         <Filter className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* ── EMPLOYEE DOCUMENTS ── */}
            <ScrollArea className="flex-1 bg-slate-50/20 custom-scrollbar">
                <div className="p-10 space-y-6">
                    {filteredUsers.length === 0 ? (
                        <div className="py-48 flex flex-col items-center justify-center gap-6 opacity-40">
                            <ShieldAlert className="w-16 h-16 text-slate-100" />
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">No employees found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user, idx) => {
                            const userDocs = docs.filter(d => d.userId === user.id || d.employeeId === user.id)
                            const isExpanded = expandedID === user.id

                            const triggerDownload = (fileUrl: string, fileName: string, isDownload: boolean = false) => {
                                if (!fileUrl) return;
                                try {
                                    // If it's base64, create a blob to bypass browser URL limits
                                    if (fileUrl.startsWith('data:')) {
                                        const parts = fileUrl.split(';base64,');
                                        const contentType = parts[0].split(':')[1];
                                        const raw = window.atob(parts[1]);
                                        const rawLength = raw.length;
                                        const uInt8Array = new Uint8Array(rawLength);
                                        for (let i = 0; i < rawLength; ++i) { uInt8Array[i] = raw.charCodeAt(i); }
                                        const blob = new Blob([uInt8Array], { type: contentType });
                                        const url = URL.createObjectURL(blob);
                                        
                                        const a = document.createElement('a');
                                        a.href = url;
                                        if (isDownload) a.download = fileName;
                                        else a.target = '_blank';
                                        
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        setTimeout(() => URL.revokeObjectURL(url), 100);
                                    } else {
                                        const a = document.createElement('a');
                                        a.href = fileUrl;
                                        if (isDownload) a.download = fileName;
                                        else a.target = '_blank';
                                        a.click();
                                    }
                                } catch (e) {
                                    toast.error("Failed to open document");
                                }
                            }

                            return (
                                <motion.div 
                                    key={user.id} 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "vault-card bg-white rounded-[32px] border border-slate-100 overflow-hidden",
                                        isExpanded ? "focus-shard" : ""
                                    )}
                                >
                                    <button 
                                        onClick={() => setExpandedID(isExpanded ? null : user.id)}
                                        className="w-full flex items-center justify-between p-10 hover:bg-slate-50/30 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-7">
                                            <div className={cn(
                                                "w-16 h-16 rounded-[22px] flex items-center justify-center font-bold text-lg shadow-xl group-hover:scale-110 transition-transform font-brand",
                                                getAvatarColor(user.name)
                                            )}>
                                                {user.name?.[0]}{user.name?.[1]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-xl font-bold text-slate-800 tracking-tight font-brand leading-none group-hover:text-indigo-600 transition-colors">
                                                        {user.name}
                                                    </h4>
                                                    <Badge className="bg-white/50 backdrop-blur-md text-slate-400 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border border-slate-100">
                                                        {user.role?.name || user.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="truncate">{user.email}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                    <span className={cn(
                                                        "flex items-center gap-2",
                                                        userDocs.length > 0 ? "text-indigo-600" : "text-slate-300"
                                                    )}>
                                                        <FileText className="w-4 h-4" />
                                                        {userDocs.length} Documents
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className={cn(
                                                "hidden md:flex items-center gap-3 px-5 h-11 rounded-2xl border transition-all",
                                                userDocs.length >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {userDocs.length >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{userDocs.length >= 4 ? "COMPLETE" : "INCOMPLETE"}</span>
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
                                                className="border-t border-slate-100"
                                            >
                                                <div className="matrix-gradient p-10 space-y-10">
                                                    
                                                    {/* CRITICAL DOCUMENTS */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                                        {criticalSlots.map((slot) => {
                                                            const docObj = userDocs.find(d => d.type === slot.category || d.name?.includes(slot.label));
                                                            const exists = !!docObj;
                                                            return (
                                                                <div key={slot.id} className={cn(
                                                                    "p-7 rounded-[32px] transition-all duration-300 flex flex-col gap-6 group/slot",
                                                                    exists ? "bg-white border border-slate-100 shadow-sm hover:border-emerald-200" : "bg-white/40 border border-rose-100/50 hover:border-rose-200"
                                                                )}>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className={cn(
                                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                                            exists ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                                                                        )}>
                                                                            <slot.icon className="w-6 h-6" />
                                                                        </div>
                                                                        {exists ? (
                                                                            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                                                                <Check className="w-4 h-4" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white status-pulse-red">
                                                                                <AlertCircle className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-[13px] font-bold text-slate-800 font-brand tracking-tight mb-1">{slot.label}</h5>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", exists ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
                                                                            <span className={cn("text-[9px] font-bold uppercase tracking-widest", exists ? "text-emerald-600" : "text-rose-500")}>
                                                                                {exists ? "Verified" : "Missing"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        disabled={!exists}
                                                                        onClick={() => exists && triggerDownload(docObj.fileUrl, docObj.name)}
                                                                        className={cn(
                                                                            "w-full h-12 rounded-2xl text-[9px] font-bold uppercase tracking-widest gap-2 transition-all shadow-lg",
                                                                            exists ? "bg-slate-900 text-white border-none hover:bg-slate-800" : "bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed"
                                                                        )}
                                                                    >
                                                                        {exists ? <><Eye className="w-4 h-4 text-white" /> View Document</> : <><Lock className="w-4 h-4" /> Pending</>}
                                                                    </Button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    {/* STANDARD DOCUMENT REGISTER */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-brand ml-1">Employee Document Registry</h5>
                                                        {userDocs.length === 0 ? (
                                                            <div className="py-16 flex flex-col items-center justify-center gap-4 bg-white rounded-[32px] border border-dashed border-slate-200">
                                                                <Archive className="w-12 h-12 text-slate-100" />
                                                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">System Synchronized: No Documents Found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                                                                <table className="w-full text-left">
                                                                    <thead>
                                                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                                                            <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-brand">Document Name</th>
                                                                            <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-brand text-center">Category</th>
                                                                            <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-brand text-right">Actions</th>
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
                                                                                            <p className="text-[14px] font-bold text-slate-900 uppercase font-brand tracking-tight leading-none mb-2">{doc.name}</p>
                                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none shrink-0">Validated · {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-8 py-6 text-center">
                                                                                    <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl group-hover/doc:bg-indigo-100 group-hover/doc:text-indigo-600 transition-colors">
                                                                                        {doc.type}
                                                                                    </Badge>
                                                                                </td>
                                                                                <td className="px-8 py-6 text-right">
                                                                                     <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover/doc:opacity-100 group-hover/doc:translate-x-0 transition-all duration-300 pr-4">
                                                                                        <Button variant="ghost" onClick={() => triggerDownload(doc.fileUrl, doc.name)} className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white"><Eye className="w-5 h-5" /></Button>
                                                                                        <Button variant="ghost" onClick={() => triggerDownload(doc.fileUrl, doc.name, true)} className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white"><Download className="w-5 h-5" /></Button>
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

            {/* ── SYSTEM STATUS ── */}
            <div className="p-8 border-t border-slate-50 bg-white flex justify-between items-center px-12 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: Secure</span>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-4 text-[11px] font-bold text-indigo-600 uppercase tracking-widest hover:scale-105 transition-all group">
                    <span className="bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">Refresh</span>
                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
            </div>
        </div>
    )
}
