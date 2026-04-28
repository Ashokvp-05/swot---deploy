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
        { id: "employees",   label: "Employee Management", tab: "employees",   icon: Users,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "hr" },
        // 3. Onboarding
        { id: "onboarding",  label: "Personnel & Onboarding", tab: "onboarding",  icon: UserPlus,        roles: ["SUPER_ADMIN", "HR_ADMIN", "HR", "COMPANY_ADMIN", "ADMIN"], group: "hr" },
        // 4. Attendance
        { id: "attendance",  label: "Attendance",          tab: "attendance",  icon: Clock,           roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "finance" },
        // 5. Leave Management
        { id: "leave",       label: "Leave Management",    tab: "leave",       icon: Calendar,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER"], group: "finance" },
        { id: "payroll",     label: "Payroll",             tab: "payroll",     icon: CreditCard,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","PAYROLL_ADMIN"], group: "finance" },
        // 7. Performance
        { id: "performance", label: "Performance",         tab: "performance", icon: TrendingUp,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","MANAGER"], group: "company" },
        // 8. Departments / Organization
        { id: "departments", label: "Departments",         tab: "departments", icon: Building2,       roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN"], group: "company" },
        // 9. Documents
        { id: "documents",   label: "Documents",           tab: "documents",   icon: FileText,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","AUDITOR"], group: "company" },
        // Employee Details (Secure Record View)
        { id: "employee-details", label: "Employee Details", tab: "employee-details", icon: UserCheck, roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER","AUDITOR"], group: "company" },
        // 10. Reports & Analytics
        { id: "reports",     label: "Reports & Analytics", tab: "reports",     icon: BarChart3,       roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","MANAGER","AUDITOR","PAYROLL_ADMIN"], group: "admin" },
        // 11. Support Desk
        { id: "support",     label: "Support Desk",        tab: "support",     icon: HelpCircle,      roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN","SUPPORT_ADMIN"], group: "admin" },

        // 13. Settings
        { id: "settings",    label: "Settings",            tab: "settings",    icon: Settings,        roles: ["ADMIN","COMPANY_ADMIN","HR_ADMIN","HR","SUPER_ADMIN"], group: "admin" },
        // 14. Announcements
        { id: "announcements", label: "Announcements",     tab: "broadcasts",  icon: Megaphone,       roles: ["SUPER_ADMIN"], group: "company" },
        // 15. Dept Reports
        { id: "dept-reports",  label: "Dept Reports",      tab: "dept-reports", icon: BarChart3,       roles: ["SUPER_ADMIN"], group: "company" },
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
        <div className="min-h-screen bg-[#f0f2f8] flex font-body">
            <GlobalStyles />
            
            {/* ── 🛡️ PROFESSIONAL SIDEBAR ── */}
            <aside className="w-[72px] lg:w-[280px] bg-[#ffffff] border-r border-slate-200/80 flex flex-col h-screen sticky top-0 z-[100] shrink-0">

                {/* BRAND HEADER */}
                <div className="pt-8 pb-8 px-4 lg:px-7 border-b border-slate-100/60">
                    <div className="hidden lg:flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[12px] flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)]">
                            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight font-brand leading-none">Rudratic</h2>
                            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mt-1.5 leading-none bg-indigo-50 px-1.5 py-0.5 rounded pl-1.5 inline-block">Admin Workspace</p>
                        </div>
                    </div>
                    <div className="lg:hidden flex items-center justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[12px] flex items-center justify-center shadow-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-3 lg:px-5 py-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        {['core', 'hr', 'finance', 'company', 'admin', 'tools'].map(group => {
                            const groupItems = navItems.filter(i => i.group === group)
                            if(groupItems.length === 0) return null

                            const groupLabels: Record<string, string> = {
                                'core': 'Overview',
                                'hr': 'Personnel',
                                'finance': 'Operations & Pay',
                                'company': 'Organization',
                                'admin': 'System & Security',
                                'tools': 'Tools & Integrations'
                            }

                            return (
                                <div key={group} className="space-y-1.5">
                                    <p className="hidden lg:block text-[10px] font-bold text-slate-400/80 uppercase tracking-widest px-3 mb-3 font-brand ml-1">{groupLabels[group]}</p>
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
                                                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[13px] font-medium transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                                                        isActive 
                                                            ? "bg-indigo-50/80 text-indigo-700 font-semibold"
                                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-center lg:justify-start gap-3 w-full">
                                                        <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors duration-200", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={isActive ? 2.5 : 2} />
                                                        <span className="hidden lg:inline-block text-left truncate">{item.label}</span>
                                                        {isExternal && <ExternalLink className="hidden lg:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500 shrink-0 ml-auto" />}
                                                        {isLeaveItem && <ChevronRight className={cn("hidden lg:block w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-200 text-slate-400", leaveDropOpen && "rotate-90 text-indigo-500")} />}
                                                    </div>
                                                    {isActive && (
                                                        <motion.div layoutId="activeNavIndicator" className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-600 rounded-r-full" />
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
                                                                transition={{ duration: 0.25 }}
                                                                className="overflow-hidden hidden lg:block"
                                                            >
                                                                <div className="ml-5 mt-1.5 pl-4 border-l-2 border-indigo-100 space-y-2.5">
                                                                    {/* Present Tab Section */}
                                                                    <div className="space-y-1.5">
                                                                        <button onClick={() => setLeaveDropTab('present')}
                                                                            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all",
                                                                                leaveDropTab === 'present' ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")}>
                                                                            <span className={cn("w-2 h-2 rounded-full", leaveDropTab === 'present' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                                                            Present Today
                                                                            <span className={cn("ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                                                                leaveDropTab === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>{sidebarPresent.length}</span>
                                                                        </button>
                                                                        
                                                                        {leaveDropTab === 'present' && (
                                                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="max-h-[160px] overflow-y-auto space-y-1 mt-1 pl-1 custom-scrollbar">
                                                                                {sidebarPresent.slice(0, 8).map((emp, i) => (
                                                                                    <div key={emp.id || i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-emerald-50/50">
                                                                                        <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                                            {(emp.name || 'E')[0].toUpperCase()}
                                                                                        </div>
                                                                                        <span className="text-slate-600 font-medium truncate">{emp.name}</span>
                                                                                    </div>
                                                                                ))}
                                                                                {sidebarPresent.length > 8 && <p className="text-[10px] text-slate-400 text-center py-1 italic">+{sidebarPresent.length - 8} more</p>}
                                                                                {sidebarPresent.length === 0 && <p className="text-[10px] text-slate-400 text-center py-3">No employees present</p>}
                                                                            </motion.div>
                                                                        )}
                                                                    </div>

                                                                    {/* Absent Tab Section */}
                                                                    <div className="space-y-1.5">
                                                                        <button onClick={() => setLeaveDropTab('absent')}
                                                                            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all",
                                                                                leaveDropTab === 'absent' ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")}>
                                                                            <span className={cn("w-2 h-2 rounded-full", leaveDropTab === 'absent' ? "bg-rose-500 animate-pulse" : "bg-slate-300")} />
                                                                            Absent Today
                                                                            <span className={cn("ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                                                                leaveDropTab === 'absent' ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400")}>{sidebarAbsent.length}</span>
                                                                        </button>

                                                                        {leaveDropTab === 'absent' && (
                                                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="max-h-[160px] overflow-y-auto space-y-1 mt-1 pl-1 custom-scrollbar">
                                                                                {sidebarAbsent.slice(0, 8).map((emp, i) => (
                                                                                    <div key={emp.id || i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-rose-50/50">
                                                                                        <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                                            {(emp.name || 'E')[0].toUpperCase()}
                                                                                        </div>
                                                                                        <span className="text-slate-600 font-medium truncate">{emp.name}</span>
                                                                                    </div>
                                                                                ))}
                                                                                {sidebarAbsent.length > 8 && <p className="text-[10px] text-slate-400 text-center py-1 italic">+{sidebarAbsent.length - 8} more</p>}
                                                                                {sidebarAbsent.length === 0 && <p className="text-[10px] text-slate-400 text-center py-3">No employees absent</p>}
                                                                            </motion.div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </nav>

                {/* USER IDENTITY FOOTER */}
                <div className="px-3 lg:px-5 py-5 mt-auto border-t border-slate-100/60 bg-slate-50/30">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center gap-3 p-2 rounded-[14px] hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group outline-none">
                                <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-sm relative">
                                    {(session?.user?.name || "A")[0].toUpperCase()}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>
                                <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-[13px] font-semibold text-slate-900 leading-none truncate w-full">{session?.user?.name?.split(' ')[0] || 'Administrator'}</span>
                                    <span className="text-[11px] font-medium text-slate-500 mt-1 truncate w-full">{role.replace('_', ' ')}</span>
                                </div>
                                <MoreVertical className="hidden lg:block w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 bg-white border border-slate-200 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ml-2 mb-2" side="top" align="start">
                            <div className="px-3 py-3 mb-1 bg-slate-50/50 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Authenticated Account</p>
                                <p className="text-[13px] font-semibold text-slate-900 truncate">{session?.user?.email || "admin@hr.com"}</p>
                            </div>
                            <div className="h-px bg-slate-100 mx-2 my-2" />
                            <DropdownMenuItem onClick={() => router.push("/admin?tab=profile")} className="rounded-xl px-3 py-2.5 focus:bg-slate-50 group cursor-pointer text-slate-600 transition-colors">
                                <User className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <span className="text-[12px] font-medium">My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="rounded-xl px-3 py-2.5 focus:bg-rose-50 group cursor-pointer text-rose-500 focus:text-rose-600 transition-colors">
                                <LogOut className="w-4 h-4 mr-2.5" />
                                <span className="text-[12px] font-medium">Secure Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* ── 📝 MAIN CONTENT STAGE ── */}
            <main className="flex-1 overflow-y-auto h-screen bg-[#f8fafc]">
                <TopHeader 
                    token={token} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                />

                <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">
                
                {/* MODULES RENDERING */}
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    
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
