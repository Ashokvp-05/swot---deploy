"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, MapPin, Briefcase, Mail, Phone, 
    ShieldCheck, Building2, Fingerprint, Activity,
    MoreVertical, Eye, Download, UserCircle, Star,
    Network
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import UserProfileView from "./UserProfileView"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function EmployeeDetailsModule({ token, userRole }: { token: string; userRole: string }) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const urlUserId = searchParams?.get("userId")

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/users?limit=ALL`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await res.json()
                setUsers(Array.isArray(data) ? data : (data.users || []))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
        
        // Polling for live status updates every 30 seconds
        const interval = setInterval(fetchUsers, 30000)
        return () => clearInterval(interval)
    }, [token])

    useEffect(() => {
        if (urlUserId && users.length > 0) {
            const user = users.find(u => u.id === urlUserId)
            if (user) {
                setSelectedUser(user)
            }
        }
    }, [urlUserId, users])

    const handleCloseProfile = () => {
        setSelectedUser(null)
        // Remove userId from URL so it doesn't reopen on refresh
        if (urlUserId) {
            const params = new URLSearchParams(searchParams?.toString() || "")
            params.delete("userId")
            router.replace(`${pathname}?${params.toString()}`)
        }
    }

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   u.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        }).sort((a,b) => a.name.localeCompare(b.name))
    }, [users, searchQuery])

    return (
        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm h-full flex flex-col font-body relative">
            
            {/* Header */}
            <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white shrink-0">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-100">
                        <Network className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase font-brand leading-none">Personnel <span className="text-emerald-500">Directory</span></h3>
                        <p className="text-[10px] font-black text-slate-400 font-brand uppercase tracking-[0.2em] mt-2.5">
                            {users.length} Active Identity Nodes · Secure Registry
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or department..."
                            className="h-14 pl-14 bg-slate-50/80 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-emerald-100"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <ScrollArea className="flex-1 bg-slate-50/30 custom-scrollbar">
                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredUsers.map((user, i) => {
                                const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
                                const isSuper = roleName === 'SUPER_ADMIN';

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedUser(user)}
                                        className="bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <Fingerprint className="w-24 h-24 text-emerald-500" />
                                        </div>

                                        <div className="flex items-start gap-4 mb-6 relative z-10">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 p-1 shrink-0 border border-slate-100">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-[1rem]" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-white rounded-[1rem]">
                                                        <UserCircle className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{user.name}</h4>
                                                <Badge className="mt-2 bg-slate-100 text-slate-500 hover:bg-slate-200 border-none px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                    {roleName || "Employee"}
                                                </Badge>
                                                {user.isLive && (
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Now</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                                <span className="text-[11px] font-bold truncate">{user.designation?.name || "Pending Designation"} • {user.department?.name || "Core"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="text-[11px] font-bold truncate">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                <span className="text-[11px] font-bold truncate">{user.branch?.name || "Global Headquarters"}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Node</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </ScrollArea>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <UserProfileView 
                        user={selectedUser} 
                        token={token} 
                        onClose={handleCloseProfile} 
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
