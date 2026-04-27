"use client"

import { Search, MoreHorizontal, User, LogOut } from "lucide-react"
import NotificationBell from "./NotificationBell"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TopHeader({ 
    token, 
    searchQuery, 
    setSearchQuery 
}: { 
    token: string,
    searchQuery?: string,
    setSearchQuery?: (val: string) => void
}) {
    const { data: session } = useSession()
    const router = useRouter()
    
    return (
        <header className="px-8 py-4 flex items-center justify-end sticky top-0 z-[50] bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-100/60 transition-all">
            <div className="flex items-center gap-4 pointer-events-auto">
                {/* Search removed per user request */}

                <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                    <NotificationBell token={token} />
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-all shadow-sm group">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                    {(session?.user?.name || "A")[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[12.5px] font-medium text-slate-800 leading-none truncate max-w-[90px]">{session?.user?.name?.split(' ')[0] || "User"}</span>
                                    <span className="text-[10px] font-normal text-slate-400 mt-0.5">{session?.user?.role?.replace('_', ' ') || "Agent"}</span>
                                </div>
                                <MoreHorizontal className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white border border-slate-100 rounded-2xl p-2 shadow-xl mt-3 animate-in slide-in-from-top-2 duration-200" align="end">
                            <DropdownMenuLabel className="px-3 py-2">
                                <p className="text-[11px] font-normal text-slate-400 leading-none mb-1">Signed in as</p>
                                <p className="text-[13px] font-medium text-slate-900 truncate">{session?.user?.email || "user@hr.com"}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-xl px-3 py-2 focus:bg-indigo-50 cursor-pointer text-[13px] font-medium text-slate-700 focus:text-indigo-700 transition-colors gap-2.5">
                                <User className="w-4 h-4 text-slate-400" />
                                My Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            <DropdownMenuItem 
                                onClick={() => signOut({ callbackUrl: '/login' })} 
                                className="rounded-xl px-3 py-2 focus:bg-rose-50 cursor-pointer text-[13px] font-medium text-rose-500 focus:text-rose-600 transition-colors gap-2.5"
                            >
                                <LogOut className="w-4 h-4 text-rose-400" />
                                Secure Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
