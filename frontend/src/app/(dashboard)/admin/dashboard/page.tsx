"use client"

import { useSession } from "next-auth/react"
import { 
    ShieldCheck, Activity, Globe, Plus, Building2, MoreHorizontal
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AdminOnly } from "@/components/auth/RoleGate"
import ExecutiveHub from "@/components/admin/ExecutiveHub"

export default function AdminDashboardPage() {
    const { data: session } = useSession()
    const token = session?.user?.accessToken || ""

    return (
        <AdminOnly fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase">Access Denied</h2>
                <p className="text-sm text-slate-500 font-medium">Elevated administrative privileges required to view the Command Center.</p>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
            </div>
        }>
            <div className="p-4 lg:p-10 pb-32 space-y-10 max-w-[1600px] mx-auto w-full">
                
                {/* 🚀 Header Module */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <ShieldCheck className="w-32 h-32 text-indigo-600" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="p-4 bg-slate-900 dark:bg-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none">
                            <Building2 className="w-8 h-8 text-white dark:text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic uppercase tracking-tight">
                                Company <span className="text-indigo-600">Command</span> Center
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2 leading-none">
                                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Strategic Infrastructure & Governance
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => window.location.href = '/admin/audit-logs'} className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                             Audit Logs
                        </Button>
                        <Button className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">
                            <Plus className="w-4 h-4 mr-2" /> System Update
                        </Button>
                    </div>
                </div>

                {/* 📊 Live Analytics Hub (Integrated) */}
                <ExecutiveHub token={token} />

                {/* 🛠️ Management Portals */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Workforce Architecture (8 cols) */}
                    <div className="lg:col-span-8">
                        <Card className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Workforce Architecture</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Cross-departmental personnel flow</p>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="w-5 h-5 text-slate-400" /></Button>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { dept: "Engineering & Cloud", personnel: 452, color: "bg-indigo-600", growth: 12 },
                                    { dept: "Product Development", personnel: 218, color: "bg-violet-600", growth: 8 },
                                    { dept: "Finance & Operations", personnel: 184, color: "bg-emerald-600", growth: -2 },
                                    { dept: "Human Resources", personnel: 92, color: "bg-blue-600", growth: 4 },
                                ].map((row, i) => (
                                    <div key={i} className="group p-6 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-3 h-3 rounded-full shadow-lg shadow-black/5", row.color)} />
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.dept}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-slate-900 dark:text-white">{row.personnel} Personnel</span>
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded-full",
                                                    row.growth > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                    {row.growth > 0 ? "+" : ""}{row.growth}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full rounded-full transition-all duration-1000", row.color)} 
                                                style={{ width: `${(row.personnel / 600) * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT: System Integrity (4 cols) */}
                    <div className="lg:col-span-4">
                        <Card className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">Security Stream</h3>
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                {[
                                    { user: "Admin", action: "Policy update applied", time: "2m ago", icon: ShieldCheck },
                                    { user: "System", action: "Backup synchronized", time: "15m ago", icon: Activity },
                                    { user: "User-482", action: "Access attempt blocked", time: "1h ago", icon: ShieldCheck },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <log.icon className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">{log.user}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-tight">{log.action}</p>
                                            <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-2">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>

            </div>
        </AdminOnly>
    )
}
