"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, Plus, Search, Filter, MoreVertical,
    AtSign, Shield, Phone, Calendar, Briefcase,
    Building, MapPin, Loader2, UserPlus, FileDown,
    Trash2, Edit3, UserCheck, UserX, Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import UserProfileView from "./UserProfileView"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
    id: string
    name: string
    email: string
    status: string
    deptId?: string
    department?: { name: string }
    designationId?: string
    designation?: { name: string }
    branchId?: string
    branch?: { name: string }
    role?: { name: string }
    joiningDate?: string
    createdAt: string
}

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .glass-table-row {
            background: rgba(255, 255, 255, 0.02);
            transition: all 0.2s ease;
        }
        .glass-table-row:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: scale(1.002);
        }
    `}</style>
)

export default function UserManagement({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "", email: "", password: "changeMe123!",
        deptId: "", designationId: "", branchId: "",
        roleName: "EMPLOYEE"
    })
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const [depts, setDepts] = useState<{ id: string, name: string }[]>([])
    const [desigs, setDesigs] = useState<{ id: string, name: string }[]>([])
    const [branches, setBranches] = useState<{ id: string, name: string }[]>([])

    const fetchOrgData = useCallback(async () => {
        try {
            const [dRes, dsRes, bRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/departments`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/designations`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/branches`, { headers: { "Authorization": `Bearer ${token}` } })
            ])
            const [d, ds, b] = await Promise.all([dRes.json(), dsRes.json(), bRes.json()])
            setDepts(Array.isArray(d) ? d : [])
            setDesigs(Array.isArray(ds) ? ds : [])
            setBranches(Array.isArray(b) ? b : [])
        } catch (err) { console.error("Org fetch failed") }
    }, [token])

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=ALL`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setUsers(data.users || [])
            else toast.error("Failed to load users")
        } catch (err) { toast.error("Network error") }
        finally { setLoading(false) }
    }, [token])

    useEffect(() => {
        fetchUsers()
        fetchOrgData()
    }, [fetchUsers, fetchOrgData])

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                toast.success("Personnel account provisioned")
                setIsAddOpen(false)
                fetchUsers()
            } else {
                const err = await res.json()
                toast.error(err.error || "Provisioning failed")
            }
        } catch (err) { toast.error("Network error") }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 font-body">
            <GlobalStyles />

            {/* SEARCH & PRIMARY ACTIONS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div className="flex items-center gap-3 w-full lg:w-[450px]">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Find personnel by name, email or ID..."
                            className="pl-11 h-12 bg-slate-900/60 border-white/5 text-white rounded-[14px] focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-600 shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button variant="outline" className="h-12 border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-[14px] gap-2 font-bold text-[10px] uppercase tracking-widest flex-1 lg:flex-none">
                        <FileDown className="w-4 h-4" />
                        Export Census
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 bg-white text-black hover:bg-slate-200 rounded-[14px] shadow-xl shadow-white/5 font-black uppercase text-[10px] tracking-widest flex-1 lg:flex-none font-brand">
                                Add Employee
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-950 border-white/10 text-white max-w-2xl rounded-[32px] overflow-hidden p-0 shadow-2xl">
                            <form onSubmit={handleAddUser}>
                                <div className="p-8 border-b border-white/5 bg-slate-900/50">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black uppercase tracking-tight italic font-brand">Add Employee</DialogTitle>
                                        <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Fill out the form below.</DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-8">
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                            <Input className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-sm font-medium focus:ring-indigo-500" placeholder="e.g. John Doe" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Email</label>
                                            <Input className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-sm font-medium focus:ring-indigo-500" type="email" placeholder="john@company.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Role</label>
                                            <Select value={formData.roleName} onValueChange={(v) => setFormData({ ...formData, roleName: v })}>
                                                <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    <SelectItem value="EMPLOYEE">Standard Employee</SelectItem>
                                                    <SelectItem value="HR_ADMIN">HR Administrator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department Unit</label>
                                            <Select value={formData.deptId} onValueChange={(v) => setFormData({ ...formData, deptId: v })}>
                                                <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                    <SelectValue placeholder="Unassigned" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    {depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Job Designation</label>
                                            <Select value={formData.designationId} onValueChange={(v) => setFormData({ ...formData, designationId: v })}>
                                                <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                    <SelectValue placeholder="Unassigned" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    {desigs.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Branch</label>
                                            <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                                                <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                    <SelectValue placeholder="Unassigned" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-900/50 flex font-brand">
                                    <Button type="submit" className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-white/5 transition-transform active:scale-95">Complete Provisioning</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* EMPLOYEE LIST */}
            <div className="bg-slate-950/40 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                {loading ? (
                    <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-slate-500 font-brand">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                        <p className="font-bold text-[10px] uppercase tracking-[0.5em]">Calibrating personnel registry...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="h-[500px] flex flex-col items-center justify-center text-center p-12">
                        <div className="p-6 bg-slate-900 rounded-full mb-6 border border-white/5 opacity-50">
                            <Users className="w-16 h-16 text-slate-700" />
                        </div>
                        <h4 className="text-white font-black uppercase tracking-tight text-xl font-brand italic">Zero Registry Results</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 max-w-sm leading-relaxed">No personnel identities match your current search parameters or filter criteria.</p>
                        <Button variant="link" onClick={() => setSearch("")} className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mt-4">Reset Query</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-900/40 font-brand italic">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="glass-table-row border-b border-white/[0.03] group last:border-0 cursor-pointer"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <Avatar className="h-11 w-11 border border-white/10 shadow-xl group-hover:border-indigo-500/50 transition-colors duration-500 ring-2 ring-transparent group-hover:ring-indigo-500/10">
                                                        <AvatarImage src={(user as any).avatarUrl} />
                                                        <AvatarFallback className="bg-slate-900 text-[10px] font-black text-indigo-400 leading-none">
                                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {user.status === 'ACTIVE' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-950 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[15px] font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors duration-300 font-brand">
                                                            {user.name}
                                                        </span>
                                                        {user.role?.name === 'ADMIN' && (
                                                            <div className="p-1 bg-amber-500/10 rounded-md">
                                                                <Crown className="w-3 h-3 text-amber-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.05em] flex items-center gap-2">
                                                        {user.designation?.name || <span className="text-slate-700 italic">No Designation</span>}
                                                        <span className="text-slate-800">•</span>
                                                        <span className="lowercase font-medium">{user.email}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Building className="w-3.5 h-3.5 text-indigo-500/70" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none group-hover:text-white transition-colors">
                                                        {user.department?.name || <span className="text-slate-700">Unassigned</span>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider leading-none">
                                                        {user.branch?.name || <span className="text-slate-800">Global Node</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={cn(
                                                "border-none h-6 px-3 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg",
                                                user.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5" :
                                                    user.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/5" :
                                                        "bg-rose-500/10 text-rose-500 shadow-rose-500/5"
                                            )}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-[11px] font-bold tracking-tight">
                                                        {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "Provisioning..."}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Registry: {new Date(user.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-6 border-t border-white/5 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-center px-8 gap-4 mt-auto">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-brand italic">Personnel Synchronized: {filteredUsers.length} Units</p>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-5 border-white/5 bg-transparent text-[9px] font-black uppercase text-slate-500 tracking-widest hover:bg-white/5 hover:text-white rounded-xl transition-all">Previous Block</Button>
                        <Button variant="outline" size="sm" className="h-9 px-5 border-white/5 bg-transparent text-[9px] font-black uppercase text-slate-500 tracking-widest hover:bg-white/5 hover:text-white rounded-xl transition-all">Next Block</Button>
                    </div>
                </div>
            </div>

            {/* FULL PROFILE DETAIL VIEWER OVERLAY */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-5xl h-full shadow-2xl"
                        >
                            <UserProfileView
                                user={selectedUser}
                                onClose={() => setSelectedUser(null)}
                                token={token}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
