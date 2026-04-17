"use client"

import { useState, useEffect } from "react"
import { 
    ShieldCheck, Activity, Globe, Plus, Building2, 
    MoreHorizontal, FileBarChart, Users, Key, 
    CreditCard, Briefcase, TrendingUp, Search,
    Filter, Download, ArrowUpRight, ChevronRight,
    LayoutDashboard, Database, ShieldAlert
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import ExecutiveHub from "@/components/admin/ExecutiveHub"

interface ReportLink {
    id: string
    title: string
    description: string
    icon: any
    color: string
    path: string
}

const REPORTS: ReportLink[] = [
    { id: "payroll", title: "Payroll Ledger", description: "Audit detailed compensation cycles", icon: CreditCard, color: "bg-emerald-50 text-emerald-600", path: "/admin/payroll" },
    { id: "attendance", title: "Presence Report", description: "Historical clock-in analytics", icon: Activity, color: "bg-indigo-50 text-indigo-600", path: "/admin/attendance" },
    { id: "performance", title: "Staff KPIs", description: "Performance matrix evaluation", icon: FileBarChart, color: "bg-amber-50 text-amber-600", path: "/admin/performance" },
    { id: "lifecycle", title: "Staff Lifecycle", description: "Onboarding & exit manifests", icon: Briefcase, color: "bg-rose-50 text-rose-600", path: "/admin/lifecycle" },
    { id: "compliance", title: "Legal Vault", description: "Document & policy compliance", icon: ShieldAlert, color: "bg-blue-50 text-blue-600", path: "/admin/documents" },
    { id: "bi", title: "BI Analytics", description: "Advanced business intelligence", icon: Database, color: "bg-violet-50 text-violet-600", path: "/admin/bi" },
]

export default function InteractiveAdminDashboard({ token }: { token: string }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            
            {/* 🛸 GLOBAL COMMAND HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-900 overflow-hidden relative rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] -mr-40 -mt-40 rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] -ml-20 -mb-20 rounded-full" />
                
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                            <ShieldCheck className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-brand">
                                Admin
                            </h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Online</Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">System synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
                        <Input 
                            placeholder="SEARCH COMMANDS..." 
                            className="w-full md:w-72 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl pl-12 pr-6 focus:ring-indigo-500/30 transition-all font-mono text-[11px] font-black uppercase tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                     <Button className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 font-brand">
                        Add
                    </Button>
                </div>
            </div>

            {/* 🚀 LIVE ANALYTICS HUB */}
            <div className="vault-card bg-white rounded-[4rem] p-1 shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-10 lg:p-14">
                    <ExecutiveHub token={token} />
                </div>
            </div>

            {/* 📋 STRATEGIC REPORT LAUNCHPAD */}
            <div className="space-y-8">
                 <div className="flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic font-brand">Reports</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 leading-none italic">Direct access to core data.</p>
                    </div>
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 font-brand">
                        Export
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {REPORTS.map((report, i) => (
                        <motion.button 
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => window.location.href = report.path}
                            className="group relative flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all", report.color)}>
                                    <report.icon className="w-7 h-7" />
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 opacity-0 group-hover:opacity-100 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{report.title}</h3>
                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">{report.description}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                                Access Module <ChevronRight className="w-3 h-3" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 🛠️ INFRASTRUCTURE & SECURITY METRICS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-12">
                   <Card className="p-10 rounded-[3rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Database className="w-48 h-48 text-indigo-400" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic mb-2">Systems <span className="text-indigo-400">Integrity</span></h2>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Audit Trail & Security Monitoring</p>
                            </div>
                            <div className="flex flex-wrap gap-8 items-center">
                                {[
                                    { label: "Data Integrity", val: "100%", status: "Optimal" },
                                    { label: "Storage Load", val: "24.2GB", status: "Nominal" },
                                    { label: "Active Nodes", val: "482+", status: "Online" },
                                ].map((m, i) => (
                                    <div key={i} className="space-y-2 border-l border-white/10 pl-8">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{m.label}</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-2xl font-black text-white italic">{m.val}</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase tracking-tighter">{m.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-900/40">
                                Open Audit Terminal
                            </Button>
                        </div>
                   </Card>
                </div>
            </div>

        </div>
    )
}
