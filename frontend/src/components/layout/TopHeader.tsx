"use client"

import * as React from "react"
import { Bell, MoreHorizontal, User, LogOut, ChevronDown } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getProfileLinkByRole } from "@/lib/role-redirect"

const DynamicNotificationBell = dynamic(() => import("./NotificationBell"), { ssr: false })

export default function TopHeader({
    token,
    searchQuery,
    setSearchQuery,
    breadcrumb = { parent: "Admin", page: "Dashboard" }
}: {
    token: string,
    searchQuery?: string,
    setSearchQuery?: (val: string) => void,
    breadcrumb?: { parent: string, page: string }
}) {
    const [mounted, setMounted] = React.useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const roleString = session?.user?.role || ""
    const role = roleString.replace(/_/g, ' ')
    const initials = (session?.user?.name || "A").split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

    // Determine if we are in admin view or standard view
    const isEmployeeView = !["ADMIN", "COMPANY_ADMIN", "SUPER_ADMIN", "HR_ADMIN"].includes(roleString.toUpperCase())
    
    // Use a stable breadcrumb during hydration to prevent mismatch
    const displayBreadcrumb = (!mounted) 
        ? breadcrumb 
        : (isEmployeeView ? { parent: "Employee", page: "Dashboard" } : breadcrumb)

    return (
        <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all">
            <div className="px-8 py-3.5 flex items-center justify-between">

                {/* Left: breadcrumb / page context */}
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none">
                    <span className="text-indigo-500">{displayBreadcrumb.parent}</span>
                    <span className="opacity-40">/</span>
                    <span>{displayBreadcrumb.page}</span>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-3">

                    {/* Notification Bell */}
                    <div className="relative">
                        <DynamicNotificationBell token={token} />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200 rounded-full" />

                    {/* User pill */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 rounded-2xl transition-all duration-200 group outline-none">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-[11px] shrink-0 shadow-md shadow-indigo-200 select-none">
                                    {initials}
                                </div>
                                <div className="flex flex-col items-start text-left leading-none hidden sm:flex">
                                    <span className="text-[12px] font-bold text-slate-800 truncate max-w-[90px]">
                                        {session?.user?.name?.split(' ')[0] || "Admin"}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate max-w-[90px]">
                                        {role || "Super Admin"}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors ml-0.5 hidden sm:block" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-60 bg-white border border-slate-100 rounded-[20px] p-2 shadow-2xl shadow-slate-200/60 mt-2 animate-in slide-in-from-top-2 duration-200"
                            align="end"
                        >
                            {/* Identity block */}
                            <div className="px-4 py-3 mb-1 bg-slate-50 rounded-[14px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Logged In As</p>
                                <p className="text-[13px] font-bold text-slate-900 truncate">{session?.user?.name || "Admin"}</p>
                                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{session?.user?.email || "admin@hr.com"}</p>
                            </div>

                            <DropdownMenuItem
                                onClick={() => router.push(getProfileLinkByRole(roleString))}
                                className="rounded-xl px-3.5 py-2.5 focus:bg-indigo-50 cursor-pointer text-[12px] font-semibold text-slate-700 focus:text-indigo-700 transition-colors gap-3 mt-1"
                            >
                                <User className="w-4 h-4 text-slate-400" />
                                My Profile
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-100 my-1.5" />

                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="rounded-xl px-3.5 py-2.5 focus:bg-rose-50 cursor-pointer text-[12px] font-semibold text-rose-500 focus:text-rose-600 transition-colors gap-3"
                            >
                                <LogOut className="w-4 h-4 text-rose-400" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
