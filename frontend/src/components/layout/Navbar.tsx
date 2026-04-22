"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    Clock,
    Calendar,
    BarChart3,
    CreditCard,
    User,
    Shield,
    MoreVertical,
    LogOut,
    Building2,
    Database,
    ShieldCheck,
    Settings,
    Users,
    UserPlus,
    FileText,
    HelpCircle,
    Megaphone,
} from "lucide-react"

import { getDashboardByRole } from "@/lib/role-redirect"

// ─────────────────────────────────────────────
//  ROUTE DEFINITIONS
// ─────────────────────────────────────────────

const getNavItems = (role?: string) => {
    const r = role?.toUpperCase()
    
    // Admin families
    if (r === "ADMIN" || r === "COMPANY_ADMIN" || r === "SUPER_ADMIN") {
        const adminLinks = [
            { name: "Admin Hub", href: "/admin/dashboard", icon: LayoutDashboard, group: "core" },
            { name: "Organization", href: "/admin/organization", icon: Building2, group: "company" },
            { name: "Employee Details", href: "/admin/employee-details", icon: User, group: "company" },
            { name: "Reports", href: "/admin/reports", icon: BarChart3, group: "company" },
            { name: "Announcements", href: "/admin/announcements", icon: Megaphone, group: "company" },
            { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck, group: "admin" },
            { name: "Settings", href: "/admin/settings", icon: Settings, group: "admin" },
        ]
        
        if (r === "SUPER_ADMIN") {
            adminLinks.push({ name: "Employee Management", href: "/admin/users", icon: Users, group: "hr" })
        }
        
        return adminLinks
    }
    
    // Manager families
    if (r === "MANAGER" || r === "HR_MANAGER" || r === "HR") {
        return [
            { name: "Dashboard", href: "/manager?tab=dashboard", icon: LayoutDashboard, group: "core" },
            { name: "Employee Management", href: "/manager?tab=employees", icon: Users, group: "hr" },
            { name: "Attendance", href: "/manager?tab=attendance", icon: Clock, group: "finance" },
            { name: "Leaves", href: "/manager?tab=leaves", icon: Calendar, group: "finance" },
            { name: "Payroll", href: "/manager?tab=payroll", icon: CreditCard, group: "finance" },
            { name: "Departments", href: "/manager?tab=departments", icon: Building2, group: "company" },
            { name: "Announcements", href: "/manager?tab=announcements", icon: Megaphone, group: "company" },
            { name: "Documents", href: "/manager?tab=documents", icon: FileText, group: "company" },
            { name: "Reports", href: "/manager?tab=reports", icon: BarChart3, group: "company" },
            { name: "Support Desk", href: "/manager?tab=support", icon: HelpCircle, group: "admin" },
        ]
    }
    
    // Normal Employees
    return [
        { name: "Dashboard", href: getDashboardByRole(role), icon: LayoutDashboard, group: "core" },
        { name: "Attendance", href: "/attendance", icon: Clock, group: "finance" },
        { name: "Leaves", href: "/leave", icon: Calendar, group: "finance" },
        { name: "Reports", href: "/reports", icon: BarChart3, group: "company" },
        { name: "Payslips", href: "/payslip", icon: CreditCard, group: "finance" },
    ]
}

export default function Navbar({ role, token, companyName }: { role?: string; token?: string; companyName?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isMounted, setIsMounted] = React.useState(false)
    const { data: session } = useSession()

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    const navItems = getNavItems(role)
    const roleString = session?.user?.role || role || 'USER'

    if (!isMounted) return <aside className="w-[72px] lg:w-[280px] bg-[#ffffff] border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shrink-0" />

    return (
        <aside className="w-[72px] lg:w-[280px] bg-[#ffffff] border-r border-slate-200/80 flex flex-col h-screen sticky top-0 z-[100] shrink-0 custom-scrollbar-sidebar">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
                .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-body { font-family: 'Inter', sans-serif; }
                
                .custom-scrollbar-sidebar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar-sidebar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
            `}</style>
            
            {/* BRAND HEADER */}
            <div className="pt-8 pb-8 px-4 lg:px-7 border-b border-slate-100/60">
                <div className="hidden lg:flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[12px] flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/')}>
                        <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight font-brand leading-none">Rudratic</h2>
                        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mt-1.5 leading-none bg-indigo-50 px-1.5 py-0.5 rounded pl-1.5 inline-block">
                            Workspace
                        </p>
                    </div>
                </div>
                <div className="lg:hidden flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[12px] flex items-center justify-center shadow-lg" onClick={() => router.push('/')}>
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-3 lg:px-5 py-6 overflow-y-auto custom-scrollbar-sidebar">
                <div className="space-y-8">
                    {['core', 'hr', 'finance', 'company', 'admin'].map(group => {
                        const groupItems = navItems.filter(i => i.group === group)
                        if(groupItems.length === 0) return null

                        const groupLabels: Record<string, string> = {
                            'core': 'Overview',
                            'hr': 'Personnel',
                            'finance': 'Operations & Pay',
                            'company': 'Organization',
                            'admin': 'System & Security'
                        }

                        return (
                            <div key={group} className="space-y-1.5">
                                <p className="hidden lg:block text-[10px] font-bold text-slate-400/80 uppercase tracking-widest px-3 mb-3 font-brand ml-1">{groupLabels[group]}</p>
                                {groupItems.map(item => {
                                    const Icon = item.icon
                                    
                                    // Robust active logic
                                    const isQueryLink = item.href.includes("?tab=")
                                    const baseHref = item.href.split("?")[0]
                                    const tabValue = item.href.split("tab=")[1]
                                    const currentTab = searchParams?.get("tab")
                                    
                                    let isActive = false
                                    if (isQueryLink) {
                                        isActive = pathname === baseHref && (currentTab === tabValue || (!currentTab && tabValue === 'dashboard'))
                                    } else {
                                        isActive = pathname === baseHref
                                    }

                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => router.push(item.href)}
                                            title={item.name}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[13px] font-medium transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                                                isActive 
                                                    ? "bg-indigo-50/80 text-indigo-700 font-semibold"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <div className="flex items-center justify-center lg:justify-start gap-3 w-full">
                                                <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors duration-200", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={isActive ? 2.5 : 2} />
                                                <span className="hidden lg:inline-block text-left truncate">{item.name}</span>
                                            </div>
                                            {isActive && (
                                                <motion.div layoutId="globalActiveNav" className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-600 rounded-r-full" />
                                            )}
                                        </button>
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
                                {(session?.user?.name || "E")[0].toUpperCase()}
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>
                            <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                                <span className="text-[13px] font-semibold text-slate-900 leading-none truncate w-full">{session?.user?.name?.split(' ')[0] || 'Employee'}</span>
                                <span className="text-[11px] font-medium text-slate-500 mt-1 truncate w-full">{roleString.replace('_', ' ')}</span>
                            </div>
                            <MoreVertical className="hidden lg:block w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-white border border-slate-200 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ml-2 mb-2" side="top" align="start">
                        <div className="px-3 py-3 mb-1 bg-slate-50/50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Authenticated Account</p>
                            <p className="text-[13px] font-semibold text-slate-900 truncate">{session?.user?.email || "employee@hr.com"}</p>
                        </div>
                        <div className="h-px bg-slate-100 mx-2 my-2" />
                        <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-xl px-3 py-2.5 focus:bg-slate-50 group cursor-pointer text-slate-600 transition-colors">
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
    )
}
