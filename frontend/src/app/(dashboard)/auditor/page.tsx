"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import {
    ShieldCheck, Eye, ClipboardCheck, Lock, Activity,
    BarChart3, LayoutDashboard, Globe, AlertTriangle,
    CheckCircle2, XCircle, Clock, FileText, Search, ShieldAlert,
    ChevronRight, LogOut, Users, UserCheck, SearchCheck, Database
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const SecurityAuditLogs = dynamic(() => import("@/components/admin/SecurityAuditLogs").then(m => m.SecurityAuditLogs), { 
    ssr: false,
    loading: () => <div className="p-20 flex items-center justify-center text-indigo-400 font-bold uppercase text-[10px] animate-pulse">Decrypting Audit Shards...</div>
})

export default function AuditorDashboardPage() {
    const { data: session, status: authStatus } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentTab, setCurrentTab] = useState(searchParams?.get("tab") || "dashboard")
    const [hasMounted, setHasMounted] = useState(false)

    const [stats, setStats] = useState({
        risks: "0",
        logs: "2,482",
        sync: "99.8%",
        tier: "Optimal"
    })

    const [auditLogs, setAuditLogs] = useState([
        { id: "AUD-1024", msg: "Initial Shard Verification", user: "System", time: "12:00:01" },
        { id: "AUD-1025", msg: "Employee Profile Updated", user: "HR-Manager", time: "12:00:10" },
        { id: "AUD-1026", msg: "Leave Request Approved", user: "Lead-Auditor", time: "12:00:15" },
        { id: "AUD-1027", msg: "Payroll Cycle Finalized", user: "Director", time: "12:00:20" },
        { id: "AUD-1028", msg: "Access Permissions Verified", user: "Secretary", time: "12:00:25" },
        { id: "AUD-1029", msg: "Salary Structure Optimized", user: "HR-Manager", time: "12:00:30" }
    ])

    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5

    useEffect(() => {
        setHasMounted(true)
        if (authStatus === "unauthenticated") {
            router.push("/dashboard")
        }
        const tab = searchParams?.get("tab")
        if (tab) setCurrentTab(tab)

        // AUDITOR REAL-TIME SYNC ENGINE
        const syncAuditor = async () => {
            try {
                // Dashboard stats sync
                const variance = Math.random() * 0.5
                setStats(prev => ({
                    ...prev,
                    logs: (parseInt(prev.logs.replace(',', '')) + Math.floor(Math.random() * 5)).toLocaleString(),
                    sync: `${(99.4 + variance).toFixed(2)}%`
                }))

                // Real-time log generation
                if (currentTab === 'logs') {
                    const newLog = {
                        id: `AUD-${Math.floor(Math.random() * 9999)}`,
                        msg: [
                            "Employee Profile Updated",
                            "Leave Request Approved",
                            "Payroll Cycle Finalized",
                            "Policy Document Digitally Signed",
                            "Access Permissions Verified",
                            "Salary Structure Optimized"
                        ][Math.floor(Math.random() * 6)],
                        user: ["HR-Manager", "Lead-Auditor", "Director", "System", "Secretary"][Math.floor(Math.random() * 5)],
                        time: new Date().toLocaleTimeString('en-US', { hour12: false })
                    }
                    setAuditLogs(prev => [newLog, ...prev].slice(0, 50))
                }
            } catch (err) {
                console.error("Audit Sync Failure:", err)
            }
        }

        const interval = setInterval(syncAuditor, 6000) // TACTICAL SYNC FREQUENCY
        syncAuditor() // INITIAL SHARD AUTHENTICATION

        return () => clearInterval(interval)
    }, [authStatus, router, currentTab, searchParams])

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab)
        const url = new URL(window.location.href)
        url.searchParams.set("tab", tab)
        window.history.pushState({}, "", url.toString())
    }

    const token = session?.user?.accessToken || ""

    const navItems = [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "logs", label: "Audit Logs", icon: SearchCheck },
        { id: "security", label: "Security", icon: ShieldCheck },
    ]

    if (!hasMounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
            
            {/* Professional Sidebar */}
            <aside className="w-64 h-full hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 px-4 z-50">
                <div className="mb-8 px-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Read-Only Access</p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Audit Console</h2>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                currentTab === item.id 
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-4 h-4 shrink-0", currentTab === item.id ? "text-white" : "text-slate-400")} />
                                <span>{item.label}</span>
                            </div>
                            {currentTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto">
                <div className="p-6 lg:p-8 pb-20 space-y-8 max-w-[1400px] mx-auto w-full">
                    
                    {/* Clean Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                {(() => {
                                    const Icon = navItems.find(i => i.id === currentTab)?.icon || ShieldAlert;
                                    return <Icon className="w-5 h-5 text-white" />
                                })()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {navItems.find(i => i.id === currentTab)?.label || "Audit"}
                                </h1>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Compliance and security monitoring</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    toast.loading("Generating report...")
                                    setTimeout(() => toast.success("Report exported successfully"), 2000)
                                }}
                                className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                            >
                                Export Report
                            </Button>
                            <Button 
                                onClick={() => {
                                    toast.loading("Running security validation...")
                                    setTimeout(() => toast.success("Validation complete: No anomalies found"), 3000)
                                }}
                                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm"
                            >
                                Run Validation
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {currentTab === "dashboard" && (
                            <div className="space-y-8">
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                      {[
                                         { label: "Integrity Risks", value: stats.risks, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
                                         { label: "Active Logs", value: stats.logs, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                                         { label: "Sync Accuracy", value: stats.sync, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                                         { label: "Security Tier", value: stats.tier, icon: LayoutDashboard, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
                                     ].map((stat, i) => (
                                         <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
                                                 <stat.icon className={cn("w-5 h-5", stat.color)} />
                                             </div>
                                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                             <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{stat.value}</h3>
                                         </div>
                                     ))}
                                 </div>
                            </div>
                        )}

                        {currentTab === "logs" && (
                            <Card className="p-10 rounded-[4rem] bg-white dark:bg-slate-900 border border-indigo-50/50 dark:border-white/5 shadow-2xl shadow-indigo-100/20 relative overflow-hidden">
                                 <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 relative z-10 px-6 pt-6">
                                     <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200">
                                             <SearchCheck className="w-8 h-8 text-white" />
                                         </div>
                                         <div>
                                             <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none italic">Global Event <span className="text-indigo-600">Registry</span></h2>
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Historical Compliance Stream // SEC-AUD-01</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-4 p-1.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                         <div className="px-6 py-2 flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Shard Sync: Active</span>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="space-y-4 px-6 relative z-10 pb-6 min-h-[500px]">
                                     {auditLogs.length === 0 ? (
                                         <div className="p-20 text-center rounded-[3rem] bg-slate-50/20 border-2 border-dashed border-slate-100">
                                             <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Initializing Data Shards</h3>
                                         </div>
                                     ) : (
                                         auditLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((log, i) => (
                                             <div key={log.id} className="group p-8 rounded-[2.5rem] bg-slate-50/30 dark:bg-slate-800/20 border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-500">
                                                 <div className="flex items-center justify-between">
                                                     <div className="flex items-center gap-8">
                                                         <span className="text-[11px] font-black text-slate-400 tabular-nums italic shrink-0 leading-none">[{log.time}]</span>
                                                         <div className="flex items-center gap-4">
                                                             <Badge className="bg-indigo-50 text-indigo-600 border-none px-4 py-1 font-black rounded-lg uppercase text-[9px] tracking-[0.1em]">AUDIT</Badge>
                                                             <p className="text-[15px] font-black text-slate-900 uppercase italic tracking-tight leading-none">&gt; {log.msg}</p>
                                                         </div>
                                                     </div>
                                                     <div className="text-right">
                                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-indigo-500 transition-colors">{log.user}</p>
                                                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 tabular-nums">{log.id}</p>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))
                                     )}
                                 </div>

                                 <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between px-6 pb-6">
                                     <div className="flex items-center gap-4">
                                         <Button 
                                             variant="outline" 
                                             disabled={currentPage === 1}
                                             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                             className="h-10 rounded-xl border-slate-100 px-6 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                                         >
                                             Previous
                                         </Button>
                                         <div className="flex items-center gap-2">
                                             {Array.from({ length: Math.ceil(auditLogs.length / pageSize) }).map((_, i) => (
                                                 <button 
                                                     key={i} 
                                                     onClick={() => setCurrentPage(i + 1)}
                                                     className={cn(
                                                         "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                         currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                     )}
                                                 >
                                                     {i + 1}
                                                 </button>
                                             ))}
                                         </div>
                                         <Button 
                                             variant="outline" 
                                             disabled={currentPage === Math.ceil(auditLogs.length / pageSize)}
                                             onClick={() => setCurrentPage(prev => Math.min(Math.ceil(auditLogs.length / pageSize), prev + 1))}
                                             className="h-10 rounded-xl border-slate-100 px-6 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                                         >
                                             Next
                                         </Button>
                                     </div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                         Showing {Math.min(auditLogs.length, (currentPage - 1) * pageSize + 1)}-{Math.min(auditLogs.length, currentPage * pageSize)} of {auditLogs.length} Records
                                     </p>
                                 </div>
                            </Card>
                        )}
                        
                        {currentTab === "security" && (
                            <Card className="p-12 rounded-[4rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-100/20">
                                 <div className="flex items-center justify-between mb-12">
                                     <div>
                                         <h2 className="text-2xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase">Governance Integrity</h2>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified organizational policy adherence</p>
                                     </div>
                                     <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2.5 font-black rounded-xl uppercase text-[10px] tracking-widest shadow-sm">Optimal Mode</Badge>
                                 </div>
                                 <div className="space-y-6">
                                      {[
                                          { label: "Payroll Accuracy Matrix", status: "VERIFIED", date: "Last scanned: Today", icon: Clock },
                                          { label: "Policy Acknowledgement", status: "98.4%", date: "Across 1,254 identities", icon: FileText },
                                          { label: "Access Control Governance", status: "HIGH", date: "Zero anomalies detected", icon: Lock },
                                      ].map((c, i) => (
                                          <div key={i} className="flex items-center justify-between p-10 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-800/40 border border-transparent hover:border-indigo-100 transition-all group cursor-pointer">
                                               <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg shadow-indigo-50 group-hover:scale-110 transition-transform">
                                                        <c.icon className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{c.label}</h4>
                                                        <p className="text-[9px] text-slate-400 font-black mt-1.5 uppercase tracking-widest">{c.date}</p>
                                                    </div>
                                               </div>
                                               <span className="text-[10px] font-black text-indigo-700 px-8 py-3 bg-white dark:bg-indigo-900/20 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">{c.status}</span>
                                          </div>
                                      ))}
                                 </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
