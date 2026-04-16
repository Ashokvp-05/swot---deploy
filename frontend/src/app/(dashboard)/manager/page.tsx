"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, Calendar, Clock,
    LayoutDashboard, UserPlus, CreditCard,
    FileText, BarChart3,
    Building2, ChevronRight, Activity, Radio, ShieldCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import dynamic from 'next/dynamic'

// Dynamic imports for HR Manager tools
const HRManagerDashboardHub = dynamic(() => import("@/components/manager/HRManagerDashboardHub"), { 
    ssr: false 
})
const AttendanceControl = dynamic(() => import("@/components/admin/AttendanceControlCenter"), { ssr: false })
const LeaveApprovalCenter = dynamic(() => import("@/components/admin/LeaveApprovalCenter"), { ssr: false })
const OnboardingManager = dynamic(() => import("@/components/manager/ManagerOnboardingView"), { ssr: false })
const PayrollCenter = dynamic(() => import("@/components/admin/PayrollControlCenter"), { ssr: false })
const ExecutiveHub = dynamic(() => import("@/components/admin/ExecutiveHub"), { ssr: false })
const AddEmployeeModal = dynamic(() => import("@/components/admin/AddEmployeeModal"), { ssr: false })
const DocumentsModule = dynamic(() => import("@/components/admin/DocumentsModule"), { ssr: false })
const DepartmentManager = dynamic(() => import("@/components/manager/ManagerDepartmentView"), { ssr: false })

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .nav-item-active {
            background: #4F46E5;
            color: #ffffff;
            box-shadow: 0 8px 20px -6px rgba(79, 70, 229, 0.4);
        }
        
        .nav-item-hover:hover {
            transform: translateX(4px);
            background: #F8FAFC;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
    `}</style>
)

export default function HRManagerDashboardPage() {
    const { data: session, status: authStatus } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentTab, setCurrentTab] = useState(searchParams?.get("tab") || "dashboard")
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
        if (authStatus === "unauthenticated") {
            router.push("/dashboard")
        }
        const tab = searchParams?.get("tab")
        if (tab) setCurrentTab(tab)

        if (typeof window !== 'undefined') {
            (window as any).setIsAddEmployeeOpen = setIsAddEmployeeOpen
        }
    }, [authStatus, router, searchParams])

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab)
        const url = new URL(window.location.href)
        url.searchParams.set("tab", tab)
        window.history.pushState({}, "", url.toString())
    }

    const token = (session?.user as any)?.accessToken || ""

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "onboarding", label: "Onboarding", icon: UserPlus },
        { id: "attendance", label: "Attendance", icon: Clock },
        { id: "leaves", label: "Leaves", icon: Calendar },
        { id: "payroll", label: "Payroll", icon: CreditCard },
        { id: "departments", label: "Departments", icon: Building2 },
        { id: "documents", label: "Documents", icon: FileText },
        { id: "reports", label: "Reports", icon: BarChart3 },
    ]

    if (!hasMounted) return <div className="min-h-screen bg-[#fcfdff]" />

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 font-body">
            <GlobalStyles />
            
            {/* ── HIGH-FIDELITY COMMAND SIDEBAR ── */}
            <aside className="w-72 h-full hidden lg:flex flex-col bg-white border-r border-slate-100 py-10 px-6 z-50 shrink-0">
                <div className="mb-12 px-2">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 font-brand leading-none">Command Terminal</p>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic font-brand leading-none uppercase">Manager Hub</h2>
                    <div className="w-8 h-1 bg-indigo-600 mt-4 rounded-full" />
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 font-brand",
                                currentTab === item.id 
                                    ? "nav-item-active" 
                                    : "text-slate-400 nav-item-hover hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", currentTab === item.id ? "text-white scale-110" : "text-slate-300")} />
                                <span>{item.label}</span>
                            </div>
                            {currentTab === item.id && (
                                <motion.div layoutId="activeNavPoint" className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* SIDEBAR FOOTER PROTOCOL */}
                <div className="mt-10 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Terminal Operational</p>
                    </div>
                </div>
            </aside>

            {/* ── HIGH-DENSITY MAIN TERMINAL ── */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <ScrollArea className="flex-1 h-full">
                    <div className="p-8 lg:p-12 pb-32 space-y-12 max-w-[1600px] mx-auto w-full">
                        
                        {/* Clinical Section Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-slate-200 transition-transform hover:scale-105">
                                    {(() => {
                                        const Icon = navItems.find(i => i.id === currentTab)?.icon || Users;
                                        return <Icon className="w-6 h-6 text-indigo-400" />
                                    })()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight font-brand uppercase italic">
                                        {navItems.find(i => i.id === currentTab)?.label || "Dashboard Hub"}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Badge className="bg-slate-50 text-slate-400 border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-md leading-none">Authorized Control</Badge>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">Execution Shard: {currentTab}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-white border border-slate-50 rounded-2xl shadow-sm">
                                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shard Integrity: Optimal</span>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT MANIFEST */}
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                            {currentTab === "dashboard" && <HRManagerDashboardHub token={token} onNavigate={handleTabChange} />}
                            {currentTab === "attendance" && <AttendanceControl token={token} />}
                            {currentTab === "leaves" && <LeaveApprovalCenter token={token} />}
                            {currentTab === "onboarding" && <OnboardingManager token={token} onAddEmployee={() => setIsAddEmployeeOpen(true)} />}
                            {currentTab === "payroll" && <PayrollCenter token={token} />}
                            {currentTab === "departments" && <DepartmentManager token={token} />}
                            {currentTab === "documents" && <DocumentsModule token={token} />}
                            {currentTab === "reports" && <ExecutiveHub token={token} />}
                        </div>
                    </div>
                </ScrollArea>
            </main>

            {/* INTEGRATED MODALS */}
            {isAddEmployeeOpen && (
                <AddEmployeeModal 
                    token={token} 
                    onClose={() => setIsAddEmployeeOpen(false)} 
                    onSuccess={() => {
                        setIsAddEmployeeOpen(false)
                        toast.success("Intelligence Hub: Personnel Registration Complete")
                    }}
                />
            )}
        </div>
    )
}
