"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, Plus, Filter, MoreHorizontal, 
    Edit3, Trash2, UserPlus, ShieldAlert,
    Building2, Briefcase, Mail, Phone,
    ChevronRight, Loader2, RefreshCcw,
    UserCheck, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import UserProfileView from "./UserProfileView"
import AddEmployeeModal from "./AddEmployeeModal"

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

export default function UserManagementTable({ token, userRole }: { token: string, userRole: string }) {
    const API = process.env.NEXT_PUBLIC_API_URL
    const isAuthorized = ['SUPER_ADMIN', 'HR_MANAGER', 'HR_ADMIN'].includes(userRole.toUpperCase())
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [editUser, setEditUser] = useState<any>(null)
    const [deleteUser, setDeleteUser] = useState<any>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            setUsers(Array.isArray(data) ? data : (data.users || []))
        } catch { toast.error("Database connection failure") }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchUsers() }, [token])

    const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm h-full flex flex-col font-body">
            
            {/* FUNCTIONAL COMMAND BAR */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center gap-6 bg-white shrink-0">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter personnel registry..."
                        className="pl-11 h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-indigo-100 transition-all"
                    />
                </div>
                <Button 
                    onClick={() => setIsAddOpen(true)}
                    className="h-12 bg-slate-900 hover:bg-black text-white rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    Add Employee
                </Button>
            </div>

            {/* TABLE MANIFEST - ADDED COLOR DIVERSITY & CLARITY */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="px-8 py-5 grid grid-cols-[1fr_200px_140px_140px] items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <span>Employee</span>
                    <span className="text-center">Role Node</span>
                    <span className="text-center">Status Matrix</span>
                    <span className="text-right px-4">Actions</span>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing database...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-[40px] animate-ping" />
                            <ShieldAlert className="w-10 h-10 text-indigo-600 relative z-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-800">Operational Vacancy</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Strategic reconnaissance found no matching identities</p>
                        </div>
                        <Button 
                            onClick={() => setSearch("")}
                            variant="outline" 
                            className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Reset Registry Filter
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 0.998 }}
                                onClick={() => {
                                    if (isAuthorized) {
                                        setSelectedUser(user)
                                    } else {
                                        toast.error("Restricted Executive Access: Only HR & Super Admin can view personnel dossiers.")
                                    }
                                }}
                                className={cn(
                                    "px-8 py-5 grid grid-cols-[1fr_200px_140px_140px] items-center transition-all group/row border border-transparent",
                                    isAuthorized ? "cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-100" : "cursor-not-allowed opacity-80"
                                )}
                            >
                                {/* Employee Info with Diverse Colors */}
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "h-12 w-12 rounded-[18px] border flex items-center justify-center font-black text-sm shrink-0 transition-all",
                                        getAvatarColor(user.name),
                                        isAuthorized && "group-hover/row:scale-110"
                                    )}>
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-[14px] font-bold text-slate-900 transition-colors uppercase tracking-tight truncate",
                                            isAuthorized && "group-hover/row:text-indigo-600 group-hover/row:underline underline-offset-4 decoration-indigo-200"
                                        )}>{user.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium lowercase mt-0.5 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* Role Manifest with Color Pills */}
                                <div className="flex justify-center">
                                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50/30 text-indigo-600/80 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none">
                                        {user.role?.name || "Member"}
                                    </Badge>
                                </div>

                                {/* Status Matrix */}
                                <div className="flex justify-center">
                                    <Badge className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-none",
                                        user.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {user.status || "ACTIVE"}
                                    </Badge>
                                </div>

                                {/* Professional Actions Hub */}
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditUser(user); }}
                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-indigo-50 border border-transparent hover:border-indigo-100"
                                    >
                                        <Edit3 className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteUser(user); }}
                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-rose-50 border border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                    <button 
                                        className="ml-2 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/row:bg-indigo-600 group-hover/row:border-indigo-600 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover/row:text-white transition-all" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-8 border-t border-slate-50 bg-white flex justify-between items-center px-10 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        {filtered.length} of {users.length} Personnel Manifested
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                         Node Healthy
                    </span>
                </div>
                <button onClick={fetchUsers} className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group">
                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Sync Node
                </button>
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <UserProfileView 
                        user={selectedUser} 
                        token={token}
                        onClose={() => setSelectedUser(null)} 
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(isAddOpen || editUser || deleteUser) && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        {(isAddOpen || editUser) && (
                            <AddEmployeeModal 
                                token={token} 
                                employee={editUser} 
                                onClose={() => {
                                    setEditUser(null);
                                    setIsAddOpen(false);
                                }} 
                                onSuccess={() => {
                                    setEditUser(null);
                                    setIsAddOpen(false);
                                    fetchUsers();
                                }} 
                            />
                        )}
                        {/* Placeholder for Delete confirmation if needed */}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
