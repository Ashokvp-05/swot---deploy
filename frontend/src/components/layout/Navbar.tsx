"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Activity,
    AlertTriangle,
    Archive,
    Banknote,
    BarChart3,
    Briefcase,
    Building2,
    CalendarCheck,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    Database,
    Eye,
    ExternalLink,
    FileText,
    Globe,
    Globe2,
    History,
    LayoutDashboard,
    LifeBuoy,
    Menu,
    Plus,
    Search,
    SearchCheck,
    Server,
    Settings,
    Shield,
    ShieldCheck,
    Ticket,
    TrendingUp,
    UserMinus,
    UserPlus,
    Users,
    XCircle,
    Zap,
} from "lucide-react"

import { getDashboardByRole } from "@/lib/role-redirect"
import { UserNav } from "./UserNav"
import NotificationBell from "./NotificationBell"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────
//  ROUTE DEFINITIONS
// ─────────────────────────────────────────────

const getBasicItems = (role?: string) => {
    const r = role?.toUpperCase()
    if (r === "MANAGER" || r === "HR" || r === "HR_MANAGER" || r === "AUDITOR" || r === "SUPPORT" || r === "SUPPORT_ADMIN") {
        return []
    }
    if (r === "ADMIN" || r === "COMPANY_ADMIN" || r === "SUPER_ADMIN") {
        return [
            { name: "Dashboard", href: "/admin/dashboard" },
            { name: "Onboarding", href: "/admin/users?tab=onboarding" },
            { name: "Attendance", href: "/admin/attendance" },
            { name: "Leave", href: "/admin/leaves" },
            { name: "Profile", href: "/profile" },
        ]
    }
    return [
        { name: "Dashboard", href: getDashboardByRole(role) },
        { name: "Attendance", href: "/attendance" },
        { name: "Leave", href: "/leave" },
        { name: "Reports", href: "/reports" },
        { name: "Payslips", href: "/payslip" },
        { name: "Profile", href: "/profile" },
    ]
}

const adminDropdownItems = [
    { name: "Executive Hub", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Organization Control", href: "/admin/organization", icon: Building2 },
    { name: "Intelligence Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Security Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Database Vault", href: "/admin/database", icon: Database },
]

const getRoleDropdown = (role?: string) => {
    const r = role?.toUpperCase()
    if (!r) return null
    if (r === "MANAGER" || r === "HR" || r === "HR_MANAGER" || r === "AUDITOR" || r === "SUPPORT" || r === "SUPPORT_ADMIN") return null
    if (r === "ADMIN" || r === "COMPANY_ADMIN" || r === "SUPER_ADMIN") return { label: "Governance Portal", items: adminDropdownItems }
    return null
}

export default function Navbar({ role, token, isMobile, className, companyName }: { role?: string; token?: string; isMobile?: boolean; className?: string; companyName?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    const normalizedRole = role?.toUpperCase()
    const basicItems = getBasicItems(role)
    const dropdown = getRoleDropdown(role)

    const renderLink = (item: { name: string; href: string }, isSub = false) => {
        const hrefPath = item.href.split("?")[0]
        const tabValue = item.href.split("tab=")[1]
        
        const isActive = pathname === hrefPath && (
            !item.href.includes("tab=") || 
            searchParams.get("tab") === tabValue ||
            (hrefPath === '/manager' && tabValue === 'dashboard' && !searchParams.get("tab"))
        )
        return (
            <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                    "relative flex items-center transition-all px-4 h-16 cursor-pointer",
                    isMobile ? "py-4 text-base font-bold border-b border-slate-100 dark:border-slate-800 h-14" : "text-[13px] font-semibold tabular-nums",
                    isActive
                        ? "text-indigo-600 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-indigo-600 shadow-[inset_0_-2px_0_rgba(79,70,229,0.05)]"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
            >
                <span className="relative z-10">{item.name}</span>
            </Link>
        )
    }

    if (isMobile) {
        return (
            <div className={cn("flex flex-col w-full", className)}>
                {basicItems.map(item => renderLink(item))}
                {dropdown && (
                    <div className="mt-8 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Briefcase className="w-3 h-3" /> {dropdown.label}
                        </p>
                        {dropdown.items.map(item => renderLink(item, true))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <header className={cn("sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md", className)}>
            <div className="w-full px-8 h-16 flex items-center justify-between">
                
                {/* 🧭 Left: Logo & Routes */}
                <div className="flex items-center gap-8 h-full">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                         <div className="md:hidden">
                            {isMounted ? (
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] p-0 border-r border-slate-200 dark:border-slate-800 bg-background">
                                        <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                                            <SheetTitle className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-bold tracking-tight select-none no-caret">HR <span className="text-indigo-600">Central</span></span>
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
                                            <Navbar role={role} token={token} isMobile />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            ) : (
                                <div className="h-9 w-9 rounded-lg" />
                            )}
                        </div>

                        <Link href="/" className="flex items-center gap-3.5 group">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-100 dark:shadow-indigo-900/20 shadow-lg group-hover:scale-105 transition-all shrink-0">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                             <div className="flex flex-col select-none no-caret justify-center">
                                 <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase italic">HR <span className="text-indigo-600">Central</span></span>
                                 {companyName && (
                                     <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 leading-none">{companyName}</span>
                                 )}
                             </div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center h-full">
                        {basicItems.map(item => renderLink(item))}
                        
                        {dropdown && isMounted && (
                            <div className="flex items-center h-full ml-2">
                                <Separator orientation="vertical" className="h-6 mx-2 bg-slate-200 dark:bg-slate-800" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all outline-none">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>{dropdown.label}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-2xl border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-1">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-3 px-4 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Portal Access
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                        <div className="grid gap-1 mt-1">
                                            {dropdown.items.map((item) => {
                                                const isActive = pathname === item.href.split("?")[0] && 
                                                    (!item.href.includes("tab=") || searchParams.get("tab") === item.href.split("tab=")[1]) ||
                                                    (pathname === item.href.split("?")[0] && item.href === '/manager' && !searchParams.get("tab"))

                                                return (
                                                    <DropdownMenuItem key={item.href} asChild>
                                                        <Link href={item.href}
                                                            className={cn(
                                                                "cursor-pointer text-[11px] font-black uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-between group transition-all",
                                                                isActive 
                                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
                                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                                                            )}>
                                                            <div className="flex items-center gap-3">
                                                                {item.icon && <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />}
                                                                <span>{item.name}</span>
                                                            </div>
                                                            <ExternalLink className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all", isActive ? "text-white/50" : "text-slate-300")} />
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </nav>
                </div>

                {/* 🔍 Right: Actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-48 lg:w-64 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/20 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all group">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                        <input 
                            type="text" 
                            placeholder="Universal search..." 
                            className="bg-transparent border-none focus:ring-0 text-xs w-full ml-3 placeholder:text-slate-400 font-medium dark:text-slate-100"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {isMounted ? (
                            <>
                                <NotificationBell token={token as string} />
                                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
                                <UserNav />
                            </>
                        ) : (
                            <div className="w-24 h-9" />
                        )}
                    </div>
                </div>

            </div>

        </header>
    )
}
