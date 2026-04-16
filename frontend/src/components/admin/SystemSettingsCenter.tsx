"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Settings, Globe, BellRing, UserCheck, ShieldCheck, Mail, Database, Zap, 
    Lock, Eye, Cpu, HardDrive, ShieldAlert, CheckCircle2, ChevronRight, Save,
    Smartphone, Moon, Sun, Languages, Bell, Key, CreditCard, HelpCircle,
    MessageSquare, AlertTriangle, Monitor, Smartphone as Phone, Mail as MailIcon,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemSettingsCenter({ token }: { token: string }) {
    const [isSaving, setIsSaving] = useState(false)
    const [activeSection, setActiveSection] = useState("general")

    const [governanceSettings, setGovernanceSettings] = useState({
        predictive: true,
        darkMode: false,
        presenceAudit: true,
        inAppTelemetry: true,
        mobilePush: true,
        directMail: false,
        massBroadcast: true
    })

    const handleToggle = (key: keyof typeof governanceSettings) => {
        setGovernanceSettings(prev => ({ ...prev, [key]: !prev[key] }))
        toast.success("Parameter updated")
    }

    const handleSave = () => {
        setIsSaving(true)
        const toastId = toast.loading("Deploying new governance protocols...")
        setTimeout(() => {
            setIsSaving(false)
            toast.success("Governance parameters updated successfully", { id: toastId })
        }, 1500)
    }

    const sections = [
        { id: "general", label: "General", icon: Globe },
        { id: "security", label: "Security", icon: ShieldCheck },
        { id: "notifications", label: "Alerts", icon: Bell },
        { id: "infrastructure", label: "Infrastructure", icon: Database },
        { id: "billing", label: "Billing", icon: CreditCard }
    ]

    return (
        <div className="bg-white border border-slate-100 rounded-[44px] overflow-hidden shadow-sm h-full flex flex-col font-sans mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HUD HEADER */}
            <div className="p-10 pb-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white relative z-10">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-600 rounded-[20px] shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                        <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 border-none uppercase tracking-tighter italic leading-none">Internal Governance</h3>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Core System Protocols & Compliance Nodes
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-14 bg-slate-900 hover:bg-black text-white rounded-[22px] px-10 text-[11px] font-black uppercase tracking-widest gap-3 shadow-2xl shadow-slate-900/10 transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                    Deploy Manifest
                </Button>
            </div>

            <div className="flex flex-1 min-h-[600px]">
                {/* SETTINGS SIDEBAR */}
                <div className="w-72 border-r border-slate-50 bg-slate-50/20 p-8 space-y-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-[20px] transition-all group",
                                activeSection === section.id 
                                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100" 
                                    : "text-slate-400 hover:bg-white hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <section.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeSection === section.id && "animate-pulse")} />
                                <span className={cn("text-[11px] font-black uppercase tracking-widest", activeSection === section.id ? "text-slate-900" : "text-slate-400 font-bold")}>{section.label}</span>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 transition-transform", activeSection === section.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                        </button>
                    ))}
                    
                    <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
                        <div className="px-4">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">System Identity</p>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-50 shadow-sm">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs italic">DC</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none">Default Co.</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant v4.2</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS CONTENT */}
                <div className="flex-1 p-12 bg-white custom-scrollbar overflow-y-auto">
                    <div className="max-w-3xl space-y-12 pb-20">
                        <AnimatePresence mode="wait">
                            {activeSection === "general" && (
                                <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Organization Identity</h4>
                                            <Badge className="bg-slate-50 text-slate-400 text-[8px] border-none font-black shadow-none">ID: 5A0A-B392</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Alias</label>
                                                <Input className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 uppercase tracking-tight text-lg shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all outline-none" placeholder="e.g. Acme Corp" defaultValue="Default Company" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Domain Node</label>
                                                <Input className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 lowercase tracking-tighter text-lg shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all outline-none" placeholder="domain.internal" defaultValue="hr-governance.internal" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 pt-8 border-t border-slate-50">
                                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Environmental Override Nodes</h4>
                                        {[
                                            { id: "predictive", label: "Predictive Analytics V2", sub: "Enable neural-based personnel flow forecasting", state: governanceSettings.predictive, icon: Zap, color: "indigo" },
                                            { id: "darkMode", label: "Dark Interface Override", sub: "Force high-fidelity monochromatic aesthetics global-wide", state: governanceSettings.darkMode, icon: Moon, color: "slate" },
                                            { id: "presenceAudit", label: "Automated Presence Audit", sub: "AI-driven identity verification through geofencing", state: governanceSettings.presenceAudit, icon: UserCheck, color: "emerald" }
                                        ].map((pref, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => handleToggle(pref.id as any)}
                                                className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-[28px] hover:border-indigo-100 transition-all group cursor-pointer shadow-sm hover:shadow-xl"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-white rounded-2xl shadow-sm transition-transform group-hover:scale-110">
                                                        <pref.icon className={cn("w-6 h-6", `text-${pref.color}-500`)} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-none">{pref.label}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-2 italic">{pref.sub}</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={pref.state} 
                                                    onCheckedChange={() => handleToggle(pref.id as any)}
                                                    className="data-[state=checked]:bg-indigo-600 scale-125 transition-all" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "notifications" && (
                                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Alert Distribution Vectors</h4>
                                            <Badge className="bg-amber-50 text-amber-600 text-[8px] border-none font-black shadow-none">Pulse: Responsive</Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-6">
                                            {[
                                                { id: "inAppTelemetry", label: "In-App Telemetry", sub: "Global dashboard notifications & pop-up alerts", icon: Monitor, state: governanceSettings.inAppTelemetry },
                                                { id: "mobilePush", label: "Mobile Push Hub", sub: "Personnel status updates via smartphone nodes", icon: Phone, state: governanceSettings.mobilePush },
                                                { id: "directMail", label: "Direct Mail Protocol", sub: "Email manifest for compliance & security reports", icon: MailIcon, state: governanceSettings.directMail },
                                                { id: "massBroadcast", label: "Mass Broadcast System", sub: "Emergency broadcast to all organizational staff", icon: AlertTriangle, state: governanceSettings.massBroadcast }
                                            ].map((alert, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleToggle(alert.id as any)}
                                                    className="flex items-center justify-between p-8 bg-white border border-slate-50 rounded-[32px] shadow-sm hover:shadow-2xl transition-all group cursor-pointer border-l-[6px] border-l-amber-200 hover:border-l-amber-500"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-100 transition-all">
                                                            <alert.icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{alert.label}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{alert.sub}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase hidden sm:block">{alert.state ? "Broadcasting" : "Offline"}</span>
                                                        <Switch 
                                                            checked={alert.state} 
                                                            onCheckedChange={() => handleToggle(alert.id as any)}
                                                            className="data-[state=checked]:bg-amber-500 scale-110" 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="p-10 bg-slate-50 rounded-[44px] border border-slate-100/50 flex flex-col md:flex-row items-center gap-8">
                                        <div className="p-5 bg-white rounded-3xl shadow-sm">
                                            <MessageSquare className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h5 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Rapid Communications Node</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Configure specialized automated responses for payroll cycles and onboarding manifests.</p>
                                        </div>
                                        <Button variant="outline" className="h-12 border-slate-200 text-indigo-600 font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl hover:bg-white shadow-sm transition-all active:scale-95">Configure Node</Button>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "security" && (
                                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Security Protocols</h4>
                                            <Badge className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-4 h-8 border-none shadow-none">Protocol Secure v8.4.1</Badge>
                                        </div>

                                        {[
                                            { label: "Universal MFA Enforcement", sub: "Require authentication tokens for all clearance levels", icon: ShieldCheck, color: "indigo" },
                                            { label: "Endpoint Encryption Hub", sub: "Quantum-ready 256-bit encryption for data in transit", icon: Lock, color: "emerald" },
                                            { label: "Identity Audit Stream", sub: "Live activity telemetry with anomaly detection neural net", icon: Eye, color: "amber" }
                                        ].map((sec, i) => (
                                            <div key={i} className="flex items-start justify-between p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
                                                <div className="flex gap-6">
                                                    <div className={`p-4 bg-slate-50 rounded-[22px] text-slate-600 group-hover:bg-indigo-50 transition-all`}>
                                                        <sec.icon className="w-7 h-7 text-indigo-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{sec.label}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm">{sec.sub}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 rounded-[14px] px-6 h-10 border border-slate-50">Configure Hub</Button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            
                            {["infrastructure", "billing"].includes(activeSection) && (
                                <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-96 flex flex-col items-center justify-center gap-8 opacity-40">
                                    <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[44px] flex items-center justify-center animate-bounce duration-[2000ms]">
                                        <HelpCircle className="w-12 h-12 text-slate-200" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-400">Section manifest initialization required</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 italic">Awaiting high-fidelity module injection for {activeSection}...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* STATUS FOOTER */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex justify-between items-center px-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/50" />
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Global Sync Status: Operational</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-100" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency: 12ms</span>
                </div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Platform Sync v4.9.0-Stable</p>
            </div>
        </div>
    )
}
