"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, Plus, Filter, MoreHorizontal, 
    Edit3, UserX, UserPlus, ShieldAlert,
    Building2, Briefcase, Mail, Phone,
    ChevronRight, Loader2, RefreshCcw,
    UserCheck, ShieldCheck, FileDown, Power
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import AddEmployeeModal from "./AddEmployeeModal"
import { useRouter } from "next/navigation"

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
    const router = useRouter()
    const canManage = !['HR', 'HR_ADMIN', 'AUDITOR'].includes(userRole.toUpperCase())
    const [search, setSearch] = useState("")
    const [editUser, setEditUser] = useState<any>(null)
    const [deactivateUser, setDeactivateUser] = useState<any>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [deptFilter, setDeptFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    
    const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    const { data: usersData, error, mutate: fetchUsers, isValidating } = useSWR(`${API}/users`, fetcher, { 
        revalidateOnFocus: false,
        keepPreviousData: true
    })
    
    const users: any[] = Array.isArray(usersData) ? usersData : (usersData?.users || [])
    const loading = !usersData && !error

    const departments = Array.from(new Set(users.map(u => u.department?.name).filter(Boolean)))

    const filtered = users.filter(u => {
        const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
        const matchDept = deptFilter === "ALL" || u.department?.name === deptFilter
        const matchStatus = statusFilter === "ALL" || u.status === statusFilter
        return matchSearch && matchDept && matchStatus
    })

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(u => u.id))
        else setSelectedIds([])
    }

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const handleExport = () => {
        const toExport = selectedIds.length > 0 ? users.filter(u => selectedIds.includes(u.id)) : filtered
        if (toExport.length === 0) return toast.error("No data to export")
        
        const headers = ["Name", "Email", "Role", "Status", "Department", "Job Title"]
        const rows = toExport.map(u => [
            `"${u.name || ''}"`, `"${u.email || ''}"`, `"${u.role?.name || u.role || ''}"`,
            `"${u.status || ''}"`, `"${u.department?.name || ''}"`, `"${u.designation?.name || ''}"`
        ])
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `employees_export_${new Date().getTime()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(`Exported ${toExport.length} personnel records`)
    }

    return (
        <div className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-full flex flex-col font-body relative">
            <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-bl from-indigo-50/20 to-transparent pointer-events-none" />
            
            {/* 🛠️ STRATEGIC COMMAND BAR */}
            <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/80 backdrop-blur-md shrink-0 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 w-full">
                    <div className="flex-1 w-full max-w-md group">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                            <Input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Staff..."
                                className="h-14 pl-14 bg-slate-50/50 border border-slate-100 rounded-[20px] text-[12px] font-bold placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-50 transition-all"
                            />
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-3 pl-2">
                            Count: {filtered.length} of {users.length} People
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <select 
                            value={deptFilter} 
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="h-14 px-6 pr-10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-14 px-6 pr-10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ON_LEAVE">On Leave</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                    <Button onClick={handleExport} variant="outline" className="h-14 px-8 rounded-[20px] text-[10px] font-bold uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 group">
                        <FileDown className="w-4.5 h-4.5 group-hover:translate-y-0.5 transition-transform" />
                        Download List
                    </Button>
                    {canManage && (
                        <Button 
                            onClick={() => setIsAddOpen(true)}
                            className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] px-10 text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add New
                        </Button>
                    )}
                </div>
            </div>

            {/* 📋 STAFF LIST */}
            <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
                <div className="px-12 py-6 grid grid-cols-[1fr_180px] md:grid-cols-[1fr_220px_160px_160px] items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 sticky top-0 bg-white/95 backdrop-blur-md z-20 font-brand">
                    <span>Staff</span>
                    <span className="hidden md:block text-center">Role</span>
                    <span className="hidden md:block text-center">Status</span>
                    <span className="text-right px-6">Actions</span>
                </div>

                {loading ? (
                    <div className="h-80 flex flex-col items-center justify-center gap-8">
                        <Loader2 className="w-14 h-14 animate-spin text-indigo-600" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-300 animate-pulse">Loading Staff...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="h-[500px] flex flex-col items-center justify-center gap-10">
                        <div className="w-28 h-28 bg-slate-50 rounded-[48px] flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-[48px] animate-ping" />
                            <ShieldAlert className="w-12 h-12 text-slate-200 relative z-10 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div className="text-center space-y-4">
                            <p className="text-[14px] font-bold uppercase tracking-widest text-slate-900 font-brand">No People Found</p>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Search found no matching records</p>
                        </div>
                        <Button 
                            onClick={() => setSearch("")}
                            variant="outline" 
                            className="h-12 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            Reset Search
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 pb-20">
                        {filtered.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="px-12 py-7 grid grid-cols-[1fr_180px] md:grid-cols-[1fr_220px_160px_160px] items-center transition-all group border border-transparent hover:bg-slate-50/50"
                            >
                                {/* Personnel Identity */}
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-[22px] border flex items-center justify-center font-bold text-lg shrink-0 transition-all group-hover:rotate-6 shadow-sm",
                                        getAvatarColor(user.name)
                                    )}>
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[17px] font-bold text-slate-800 tracking-tight font-brand truncate leading-none mb-2">
                                            {user.name}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[12px] text-slate-500 font-medium truncate">{user.email}</p>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{user.id?.split('-')[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Node */}
                                <div className="hidden md:flex justify-center">
                                    <Badge className="bg-slate-50 text-slate-600 border-none text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-sm">
                                        {user.role?.name || "Standard Member"}
                                    </Badge>
                                </div>

                                {/* Operations Status */}
                                <div className="hidden md:flex justify-center">
                                    <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full border border-slate-50 shadow-sm">
                                        <div className={cn("w-2 h-2 rounded-full", user.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]")} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{user.status || "ACTIVE"}</span>
                                    </div>
                                </div>

                                {/* Professional Directives */}
                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditUser(user); }}
                                        className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-[14px] transition-all shadow-sm border border-transparent hover:border-indigo-100"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeactivateUser(user); }}
                                        title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        className={cn(
                                            "h-11 w-11 flex items-center justify-center rounded-[14px] transition-all shadow-sm border border-transparent",
                                            user.status === 'ACTIVE'
                                                ? "text-slate-400 hover:text-amber-600 hover:bg-white hover:border-amber-100"
                                                : "text-slate-400 hover:text-emerald-600 hover:bg-white hover:border-emerald-100"
                                        )}
                                    >
                                        <Power className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/admin?tab=employee-details&userId=${user.id}`)
                                        }}
                                        className="ml-2 w-11 h-11 rounded-[14px] bg-indigo-600 border border-indigo-600 flex items-center justify-center text-white transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* SYNC FOOTER */}
            <div className="p-10 border-t border-slate-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-12 shrink-0 relative z-10">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            Total Staff: <span className="text-slate-800 font-brand font-bold text-[13px]">{filtered.length}</span> / {users.length} People
                        </span>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Online</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={fetchUsers} className="flex items-center gap-3 text-[10px] font-bold text-indigo-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group bg-white border border-indigo-100 px-6 py-3 rounded-full hover:bg-indigo-50 shadow-sm">
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                        Refresh List
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {(isAddOpen || editUser || deactivateUser) && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        >
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
                            {deactivateUser && (() => {
                                const isCurrentlyActive = deactivateUser.status === 'ACTIVE';
                                const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
                                return (
                                <div className="bg-white rounded-[48px] p-12 max-w-md mx-auto border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.1)]">
                                    <div className={cn(
                                        "w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 mx-auto",
                                        isCurrentlyActive ? "bg-amber-50" : "bg-emerald-50"
                                    )}>
                                        {isCurrentlyActive 
                                            ? <UserX className="w-12 h-12 text-amber-600" />
                                            : <UserCheck className="w-12 h-12 text-emerald-600" />
                                        }
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 text-center tracking-tight font-brand mb-4 leading-none">
                                        {isCurrentlyActive ? 'Deactivate' : 'Reactivate'} Staff Member?
                                    </h3>
                                    <p className="text-[13px] text-slate-500 text-center mb-10 font-medium leading-relaxed">
                                        {isCurrentlyActive 
                                            ? <>You are about to deactivate <span className="font-bold text-slate-900 uppercase">{deactivateUser.name}</span>. Their account will be disabled but all data will be preserved.</>
                                            : <>You are about to reactivate <span className="font-bold text-slate-900 uppercase">{deactivateUser.name}</span>. They will regain full system access.</>
                                        }
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <Button 
                                            variant="outline"
                                            onClick={() => setDeactivateUser(null)}
                                            className="h-16 rounded-[22px] text-[10px] font-bold uppercase tracking-widest border-slate-100 hover:bg-slate-50 transition-all"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API}/admin/users/${deactivateUser.id}/status`, {
                                                        method: 'PATCH',
                                                        headers: { 
                                                            "Authorization": `Bearer ${token}`,
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify({ status: newStatus })
                                                    })
                                                    if (!res.ok) throw new Error()
                                                    toast.success(isCurrentlyActive ? "Employee deactivated" : "Employee reactivated")
                                                    setDeactivateUser(null)
                                                    fetchUsers()
                                                } catch {
                                                    toast.error("Operation failed")
                                                }
                                            }}
                                            className={cn(
                                                "h-16 text-white rounded-[22px] text-[10px] font-bold uppercase tracking-widest shadow-2xl transition-all",
                                                isCurrentlyActive 
                                                    ? "bg-amber-600 hover:bg-black shadow-amber-100" 
                                                    : "bg-emerald-600 hover:bg-black shadow-emerald-100"
                                            )}
                                        >
                                            {isCurrentlyActive ? 'Confirm Deactivate' : 'Confirm Activate'}
                                        </Button>
                                    </div>
                                </div>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

