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
    const canManage = !['HR', 'HR_ADMIN', 'AUDITOR'].includes(userRole.toUpperCase())
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
            <div className="p-6 border-b border-slate-50 flex justify-end items-center gap-6 bg-white shrink-0">

                {/* Only Super Admin / Managers can add employees */}
                {canManage && (
                    <Button 
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 bg-slate-900 hover:bg-black text-white rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                    >
                        Add Employee
                    </Button>
                )}
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
                                        setSelectedUser(user)
                                }}
                                className={cn(
                                    "px-8 py-5 grid grid-cols-[1fr_200px_140px_140px] items-center transition-all group/row border border-transparent cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-100"
                                )}
                            >
                                {/* Employee Info with Diverse Colors */}
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "h-12 w-12 rounded-[18px] border flex items-center justify-center font-black text-sm shrink-0 transition-all",
                                        getAvatarColor(user.name),
                                        canManage && "group-hover/row:scale-110"
                                    )}>
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-[14px] font-bold text-slate-900 transition-colors uppercase tracking-tight truncate",
                                            canManage && "group-hover/row:text-indigo-600 group-hover/row:underline underline-offset-4 decoration-indigo-200"
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
                        {deleteUser && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[32px] p-10 max-w-md w-full border border-slate-100 shadow-2xl"
                            >
                                <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center mb-6 mx-auto">
                                    <ShieldAlert className="w-10 h-10 text-rose-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">Delete Account?</h3>
                                <p className="text-sm text-slate-500 text-center mb-8 font-medium">This action will permanently remove <span className="font-bold text-slate-900">{deleteUser.name}</span> from the system registry. This cannot be undone.</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => setDeleteUser(null)}
                                        className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`${API}/admin/users/${deleteUser.id}`, {
                                                    method: 'DELETE',
                                                    headers: { "Authorization": `Bearer ${token}` }
                                                })
                                                if (res.ok) {
                                                    toast.success("Identity purged from manifest")
                                                    setDeleteUser(null)
                                                    fetchUsers()
                                                } else {
                                                    throw new Error()
                                                }
                                            } catch {
                                                toast.error("Operation failed")
                                            }
                                        }}
                                        className="h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20"
                                    >
                                        Delete Forever
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
