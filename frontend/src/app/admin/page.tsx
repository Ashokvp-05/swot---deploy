"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { 
    Building2, Users, Shield, Crown, Activity, CreditCard, AlertTriangle, Eye, Settings,
    Ticket, Megaphone, Database, CheckCircle2, XCircle, Server, TrendingUp, MessageSquare,
    Bell, Clock, Lock, Search, Filter, HelpCircle, User, ChevronRight, Home, Plus,
    MoreVertical, Download, Calendar, ArrowUpRight, Info, LayoutDashboard, ShieldCheck,
    Globe, Zap, Cpu, HardDrive, ShieldAlert, Layers, BarChart3, Rocket, Laptop, ClipboardList, Briefcase,
    Search as SearchIcon, Moon, Sun, MoreHorizontal, Power, LogOut,
    UserPlus, Sparkles, FileText, Share2, ClipboardCheck, History, Check
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import dynamic from 'next/dynamic'
import Image from "next/image"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"
import { motion, AnimatePresence } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// ─────────────────────────────────────────────────────────────────────────────
//  DYNAMIC HIGH-FIDELITY MODULES
// ─────────────────────────────────────────────────────────────────────────────
const UserManagementTable = dynamic(() => import("@/components/admin/UserManagementTable"), { 
    ssr: false, 
    loading: () => <div className="p-10 animate-pulse bg-slate-50 rounded-2xl h-96" /> 
})
const AttendanceControlCenter = dynamic(() => import("@/components/admin/AttendanceControlCenter"), { ssr: false })
const LeaveApprovalCenter = dynamic(() => import("@/components/admin/LeaveApprovalCenter"), { ssr: false })
const OrganizationControlCenter = dynamic(() => import("@/components/admin/OrganizationControlCenter"), { ssr: false })
const SecurityAuditLogs = dynamic(() => import("@/components/admin/SecurityAuditLogs").then(m => m.SecurityAuditLogs), { ssr: false })
const SystemSettingsCenter = dynamic(() => import("@/components/admin/SystemSettingsCenter").then(m => m.SystemSettingsCenter), { ssr: false })
const ExecutiveHub = dynamic(() => import("@/components/admin/ExecutiveHub"), { ssr: false })
const SupportControlCenter = dynamic(() => import("@/components/admin/SupportControlCenter"), { ssr: false })
const DocumentsModule = dynamic(() => import("@/components/admin/DocumentsModule"), { ssr: false })
const UserProfileView = dynamic(() => import("@/components/admin/UserProfileView"), { ssr: false })

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN CONTENT COMPONENT (with search params)
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboardContent() {
    const { data: session, status: authStatus } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [scrolled, setScrolled] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [notifications, setNotifications] = useState([
        { title: "Audit Log Accessed", user: "Vikram M.", time: "2 min ago", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
        { title: "New Personnel Synchronized", user: "System Admin", time: "15 min ago", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
        { title: "Policy Update Propagated", user: "HR Policy", time: "45 min ago", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    ])

    const currentTab = searchParams.get("tab") || "dashboard"
    const role = (session?.user?.role || "USER").toUpperCase()
    const companyName = session?.user?.companyName || "Company Shard"
    const token = (session?.user as any)?.accessToken || ""

    // Handle initial scroll and dark mode toggle logic (UI only for now)
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Auth Protection
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push("/login")
            return
        }
        
        // Strict Role Check for Admin families
        const adminRoles = ["ADMIN", "COMPANY_ADMIN", "OPS_ADMIN", "FINANCE_ADMIN", "HR_ADMIN", "VIEWER_ADMIN", "MANAGER", "AUDITOR", "SUPPORT_ADMIN", "PAYROLL_ADMIN", "HELPDESK_ADMIN", "SUPER_ADMIN"]
        if (authStatus === "authenticated" && !adminRoles.includes(role)) {
            router.push("/employee") // Redirect non-admins out of the shard
        }
    }, [authStatus, role, router])

    if (authStatus === "loading") {
        return <div className="flex min-h-screen items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
    }

    const allNavItems = [
        // Core
        { id: "dashboard",   label: "Dashboard",           tab: "dashboard",   icon: LayoutDashboard, roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","MANAGER","AUDITOR","SUPPORT_ADMIN","PAYROLL_ADMIN"], group: "core" },
        // HR Operations
        { id: "employees",   label: "Employees",           tab: "employees",   icon: Users,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","MANAGER"], group: "hr" },
        { id: "departments", label: "Departments",         tab: "departments", icon: Building2,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN"], group: "hr" },
        { id: "attendance",  label: "Attendance",          tab: "attendance",  icon: Clock,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","MANAGER"], group: "hr" },
        { id: "leave",       label: "Leave",               tab: "leave",       icon: Calendar,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","MANAGER"], group: "hr" },
        // Finance
        { id: "reports",     label: "Reports & Analytics", tab: "reports",     icon: BarChart3,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","MANAGER","AUDITOR","PAYROLL_ADMIN"], group: "finance" },
        // Support
        { id: "support",     label: "Support Desk",        tab: "support",     icon: HelpCircle,       roles: ["ADMIN","COMPANY_ADMIN","SUPPORT_ADMIN"], group: "support" },
        // Administration
        { id: "documents",   label: "Documents",           tab: "documents",   icon: FileText,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","AUDITOR"], group: "admin" },
        { id: "audit-logs",  label: "Audit Logs",          tab: "audit-logs",  icon: History,         roles: ["ADMIN","COMPANY_ADMIN","AUDITOR"], group: "admin" },
    ]

    const navGroups = [
        { key: "core", label: "Overview" },
        { key: "hr", label: "HR Operations" },
        { key: "finance", label: "Finance" },
        { key: "support", label: "Support" },
        { key: "admin", label: "Administration" },
    ]

    const navItems = allNavItems.filter(item => item.roles.includes(role) || role === "ADMIN" || role === "COMPANY_ADMIN" || (role === "SUPER_ADMIN" && item.id !== "policies"))

    return (
        <div className="min-h-screen bg-[#f0f2f8] flex">
            
            {/* ── 🛡️ PREMIUM SIDEBAR ── */}
            <aside className="w-[72px] lg:w-[260px] bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 z-[100] shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-500">

                {/* BRAND HEADER */}
                <div className="px-4 lg:px-6 py-5 border-b border-slate-100">
                    <Link href="/admin" className="flex items-center gap-3.5 group cursor-pointer outline-none">
                        <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden lg:flex flex-col justify-center overflow-hidden">
                            <span className="text-sm font-semibold text-slate-800 tracking-tight leading-none">HR Central</span>
                            <span className="text-[10px] font-medium text-indigo-500 tracking-wide mt-0.5 leading-none truncate">{companyName}</span>
                        </div>
                    </Link>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-3 lg:px-4 py-4 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {navGroups.map(group => {
                        const groupItems = navItems.filter(i => i.group === group.key)
                        if (!groupItems.length) return null
                        return (
                            <div key={group.key}>
                                <p className="hidden lg:block px-2 text-[10px] font-medium text-slate-400 tracking-wide mb-1.5">{group.label}</p>
                                <div className="space-y-0.5">
                                    {groupItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = currentTab === item.tab
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => router.push(`/admin?tab=${item.tab}`)}
                                                title={item.label}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 relative group border-l-4",
                                                    isActive
                                                        ? "border-indigo-600 font-bold"
                                                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                                )}
                                            >
                                                <div className="shrink-0 transition-transform group-hover:scale-110">
                                                    <Icon className={cn("w-5 h-5 transition-all", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700")} />
                                                </div>
                                                <span className={cn("hidden lg:block text-[13px] tracking-tight truncate", isActive ? "text-slate-900" : "text-slate-600")}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </nav>

                {/* USER IDENTITY FOOTER */}
                <div className="px-3 lg:px-4 py-4 border-t border-slate-100 bg-slate-50/50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all group outline-none shadow-none hover:shadow-sm">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-md relative">
                                    {(session?.user?.name || "A")[0].toUpperCase()}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                                </div>
                                <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-[12.5px] font-semibold text-slate-800 leading-none truncate w-full">{session?.user?.name?.split(' ')[0] || 'Admin'}</span>
                                    <span className="text-[10px] font-normal text-slate-400 mt-0.5 truncate w-full">{role} · Online</span>
                                </div>
                                <MoreHorizontal className="hidden lg:block w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl shadow-slate-200/80 ml-2 mb-2" side="top" align="start">
                            <div className="px-3 py-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                                <p className="text-[12px] font-bold text-slate-900 truncate">{session?.user?.email || "admin@hr.com"}</p>
                            </div>
                            <div className="h-px bg-slate-100 mx-2 mb-1" />
                            <DropdownMenuItem onClick={() => router.push("/admin?tab=profile")} className="rounded-xl px-3 py-2.5 focus:bg-indigo-50 group cursor-pointer text-slate-600 focus:text-indigo-700 transition-colors">
                                <User className="w-4 h-4 mr-2.5 text-slate-400" />
                                <span className="text-[11px] font-bold">My Profile</span>
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-100 mx-2 my-1" />
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="rounded-xl px-3 py-2.5 focus:bg-rose-50 group cursor-pointer text-rose-500 focus:text-rose-600 transition-colors">
                                <LogOut className="w-4 h-4 mr-2.5" />
                                <span className="text-[11px] font-bold">Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden lg:block mt-3 text-center">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">v4.9.0 · Final</span>
                    </div>
                </div>
            </aside>

            {/* ── 📝 MAIN CONTENT STAGE ── */}
            <main className="flex-1 overflow-y-auto h-screen bg-[#f8fafc]">
                <header className="px-8 py-4 flex items-center justify-between sticky top-0 z-[50] bg-white/90 backdrop-blur-md border-b border-slate-100/60 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Administrative Console</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{companyName} Gateway</span>
                            </div>
                        </div>
                    </div>
                    {/* Simplified header with search and profile only */}
                    
                    {/* UNIVERSAL COMMAND BAR */}
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="hidden md:flex items-center bg-white rounded-xl px-4 py-2.5 border border-slate-200 w-64 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all group">
                            <SearchIcon className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-0 outline-none text-[13px] font-normal text-slate-700 placeholder:text-slate-300 ml-2.5 w-full" 
                            />
                        </div>

                        <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all relative group active:scale-90 shadow-sm outline-none">
                                        <Bell className="w-4 h-4" />
                                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[420px] p-0 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-slate-100 mt-3" align="end">
                                    <div className="pt-6 px-6 pb-5 border-b border-slate-50 bg-slate-50/40">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-xs font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                Live <span className="text-indigo-600">Telemetry</span>
                                            </h3>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] px-2.5 py-1 rounded-full">System Healthy</Badge>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Organizational Pulse Stream</p>
                                    </div>
                                    <div className="max-h-[360px] overflow-y-auto p-4 custom-scrollbar space-y-2">
                                        {notifications.map((notif, i) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, y: 8 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                transition={{ delay: i * 0.04 }} 
                                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all cursor-pointer group"
                                            >
                                                <div className={cn("p-2.5 rounded-lg shadow-sm transition-transform group-hover:scale-110", notif.bg)}>
                                                    <notif.icon className={cn("w-3.5 h-3.5", notif.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate leading-none">{notif.title}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{notif.user} · {notif.time}</p>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-slate-50/50 border-t border-slate-50 rounded-b-2xl">
                                        <Button 
                                            onClick={() => {
                                                setNotifications([])
                                                toast.success("All notifications cleared")
                                            }}
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-white transition-all"
                                        >
                                            Clear All Logs
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-all shadow-sm group">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                            {(session?.user?.name || "A")[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[12.5px] font-medium text-slate-800 leading-none truncate max-w-[90px]">{session?.user?.name?.split(' ')[0] || "Admin"}</span>
                                            <span className="text-[10px] font-normal text-slate-400 mt-0.5">Admin</span>
                                        </div>
                                        <MoreHorizontal className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-white border border-slate-100 rounded-2xl p-2 shadow-xl mt-3 animate-in slide-in-from-top-2 duration-200" align="end">
                                        <DropdownMenuLabel className="px-3 py-2">
                                            <p className="text-[11px] font-normal text-slate-400 leading-none mb-1">Signed in as</p>
                                            <p className="text-[13px] font-medium text-slate-900 truncate">{session?.user?.email || "admin@hr.com"}</p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                        <DropdownMenuItem onClick={() => router.push("/admin?tab=profile")} className="rounded-xl px-3 py-2 focus:bg-indigo-50 cursor-pointer text-[13px] font-medium text-slate-700 focus:text-indigo-700 transition-colors gap-2.5">
                                            <User className="w-4 h-4 text-slate-400" />
                                            My Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                        <DropdownMenuItem 
                                            onClick={() => signOut({ callbackUrl: '/login' })} 
                                            className="rounded-xl px-3 py-2 focus:bg-rose-50 cursor-pointer text-[13px] font-medium text-rose-500 focus:text-rose-600 transition-colors gap-2.5"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <div className="max-w-[1600px] px-10 pb-32 space-y-8">
                
                {/* QUICK HEADER — removed duplicate, handled by sticky top header */}
                {currentTab !== "audit-logs" && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
                                {navItems.find(i => i.id === currentTab)?.label || "Dashboard"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5 uppercase tracking-widest">
                                <Globe className="w-3 h-3 text-indigo-400" /> {companyName} • Protocol Registry
                            </p>
                        </div>
                    </div>
                )}

                {/* MODULES RENDERING */}
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                    
                    {currentTab === "dashboard" && <ExecutiveHub token={token} hideVitals={true} />}

                    {currentTab === "employees"   && <UserManagementTable token={token} />}
                    {currentTab === "departments"  && <OrganizationControlCenter token={token} />}
                    {currentTab === "policies"     && <SystemSettingsCenter token={token} />}
                    {currentTab === "attendance"   && <AttendanceControlCenter token={token} />}
                    {currentTab === "leave"        && <LeaveApprovalCenter token={token} />}
                    {currentTab === "audit-logs"   && <SecurityAuditLogs token={token} />}
                    {currentTab === "reports"      && <ExecutiveHub token={token} />}
                    {currentTab === "support"      && <SupportControlCenter token={token} />}

                    {currentTab === "documents" && (
                        <DocumentsModule token={token} />
                    )}

                    {/* PROFILE MODULE */}
                    {currentTab === "profile" && (
                        <UserProfileView 
                            user={session?.user || { name: "Admin", email: "admin@hr.com" }} 
                            onClose={() => router.push("/admin?tab=dashboard")}
                            token={token}
                        />
                    )}
                </div>
                </div>
            </main>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT PAGE EXPORT (with Suspense for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────
export default function CompanyAdminPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-white shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Administrative Core</p>
                </div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    )
}
