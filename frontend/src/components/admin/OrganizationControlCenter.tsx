"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Building2, Users, Briefcase,
    Plus, Search, Edit3, Trash2, ChevronRight,
    Loader2, AlertCircle, CheckCircle2, MoreVertical, ShieldCheck, Zap,
    Edit2, Globe, Command, Layers, Terminal, Network, Activity,
    ShieldAlert, Cpu, Workflow, X, LayoutDashboard, Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface OrgUnit {
    id: string
    name: string
    description?: string
    manager?: { id: string, name: string }
    _count?: { users: number }
    status?: "ACTIVE" | "INACTIVE"
    parentId?: string
    parent?: { id: string, name: string }
}

interface User {
    id: string
    name: string
    email: string
    status: string
    deptId?: string
    designationId?: string
    branchId?: string
    roleId?: string
}

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
            --brand-indigo: #4F46E5;
            --brand-indigo-soft: #EEF2FF;
            --surface-primary: #FFFFFF;
            --surface-secondary: #FAFAFB;
            --text-primary: #111827;
            --text-secondary: #6B7280;
        }

        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .enterprise-card {
            background: #ffffff;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #F1F5F9;
            border-radius: 28px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
            position: relative;
            overflow: hidden;
        }
        
        .enterprise-card:hover {
            transform: translateY(-4px);
            border-color: #E2E8F0;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.04);
        }

        .glass-pill {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #E2E8F0; }
    `}</style>
)

export default function OrganizationControlCenter({ token }: { token: string }) {
    const [activeTab, setActiveTab] = useState("departments")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<OrgUnit[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [viewTeam, setViewTeam] = useState<OrgUnit | null>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const pollRef = useRef<NodeJS.Timeout | null>(null)

    const [newUnit, setNewUnit] = useState({ 
        name: "", 
        description: "", 
        managerId: "", 
        parentId: "", 
        status: "ACTIVE" 
    })

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true)
        setIsSyncing(true)
        try {
            const apiEndpoint = activeTab === "departments" ? "departments" : activeTab === "designations" ? "designations" : activeTab === "branches" ? "branches" : "roles"
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/${apiEndpoint}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (res.ok) setData(result)

            if (!isSilent) {
                const uRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=ALL`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const uData = await uRes.json()
                if (uRes.ok) setUsers(Array.isArray(uData) ? uData : (uData.users || []))
            }
        } catch (err) {
            if (!isSilent) toast.error("Network error occurred")
        } finally {
            setLoading(false)
            setTimeout(() => setIsSyncing(false), 2000)
        }
    }, [activeTab, token])

    useEffect(() => {
        fetchData()
        pollRef.current = setInterval(() => fetchData(true), 30000)
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [fetchData])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUnit.name.trim()) return toast.error("Unit title is required")
        
        try {
            const apiEndpoint = activeTab === "departments" ? "departments" : activeTab === "designations" ? "designations" : activeTab === "branches" ? "branches" : "roles"
            const body = { ...newUnit, managerId: newUnit.managerId || undefined, parentId: newUnit.parentId || undefined }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/${apiEndpoint}`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                toast.success(`${activeTab.slice(0, -1)} added successfully!`)
                setIsAddOpen(false)
                setNewUnit({ name: "", description: "", managerId: "", parentId: "", status: "ACTIVE" })
                fetchData()
            } else {
                const result = await res.json()
                toast.error(result.error || "Action failed")
            }
        } catch (err) { toast.error("Network error occurred") }
    }

    const filteredData = Array.isArray(data) ? data.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    ) : []

    const stats = {
        total: data.length,
        active: data.filter(i => (i.status || "ACTIVE") === "ACTIVE").length,
        inactive: data.filter(i => i.status === "INACTIVE").length,
        employees: data.reduce((acc, curr) => acc + (curr._count?.users || 0), 0)
    }

    const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2"
    const inputCls = "h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm focus:bg-white focus:border-indigo-500 font-semibold transition-all"
    const selectCls = "w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer font-bold transition-all"

    const getTeamMembers = (unitId: string) => {
        return users.filter(u => {
            if (activeTab === 'departments') return u.deptId === unitId
            if (activeTab === 'designations') return u.designationId === unitId
            if (activeTab === 'branches') return u.branchId === unitId
            if (activeTab === 'roles') return u.roleId === unitId
            return false
        })
    }

    return (
        <div className="space-y-12 font-body text-slate-900 pb-20 max-w-7xl mx-auto">
            <GlobalStyles />

            {/* DASHBOARD SUMMARY */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-1000">
                {[
                    { label: `Total ${activeTab}`, value: stats.total, icon: Command, color: "text-slate-900", bg: "bg-slate-50" },
                    { label: "Operational", value: stats.active, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Offline/Inactive", value: stats.inactive, icon: Layers, color: "text-slate-400", bg: "bg-slate-50" },
                    { label: "Personnel Count", value: stats.employees, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:border-indigo-100 transition-all group flex flex-col justify-between h-40">
                        <div className="flex items-center justify-between">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <Activity className="w-4 h-4 text-slate-100 group-hover:text-indigo-200 transition-colors" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className={cn("text-3xl font-bold tracking-tighter", stat.color)}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* NAVIGATION & ACTIONS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative">
                <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl transition-all duration-500 z-10",
                    isSyncing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                )}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    Live Data Synchronization
                </div>

                <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder={`Navigate ${activeTab} registry...`}
                            className="pl-12 h-14 bg-slate-50 border-none text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all font-bold text-[13px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-10 bg-indigo-600 hover:bg-slate-900 text-white rounded-[22px] shadow-2xl shadow-indigo-100 font-black text-[11px] uppercase tracking-widest gap-2.5 active:scale-95 transition-all">
                                <Plus className="w-4 h-4" />
                                Create {activeTab === 'branches' ? 'Branch' : activeTab.slice(0, -1)}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-none text-slate-900 max-w-2xl rounded-[48px] shadow-2xl p-0 overflow-hidden">
                            <form onSubmit={handleAdd}>
                                <div className="p-10 border-b border-slate-50 flex items-center gap-8 bg-slate-50/30">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                                        <Plus className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold font-brand tracking-tight">Deploy New Protocol</DialogTitle>
                                        <DialogDescription className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-2">Registration system for {activeTab}</DialogDescription>
                                    </div>
                                </div>
                                <div className="p-12 space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className={labelCls}>Formal Title</label>
                                            <Input className={inputCls} placeholder="e.g. Legal Operations" value={newUnit.name} onChange={e => setNewUnit({ ...newUnit, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className={labelCls}>Authority Assignment</label>
                                            <select className={selectCls} value={newUnit.managerId} onChange={e => setNewUnit({ ...newUnit, managerId: e.target.value })}>
                                                <option value="">Personnel Database</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Strategic Objectives</label>
                                        <textarea className="w-full bg-slate-50 border border-slate-100 min-h-[140px] rounded-[32px] text-sm font-semibold text-slate-900 p-8 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" 
                                            placeholder="Define the mandate and scope..." value={newUnit.description} onChange={e => setNewUnit({ ...newUnit, description: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="h-14 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Dismiss</Button>
                                        <Button type="submit" className="h-14 bg-indigo-600 text-white hover:bg-black font-black text-[11px] tracking-widest uppercase rounded-2xl shadow-xl transition-all active:scale-95">Commit Registry</Button>
                                    </div>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs value={activeTab} className="w-full lg:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent h-auto p-0 gap-12">
                        {[
                            { id: "departments", icon: Building2, label: "Departments" },
                            { id: "designations", icon: Briefcase, label: "Designations" }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="relative flex items-center gap-4 px-0 py-5 bg-transparent data-[state=active]:bg-transparent text-slate-300 data-[state=active]:text-slate-900 font-bold text-[12px] uppercase tracking-[0.2em] transition-all rounded-none border-b-[3px] border-transparent data-[state=active]:border-indigo-600"
                            >
                                <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-indigo-600" : "text-slate-300")} />
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* MAIN CLASSIFIED CONTENT */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        <div className="col-span-full h-96 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Synchronizing Master Shard...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="col-span-full h-[540px] border border-slate-100 rounded-[56px] flex flex-col items-center justify-center bg-white shadow-inner">
                            <Database className="w-20 h-20 text-slate-50 mb-8" />
                            <h3 className="text-3xl font-bold text-slate-200 tracking-tighter">ZERO MANIFESTED NODES</h3>
                            <Button onClick={() => setIsAddOpen(true)} className="mt-10 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl px-12 h-14 font-black text-[11px] tracking-widest uppercase transition-all">Initialize First Registry</Button>
                        </div>
                    ) : (
                        filteredData.map((item) => (
                            <motion.div key={item.id} layout className="enterprise-card p-10 flex flex-col group min-h-[500px]">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-2xl transition-all group-hover:bg-indigo-600 group-hover:rotate-3">
                                            {activeTab === "departments" ? <Building2 className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[18px] font-bold text-slate-900 tracking-tight leading-none font-brand group-hover:text-indigo-600 transition-colors uppercase">{item.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100 inline-block font-body">NODE: #{item.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-60 bg-white border border-slate-100 rounded-[28px] p-3 shadow-2xl shadow-slate-900/10">
                                            <DropdownMenuItem className="p-4 gap-4 text-xs font-bold text-slate-600 rounded-2xl hover:bg-slate-50 cursor-pointer" onClick={() => setViewTeam(item)}><Users className="w-4 h-4 text-indigo-500" /> Personnel Roster</DropdownMenuItem>
                                            <DropdownMenuItem className="p-4 gap-4 text-xs font-bold text-slate-600 rounded-2xl hover:bg-slate-50 cursor-pointer"><LayoutDashboard className="w-4 h-4 text-indigo-500" /> Matrix Insights</DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                            <DropdownMenuItem className="p-4 gap-4 text-xs font-bold text-rose-500 rounded-2xl hover:bg-rose-50 cursor-pointer hover:text-rose-600"><Trash2 className="w-4 h-4" /> Decommission Node</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex-1">
                                    <p className="text-slate-500 text-[13.5px] leading-relaxed font-medium mb-10 italic pl-6 border-l-2 border-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        "{item.description || "Core infrastructure governing strategic personnel and global resource allocation protocols."}"
                                    </p>

                                    <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-100 transition-all font-body">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover:scale-110">
                                                <Activity className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-2">Protocol Architect</p>
                                                <span className={cn("text-[14px] font-bold tracking-tight", item.manager?.name ? "text-slate-900" : "text-slate-300 font-medium")}>
                                                    {item.manager?.name || "Signatory Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex items-center justify-between px-2">
                                        <div className="flex items-center gap-5">
                                            <div className="flex -space-x-3.5">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="w-9 h-9 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-lg">
                                                        <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-[9px] font-black text-indigo-600 border border-indigo-100">U</div>
                                                    </div>
                                                ))}
                                                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-xl shadow-indigo-100">+{item._count?.users || 0}</div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{item._count?.users || 0} Members</span>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                            (item.status || "ACTIVE") === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                                        )}>
                                            {(item.status || "ACTIVE")}
                                        </div>
                                    </div>
                                </div>

                                {/* PRIMARY ACTIONS BLOCK */}
                                <div className="mt-12 grid grid-cols-2 gap-5">
                                    <Button onClick={() => setViewTeam(item)} className="h-14 bg-slate-900 hover:bg-black text-white rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-2xl active:scale-95">
                                        View Team Members
                                    </Button>
                                    <Button variant="ghost" className="h-14 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center gap-2.5 group/btn">
                                        <Network className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                        Unit Insights
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>

            {/* TEAM ROSTER MODAL - HIGH POLISH */}
            <Dialog open={!!viewTeam} onOpenChange={() => setViewTeam(null)}>
                <DialogContent className="bg-white border-none text-slate-900 max-w-xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-0 overflow-hidden font-body">
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold font-brand tracking-tighter text-slate-900 uppercase">{viewTeam?.name}</DialogTitle>
                                <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Active Personnel Manifest
                                </DialogDescription>
                            </div>
                        </div>
                        <button onClick={() => setViewTeam(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <ScrollArea className="max-h-[65vh] p-10 custom-scrollbar bg-white">
                        <div className="space-y-6">
                            {viewTeam && getTeamMembers(viewTeam.id).length > 0 ? (
                                getTeamMembers(viewTeam.id).map((member, midx) => (
                                    <motion.div 
                                        key={member.id} 
                                        initial={{ opacity:0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: midx * 0.05 }}
                                        className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[28px] hover:border-indigo-600 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                {member.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-slate-900 tracking-tight leading-none mb-1.5 font-brand">{member.name}</p>
                                                <p className="text-[11px] font-semibold text-slate-400 lowercase italic">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={cn(
                                                "h-7 px-4 text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                                                member.status === 'ACTIVE' ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-slate-200 text-slate-500"
                                            )}>
                                                {member.status}
                                            </Badge>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Verified 01</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center opacity-40">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 mb-6">
                                        <Users className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">ZERO ACTIVE PERSONNEL</p>
                                    <p className="text-[10px] text-slate-300 font-bold mt-2">No structural signatures detected in this node.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between px-12">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Integrity Check: <span className="text-emerald-500">Passed</span></p>
                        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-emerald-400 rounded-full" />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
