"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { getProfileLinkByRole } from "@/lib/role-redirect"
import { 
    Building2, Users, Shield, Crown, Activity, CreditCard, AlertTriangle, Eye, Settings,
    Ticket, Megaphone, Database, CheckCircle2, XCircle, Server, TrendingUp, MessageSquare,
    Bell, Clock, Lock, Search, Filter, HelpCircle, User, ChevronRight, Home, Plus,
    MoreVertical, Download, Calendar, ArrowUpRight, Info, LayoutDashboard, ShieldCheck,
    Globe, Zap, Cpu, HardDrive, ShieldAlert, Layers, BarChart3, Rocket, Laptop, ClipboardList, Briefcase,
    Search as SearchIcon, Moon, Sun, Ellipsis, Power, LogOut,
    UserPlus, Sparkles, FileText, Share2, ClipboardCheck, History, Check, UserCheck,
    Monitor, ExternalLink, FileDown
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import TopHeader from "@/components/layout/TopHeader"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import dynamic from 'next/dynamic'
import Image from "next/image"
import { toast } from "sonner"
import { useWebSocket } from "@/hooks/useWebSocket"
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
const AdminKanbanBoard = dynamic(() => import("@/components/admin/AdminKanbanBoard"), { ssr: false })
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
    const [sidebarEmployees, setSidebarEmployees] = useState<any[]>([])
    const [sidebarLeaves, setSidebarLeaves] = useState<any[]>([])

    // ── Attendance View Filtering State ──
    const [attSearch, setAttSearch] = useState("")
    const [attDept, setAttDept] = useState("ALL")
    const [attStatus, setAttStatus] = useState("ALL")

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
        const isAttendanceTab = currentTab === 'attendance-present' || currentTab === 'attendance-absent'
        if (!leaveDropOpen && !isAttendanceTab) return
        
        fetchSidebarAttendance()
        const iv = setInterval(fetchSidebarAttendance, 60000) // Backup poll
        return () => clearInterval(iv)
    }, [leaveDropOpen, currentTab, fetchSidebarAttendance])

    // ── WebSocket Real-time Triggers ──
    useWebSocket({
        onMessage: (msg) => {
            if (msg.type === "DASHBOARD_STATS") {
                // When any dashboard stat changes (clock-in, clock-out, etc), refresh our list
                fetchSidebarAttendance()
            }
        },
        enabled: !!token
    })

    const sidebarAbsentIds = new Set(sidebarLeaves.map((l: any) => l.userId || l.user?.id))
    const sidebarActive = sidebarEmployees.filter(e => e.status === 'ACTIVE' || !e.status)
    const sidebarPresentRaw = sidebarActive.filter(e => !sidebarAbsentIds.has(e.id))
    const sidebarAbsentRaw = sidebarActive.filter(e => sidebarAbsentIds.has(e.id))

    // ── Apply Filters to Attendance Lists ──
    const filterList = (list: any[]) => list.filter(e => {
        const matchesSearch = !attSearch || 
            e.name?.toLowerCase().includes(attSearch.toLowerCase()) || 
            e.email?.toLowerCase().includes(attSearch.toLowerCase())
        const matchesDept = attDept === "ALL" || e.department?.name === attDept
        const matchesStatus = attStatus === "ALL" || e.status === attStatus
        return matchesSearch && matchesDept && matchesStatus
    })

    const sidebarPresent = filterList(sidebarPresentRaw)
    const sidebarAbsent = filterList(sidebarAbsentRaw)
    const departments = Array.from(new Set(sidebarEmployees.map(e => e.department?.name).filter(Boolean)))

    const handleDownloadAttendance = (type: 'present' | 'absent') => {
        const data = type === 'present' ? sidebarPresent : sidebarAbsent
        if (data.length === 0) return toast.error("No records to export")
        
        const headers = ["Name", "Email", "Role", "Department", "Status"]
        const rows = data.map(e => [
            `"${e.name}"`, `"${e.email}"`, `"${e.role}"`, `"${e.department?.name || 'N/A'}"`, `"${e.status || 'ACTIVE'}"`
        ])
        
        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csv))
        link.setAttribute("download", `attendance_${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(`Exported ${data.length} records`)
    }

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
        <div className="min-h-screen gradient-mesh flex font-body overflow-hidden" suppressHydrationWarning>
            <GlobalStyles />
            
            {/* ── 🛡️ EXECUTIVE SIDEBAR ── */}
            <aside className="w-[72px] lg:w-[280px] bg-white flex flex-col h-screen sticky top-0 z-[100] shrink-0 border-r border-slate-100 shadow-[2px_0_24px_rgba(99,102,241,0.06)]">
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
                                            const isAttendanceItem = item.id === 'attendance'

                                            return (
                                                <div key={item.id}>
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                if (isExternal) {
                                                                    window.location.href = (item as any).href
                                                                } else {
                                                                    router.push(`/admin?tab=${item.tab}`)
                                                                    if (isAttendanceItem) setLeaveDropOpen(prev => !prev)
                                                                }
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            if (isExternal) {
                                                                window.location.href = (item as any).href
                                                            } else {
                                                                router.push(`/admin?tab=${item.tab}`)
                                                                if (isAttendanceItem) setLeaveDropOpen(prev => !prev)
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
                                                            {isAttendanceItem && <ChevronRight className={cn("hidden lg:block w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-300 text-slate-400", leaveDropOpen && "rotate-90 text-indigo-500")} />}
                                                        </div>
                                                        {isActive && (
                                                            <motion.div layoutId="activeSidebarIndicator" className="hidden lg:block absolute -left-[5px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full" />
                                                        )}
                                                    </div>

                                                    {/* ── ATTENDANCE DROPDOWN: Present / Absent ── */}
                                                    {isAttendanceItem && (
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
                                                                        <div
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                                    e.preventDefault();
                                                                                    router.push('/admin?tab=attendance-present');
                                                                                }
                                                                            }}
                                                                            onClick={() => router.push('/admin?tab=attendance-present')}
                                                                            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                                                                                currentTab === 'attendance-present' ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-700")}>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", currentTab === 'attendance-present' ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "bg-slate-300")} />
                                                                            Present
                                                                            <span className="ml-auto text-[10px] opacity-60">{sidebarPresent.length}</span>
                                                                        </div>
                                                                        <div
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                                    e.preventDefault();
                                                                                    router.push('/admin?tab=attendance-absent');
                                                                                }
                                                                            }}
                                                                            onClick={() => router.push('/admin?tab=attendance-absent')}
                                                                            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                                                                                currentTab === 'attendance-absent' ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-slate-700")}>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", currentTab === 'attendance-absent' ? "bg-rose-500 shadow-[0_0_6px_rgba(251,113,133,0.4)]" : "bg-slate-300")} />
                                                                            Absent
                                                                            <span className="ml-auto text-[10px] opacity-60">{sidebarAbsent.length}</span>
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
                            <DropdownMenuItem onClick={() => router.push(getProfileLinkByRole(role))} className="rounded-xl px-4 py-3 focus:bg-slate-50 group cursor-pointer text-slate-600 transition-all">
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
            <main className="flex-1 overflow-y-auto h-screen gradient-mesh custom-scrollbar">
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
                            {currentTab === "support"      && <AdminKanbanBoard token={token} />}
                            {currentTab === "user-management"   && <SecurityAuditLogs token={token} />}
                            {currentTab === "settings"     && <SystemSettingsCenter token={token} />}
                            {currentTab === "broadcasts"   && <BroadcastCenter token={token} />}
                            {currentTab === "dept-reports" && <DepartmentReports token={token} />}

                            {/* ── BREATHTAKING ATTENDANCE LISTS ── */}
                            {(currentTab === "attendance-present" || currentTab === "attendance-absent") && (
                                <div className="w-full space-y-8 mt-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    
                                    {/* Aligned Header Section */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110",
                                                    currentTab === 'attendance-present' ? "bg-emerald-600 shadow-emerald-200/50" : "bg-rose-600 shadow-rose-200/50")}>
                                                    {currentTab === 'attendance-present' ? <UserCheck className="w-5 h-5" strokeWidth={2.5} /> : <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />}
                                                </div>
                                                <h1 className="text-3xl font-bold text-slate-800 font-brand tracking-tight">
                                                    {currentTab === 'attendance-present' ? 'Active People' : 'Absent People'}
                                                </h1>
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm ml-[52px]">
                                                Live monitoring of today's attendance roster
                                                <span className="mx-3 opacity-20">|</span>
                                                <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">{currentTab === 'attendance-present' ? sidebarPresent.length : sidebarAbsent.length} Records Detected</span>
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-sm hover:shadow-md transition-all min-w-[140px]">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Present</p>
                                                    <p className="text-xl font-black text-slate-800 leading-none">{sidebarPresent.length}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-sm hover:shadow-md transition-all min-w-[140px]">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Absent</p>
                                                    <p className="text-xl font-black text-slate-800 leading-none">{sidebarAbsent.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🛠️ STRATEGIC COMMAND BAR */}
                                    <div className="bg-white border border-slate-200/60 rounded-[28px] p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm relative z-10">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
                                            <div className="flex-1 w-full max-w-md group">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                                    <Input 
                                                        value={attSearch}
                                                        onChange={(e) => setAttSearch(e.target.value)}
                                                        placeholder="Search People..."
                                                        className="h-11 pl-11 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-[12px] font-bold placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-50 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-3">
                                                <select 
                                                    value={attDept}
                                                    onChange={(e) => setAttDept(e.target.value)}
                                                    className="h-11 px-6 pr-10 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-500 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                                                >
                                                    <option value="ALL">All Departments</option>
                                                    {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <select 
                                                    value={attStatus}
                                                    onChange={(e) => setAttStatus(e.target.value)}
                                                    className="h-11 px-6 pr-10 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-500 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                                                >
                                                    <option value="ALL">All Status</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                                            <Button 
                                                onClick={() => handleDownloadAttendance(currentTab === 'attendance-present' ? 'present' : 'absent')}
                                                variant="outline" className="h-11 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 group">
                                                <FileDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                                Download List
                                            </Button>
                                            <Button 
                                                onClick={() => router.push('/admin?tab=employees')}
                                                className="h-11 bg-indigo-600 hover:bg-black text-white rounded-2xl px-8 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add New
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Data Grid */}
                                    <div className="bg-white border border-slate-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                                        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="col-span-4 lg:col-span-3">Employee Profile</div>
                                            <div className="col-span-4 lg:col-span-3">Contact Information</div>
                                            <div className="hidden lg:block col-span-3">Role & Department</div>
                                            <div className="col-span-2 text-center">Status</div>
                                            <div className="col-span-2 md:col-span-1 text-right">Action</div>
                                        </div>
                                        
                                        <div className="divide-y divide-slate-100">
                                            {(currentTab === 'attendance-present' ? sidebarPresent : sidebarAbsent).length === 0 ? (
                                                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                                                    <ClipboardList className="w-12 h-12 mb-4 text-slate-200" />
                                                    <p className="font-semibold text-slate-500">No records found for this category.</p>
                                                </div>
                                            ) : (
                                                (currentTab === 'attendance-present' ? sidebarPresent : sidebarAbsent).map((emp, i) => {
                                                    const roleName = (emp.role && typeof emp.role === 'string') ? emp.role.replace('_', ' ') : 'Employee';
                                                    const deptName = emp.department?.name || 'General';
                                                    const isPresent = currentTab === 'attendance-present';
                                                    
                                                    return (
                                                        <motion.div
                                                            key={emp.id || i}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.03, duration: 0.3 }}
                                                            className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-slate-50/80 transition-colors duration-200 group"
                                                        >
                                                            {/* Employee Profile */}
                                                            <div className="col-span-4 lg:col-span-3 flex items-center gap-4 min-w-0">
                                                                {emp.avatarUrl || emp.avatar ? (
                                                                    <div className="w-12 h-12 rounded-[16px] shadow-lg shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-110 bg-slate-100 border border-slate-200/50">
                                                                        <img 
                                                                            src={emp.avatarUrl || emp.avatar} 
                                                                            alt={emp.name || 'User'} 
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as any).style.display = 'none';
                                                                                (e.target as any).nextSibling.style.display = 'flex';
                                                                            }}
                                                                        />
                                                                        <div className={cn("w-full h-full flex items-center justify-center text-lg font-black",
                                                                            isPresent ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")} 
                                                                            style={{ display: 'none' }}>
                                                                            {(emp.name || 'E')[0].toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className={cn("w-12 h-12 rounded-[16px] flex items-center justify-center text-lg font-black shadow-md shrink-0 transition-transform duration-300 group-hover:scale-110",
                                                                        isPresent 
                                                                            ? "bg-emerald-600 text-white" 
                                                                            : "bg-rose-600 text-white")}>
                                                                        {(emp.name || 'E')[0].toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <h3 className="text-[15px] font-bold text-slate-800 tracking-tight leading-snug truncate group-hover:text-indigo-600 transition-colors">
                                                                        {emp.name || 'Unknown User'}
                                                                    </h3>
                                                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                                                                        ID: {emp.id?.split('-')[0] || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Contact Info */}
                                                            <div className="col-span-4 lg:col-span-3 flex flex-col justify-center min-w-0">
                                                                <span className="text-[13px] font-semibold text-slate-600 truncate">{emp.email || 'No email provided'}</span>
                                                                <span className="text-[11px] font-medium text-slate-400 truncate mt-1">
                                                                    {emp.phone || 'No phone number'}
                                                                </span>
                                                            </div>

                                                            {/* Role & Dept */}
                                                            <div className="hidden lg:flex col-span-3 flex-col items-start justify-center">
                                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-600 bg-slate-50">
                                                                    {roleName}
                                                                </Badge>
                                                                <span className="text-[12px] font-medium text-slate-500 mt-1.5 truncate flex items-center gap-1.5">
                                                                    <Briefcase className="w-3.5 h-3.5 opacity-70" />
                                                                    {deptName}
                                                                </span>
                                                            </div>

                                                            {/* Status */}
                                                            <div className="col-span-2 flex items-center justify-center">
                                                                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold tracking-widest uppercase",
                                                                    isPresent ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                                                                    <div className={cn("w-2 h-2 rounded-full animate-pulse",
                                                                        isPresent ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                                                                    {isPresent ? 'Present' : 'Absent'}
                                                                </div>
                                                            </div>

                                                            {/* Action */}
                                                            <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                                                                <button 
                                                                    onClick={() => router.push(`/admin?tab=employee-details&userId=${emp.id}`)}
                                                                    className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white transition-all hover:bg-black hover:scale-110 shadow-lg shadow-indigo-200"
                                                                >
                                                                    <ArrowUpRight className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })
                                            )}
                                        </div>
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

