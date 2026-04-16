"use client"

import { Zap, Timer, Play, Pause, RefreshCw, Layers } from "lucide-react"

export function WorkflowPulse({ token }: { token: string }) {
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-xl h-full flex flex-col relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-amber-600/10 transition-colors" />

            <div className="p-10 pb-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950/40">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-600/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">Workflow Automation Engine</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Intelligent Lifecycle Management</p>
                    </div>
                </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {[
                    { label: "Payroll Accrual", status: "Enabled", icon: Timer, color: "text-emerald-400" },
                    { label: "Attendance Sync", status: "Active", icon: RefreshCw, color: "text-indigo-400" },
                    { label: "Onboarding Flow", status: "Active", icon: Play, color: "text-emerald-400" },
                    { label: "Self-Destruct (Logs)", status: "Disabled", icon: Pause, color: "text-slate-800" },
                    { label: "Email Protocols", status: "Active", icon: Zap, color: "text-rose-400" },
                    { label: "Policy Distribution", status: "Scheduled", icon: Layers, color: "text-amber-400" }
                ].map((w, i) => (
                    <div key={i} className="p-6 bg-slate-950/40 border border-white/5 rounded-[32px] flex items-center justify-between group/w hover:border-amber-500/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-slate-900 rounded-2xl border border-white/5 group-hover/w:scale-110 transition-transform">
                                <w.icon className={`w-5 h-5 ${w.color}`} />
                            </div>
                            <div>
                                <p className="text-white text-xs font-black uppercase tracking-wide group-hover/w:text-amber-400 transition-colors">{w.label}</p>
                                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1">Runtime Lifecycle: {w.status}</p>
                            </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                    </div>
                ))}
            </div>

            <div className="p-10 pt-4 border-t border-white/5 bg-slate-950/40 text-center">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic cursor-pointer hover:text-white transition-opacity">Deploy Central Intelligence Workflow V3.1</p>
            </div>
        </div>
    )
}
