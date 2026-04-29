"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect, useCallback } from "react"
import { 
    Building2, Users, Shield, Crown, Activity, CreditCard, AlertTriangle, Eye, Settings,
    Ticket, Megaphone, Database, CheckCircle2, XCircle, Server, TrendingUp, MessageSquare,
    Bell, Clock, Lock, Search, Filter, HelpCircle, User, ChevronRight, Home, Plus,
    MoreVertical, Download, Calendar, ArrowUpRight, Info, LayoutDashboard, ShieldCheck,
    Globe, Zap, Cpu, HardDrive, ShieldAlert, Layers, BarChart3, Rocket, Laptop, ClipboardList, Briefcase,
    Search as SearchIcon, Moon, Sun, MoreHorizontal, Power, LogOut,
    UserPlus, Sparkles, FileText, Share2, ClipboardCheck, History, Check, UserCheck,
    Monitor, ExternalLink
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import TopHeader from "@/components/layout/TopHeader"
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
const PayrollControlCenter = dynamic(() => import("@/components/admin/PayrollControlCenter"), { ssr: false })
const BroadcastCenter = dynamic(() => import("@/components/admin/BroadcastCenter").then(m => m.BroadcastCenter), { ssr: false })
const DepartmentReports = dynamic(() => import("@/components/admin/DepartmentReports"), { ssr: false })
const EmployeeDetailsModule = dynamic(() => import("@/components/admin/EmployeeDetailsModule"), { ssr: false })
const ManagerReports = dynamic(() => import("@/components/manager/ManagerReports"), { ssr: false })
const OnboardingSuite = dynamic(() => import("@/components/admin/OnboardingSuite"), { ssr: false })
const PerformanceHub = dynamic(() => import("@/components/admin/PerformanceHub"), { ssr: false })

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES (Admin Hub Aesthetics)
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }

        .sidebar-scrollbar::-webkit-scrollbar { width: 4px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .sidebar-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
    `}</style>
)

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

    // ── Leave sidebar dropdown state ──
    const [leaveDropOpen, setLeaveDropOpen] = useState(false)
    const [leaveDropTab, setLeaveDropTab] = useState<'present' | 'absent'>('present')
    const [sidebarEmployees, setSidebarEmployees] = useState<any[]>([])
    const [sidebarLeaves, setSidebarLeaves] = useState<any[]>([])

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

    // ── Fetch sidebar attendance when dropdown is open ──
    const fetchSidebarAttendance = useCallback(async () => {
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        try {
            const [empRes, lvRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/employees`, { headers }).catch(() => null),
                fetch(`${API_BASE_URL}/admin/leave-requests`, { headers }).catch(() => null),
            ])
            if (empRes?.ok) {
                const raw = await empRes.json()
                setSidebarEmployees(Array.isArray(raw) ? raw : raw.users || [])
            }
            if (lvRes?.ok) {
                const raw = await lvRes.json()
                const arr = Array.isArray(raw) ? raw : raw.requests || []
                const now = new Date()
                const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const dayEnd = new Date(dayStart.getTime() + 86_400_000)
                setSidebarLeaves(arr.filter((l: any) => l.status === 'APPROVED' && new Date(l.startDate) <= dayEnd && new Date(l.endDate) >= dayStart))
            }
        } catch {}
    }, [token])

    useEffect(() => {
        if (!leaveDropOpen) return
        fetchSidebarAttendance()
        const iv = setInterval(fetchSidebarAttendance, 30000)
        return () => clearInterval(iv)
    }, [leaveDropOpen, fetchSidebarAttendance])

    const sidebarAbsentIds = new Set(sidebarLeaves.map((l: any) => l.userId || l.user?.id))
    const sidebarActive = sidebarEmployees.filter(e => e.status === 'ACTIVE' || !e.status)
    const sidebarPresent = sidebarActive.filter(e => !sidebarAbsentIds.has(e.id))
    const sidebarAbsent = sidebarActive.filter(e => sidebarAbsentIds.has(e.id))

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
        // 1. Dashboard
        { id: "dashboard",   label: "Dashboard",           tab: "dashboard",   icon: LayoutDashboard, roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","MANAGER","AUDITOR","SUPPORT_ADMIN","PAYROLL_ADMIN","SUPER_ADMIN"], group: "core" },
        // 2. Employee Management
        { id: "employees",   label: "Manage Employees", tab: "employees",   icon: Users,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "hr" },
        // 3. Onboarding
        { id: "onboarding",  label: "Add Employees", tab: "onboarding",  icon: UserPlus,        roles: ["SUPER_ADMIN", "HR_ADMIN", "HR", "COMPANY_ADMIN", "ADMIN"], group: "hr" },
        // 4. Attendance
        { id: "attendance",  label: "Attendance",          tab: "attendance",  icon: Clock,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "finance" },
        // 5. Leave Management
        { id: "leave",       label: "Leaves",    tab: "leave",       icon: Calendar,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "finance" },
        { id: "payroll",     label: "Payroll",             tab: "payroll",     icon: CreditCard,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","PAYROLL_ADMIN"], group: "finance" },
        // 7. Performance
        { id: "performance", label: "Performance",         tab: "performance", icon: TrendingUp,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","MANAGER"], group: "company" },
        // 8. Departments / Organization
        { id: "departments", label: "Departments",         tab: "departments", icon: Building2,       roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN"], group: "company" },
        // 9. Documents
        { id: "documents",   label: "Documents",           tab: "documents",   icon: FileText,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","AUDITOR"], group: "company" },
        // Employee Details (Secure Record View)
        { id: "employee-details", label: "Employee Info", tab: "employee-details", icon: UserCheck, roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER","AUDITOR"], group: "company" },
        // 10. Reports & Analytics
        { id: "reports",     label: "Reports", tab: "reports",     icon: BarChart3,       roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER","AUDITOR","PAYROLL_ADMIN"], group: "admin" },
        // 11. Support Desk
        { id: "support",     label: "Help",        tab: "support",     icon: HelpCircle,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","SUPPORT_ADMIN"], group: "admin" },

        // 13. Settings
        { id: "settings",    label: "Settings",            tab: "settings",    icon: Settings,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN"], group: "admin" },
        // 14. Announcements
        { id: "announcements", label: "Announcements",     tab: "broadcasts",  icon: Megaphone,       roles: ["SUPER_ADMIN"], group: "company" },
        // 15. Dept Reports
        { id: "dept-reports",  label: "Department Reports",      tab: "dept-reports", icon: BarChart3,       roles: ["SUPER_ADMIN"], group: "company" },
        // 16. Task Dashboard (External - Kibana)
        { id: "task-dashboard", label: "Task Dashboard",   tab: "task-dashboard", icon: Monitor,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "tools", external: true, href: "https://task.swotpam.com/" },
    ]

    const navItems = allNavItems.filter(item => {
        // First check if role is allowed
        const isAllowedByRole = item.roles.includes(role) || role === "ADMIN" || role === "COMPANY_ADMIN";
        
        // Then apply specific exclusions for SUPER_ADMIN
        if (role === "SUPER_ADMIN") {
            const exclusions = ["policies", "onboarding", "payroll", "departments", "performance", "documents"];
            if (exclusions.includes(item.id)) return false;
        }
        
        return isAllowedByRole;
    })

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex font-body overflow-hidden">
            <GlobalStyles />
            
            {/* ── 🛡️ EXECUTIVE SIDEBAR ── */}
            <aside className="w-[72px] lg:w-[280px] bg-white flex flex-col h-screen sticky top-0 z-[100] shrink-0 border-r border-slate-200/80 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />

                {/* BRAND HEADER */}
                <div className="pt-10 pb-10 px-6 lg:px-8 relative z-10">
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer" onClick={() => router.push('/admin')}>
                            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Rudratic</h2>
                            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mt-2 leading-none">Admin Workspace</p>
                        </div>
                    </div>
                    <div className="lg:hidden flex items-center justify-center">
                        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30" onClick={() => router.push('/admin')}>
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-4 lg:px-5 py-2 overflow-y-auto sidebar-scrollbar relative z-10">
                    <div className="space-y-8">
                        {['core', 'hr', 'finance', 'company', 'admin', 'tools'].map(group => {
                            const groupItems = navItems.filter(i => i.group === group)
                            if(groupItems.length === 0) return null

                            const groupLabels: Record<string, string> = {
                                'core': 'Main',
                                'hr': 'Staff',
                                'finance': 'Daily Work',
                                'company': 'Company',
                                'admin': 'Admin',
                                'tools': 'Tools'
                            }

                            return (
                                <div key={group} className="space-y-1.5">
                                    <p className="hidden lg:block text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] px-4 mb-3">{groupLabels[group]}</p>
                                    <div className="space-y-0.5">
                                        {groupItems.map(item => {
                                            const Icon = item.icon
                                            const isExternal = 'external' in item && (item as any).external
                                            const isActive = !isExternal && currentTab === item.tab
                                            const isLeaveItem = item.id === 'leave'

                                            return (
                                                <div key={item.id}>
                                                    <button
                                                        onClick={() => {
                                                            if (isExternal) {
                                                                window.location.href = (item as any).href
                                                            } else {
                                                                router.push(`/admin?tab=${item.tab}`)
                                                                if (isLeaveItem) setLeaveDropOpen(prev => !prev)
                                                            }
                                                        }}
                                                        title={item.label}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative outline-none",
                                                            isActive 
                                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                                                                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-center lg:justify-start gap-3.5 w-full">
                                                            <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors duration-200", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} strokeWidth={isActive ? 2.5 : 1.8} />
                                                            <span className="hidden lg:inline-block text-left truncate">{item.label}</span>
                                                            {isExternal && <ExternalLink className="hidden lg:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-auto" />}
                                                            {isLeaveItem && <ChevronRight className={cn("hidden lg:block w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-300 text-slate-400", leaveDropOpen && "rotate-90 text-indigo-500")} />}
                                                        </div>
                                                        {isActive && (
                                                            <motion.div layoutId="activeSidebarIndicator" className="hidden lg:block absolute -left-[5px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full" />
                                                        )}
                                                    </button>

                                                    {/* ── LEAVE DROPDOWN: Present / Absent ── */}
                                                    {isLeaveItem && (
                                                        <AnimatePresence>
                                                            {leaveDropOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3, ease: "circOut" }}
                                                                    className="overflow-hidden hidden lg:block ml-4 mt-1 border-l border-slate-200"
                                                                >
                                                                    <div className="pl-4 space-y-0.5 pb-1">
                                                                        <button onClick={() => router.push('/admin?tab=attendance-present')}
                                                                            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all",
                                                                                currentTab === 'attendance-present' ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-700")}>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", currentTab === 'attendance-present' ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "bg-slate-300")} />
                                                                            Present
                                                                            <span className="ml-auto text-[10px] opacity-60">{sidebarPresent.length}</span>
                                                                        </button>
                                                                        <button onClick={() => router.push('/admin?tab=attendance-absent')}
                                                                            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all",
                                                                                currentTab === 'attendance-absent' ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-slate-700")}>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", currentTab === 'attendance-absent' ? "bg-rose-500 shadow-[0_0_6px_rgba(251,113,133,0.4)]" : "bg-slate-300")} />
                                                                            Absent
                                                                            <span className="ml-auto text-[10px] opacity-60">{sidebarAbsent.length}</span>
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </nav>

                {/* USER IDENTITY FOOTER */}
                <div className="px-5 py-6 mt-auto border-t border-slate-200/80 relative z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100/80 transition-all group outline-none">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm relative shadow-md shadow-indigo-500/30">
                                    {(session?.user?.name || "A")[0].toUpperCase()}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                                </div>
                                <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-[13px] font-bold text-slate-800 leading-none truncate w-full">{session?.user?.name?.split(' ')[0] || 'Admin'}</span>
                                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-1.5 truncate w-full">{role.replace('_', ' ')}</span>
                                </div>
                                <ChevronRight className="hidden lg:block w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 bg-white border border-slate-100 rounded-[32px] p-3 shadow-2xl ml-4 mb-4">
                            <div className="px-5 py-4 mb-2 bg-slate-50/50 rounded-[22px]">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Logged In</p>
                                <p className="text-[13px] font-semibold text-slate-900 truncate">{session?.user?.email || "admin@hr.com"}</p>
                            </div>
                            <DropdownMenuItem onClick={() => router.push("/admin?tab=profile")} className="rounded-xl px-4 py-3 focus:bg-slate-50 group cursor-pointer text-slate-600 transition-all">
                                <User className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-900" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 my-2" />
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="rounded-xl px-4 py-3 focus:bg-rose-50 group cursor-pointer text-rose-500 transition-all">
                                <LogOut className="w-4 h-4 mr-3" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* ── 📝 COMMAND STAGE ── */}
            <main className="flex-1 overflow-y-auto h-screen bg-[#fcfcfd] custom-scrollbar">
                <TopHeader 
                    token={token} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                />

                <div className="max-w-[1700px] mx-auto px-10 py-10">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="min-h-full"
                        >
                            {currentTab === "dashboard" && <ExecutiveHub token={token} hideVitals={true} />}
                            {currentTab === "employees"   && <UserManagementTable token={token} userRole={role} />}
                            {currentTab === "onboarding"  && <OnboardingSuite token={token} />}
                            {currentTab === "attendance"   && <AttendanceControlCenter token={token} />}
                            {currentTab === "leave"        && <LeaveApprovalCenter token={token} />}
                            {currentTab === "payroll"      && <PayrollControlCenter token={token} />}
                            {currentTab === "performance"  && <PerformanceHub token={token} />}
                            {currentTab === "departments"  && <OrganizationControlCenter token={token} />}
                            {currentTab === "documents" && <DocumentsModule token={token} />}
                            {currentTab === "employee-details" && <EmployeeDetailsModule token={token} userRole={role} />}
                            {currentTab === "reports"      && <ManagerReports token={token} />}
                            {currentTab === "support"      && <SupportControlCenter token={token} />}
                            {currentTab === "user-management"   && <SecurityAuditLogs token={token} />}
                            {currentTab === "settings"     && <SystemSettingsCenter token={token} />}
                            {currentTab === "broadcasts"   && <BroadcastCenter token={token} />}
                            {currentTab === "dept-reports" && <DepartmentReports token={token} />}

                            {/* ── HIGH-FIDELITY ATTENDANCE LISTS ── */}
                            {(currentTab === "attendance-present" || currentTab === "attendance-absent") && (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-6">
                                        <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110",
                                            currentTab === 'attendance-present' ? "bg-emerald-600 shadow-emerald-100" : "bg-rose-600 shadow-rose-100")}>
                                            {currentTab === 'attendance-present' ? <UserCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                                        </div>
                                        <div className="space-y-2">
                                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">
                                                {currentTab === 'attendance-present' ? 'Present Today' : 'Absent Today'}
                                            </h1>
                                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em]">
                                                Current List · {currentTab === 'attendance-present' ? sidebarPresent.length : sidebarAbsent.length} People
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {(currentTab === 'attendance-present' ? sidebarPresent : sidebarAbsent).map((emp, i) => (
                                            <motion.div
                                                key={emp.id || i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="bg-white border border-slate-50 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 hover:border-indigo-100 transition-all group flex items-center justify-between gap-10"
                                            >
                                                <div className="flex items-center gap-6 min-w-0 flex-1">
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm group-hover:rotate-6 transition-all shrink-0",
                                                        currentTab === 'attendance-present' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                                        {(emp.name || 'E')[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-10 flex-1">
                                                        <div className="min-w-[240px]">
                                                            <h3 className="text-[17px] font-bold text-slate-800 tracking-tight font-brand group-hover:text-indigo-600 transition-colors truncate">
                                                                {emp.name}
                                                            </h3>
                                                            <p className="text-[11px] font-bold text-slate-400 truncate mt-1">{emp.email}</p>
                                                        </div>
                                                        
                                                        <div className="hidden xl:flex items-center gap-4 text-slate-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">ID</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.id?.split('-')[0] || 'SYS'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 shrink-0">
                                                    <Badge className={cn("text-[9px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full border-none shadow-sm",
                                                        currentTab === 'attendance-present' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
                                                        {currentTab === 'attendance-present' ? 'Present' : 'Absent'}
                                                    </Badge>
                                                    <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PROFILE MODULE */}
                            {currentTab === "profile" && (
                                <UserProfileView 
                                    user={session?.user || { name: "Admin", email: "admin@hr.com" }} 
                                    onClose={() => router.push("/admin?tab=dashboard")}
                                    token={token}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
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
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    )
}
