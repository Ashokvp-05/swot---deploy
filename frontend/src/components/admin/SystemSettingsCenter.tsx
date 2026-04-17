"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Settings, Globe, BellRing, UserCheck, ShieldCheck, Mail, Database, Zap, 
    Lock, Eye, Cpu, HardDrive, ShieldAlert, CheckCircle2, ChevronRight, Save,
    Smartphone, Moon, Sun, Languages, Bell, Key, CreditCard, HelpCircle,
    MessageSquare, AlertTriangle, Monitor, Smartphone as Phone, Mail as MailIcon,
    Loader2, Clock, Calendar, FileText, Building2, Users, UploadCloud
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemSettingsCenter({ token }: { token: string }) {
    const [isSaving, setIsSaving] = useState(false)
    const [activeSection, setActiveSection] = useState("company")

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
        const toastId = toast.loading("Deploying new HR parameters...")
        setTimeout(() => {
            setIsSaving(false)
            toast.success("HR settings updated successfully", { id: toastId })
        }, 1500)
    }

    const sections = [
        { id: "company", label: "Company Settings", icon: Building2 },
        { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
        { id: "attendance", label: "Attendance Settings", icon: Clock },
        { id: "leave", label: "Leave Policy", icon: Calendar },
        { id: "payroll", label: "Payroll Settings", icon: CreditCard },
        { id: "notifications", label: "Notification Settings", icon: Bell },
        { id: "documents", label: "Document Settings", icon: FileText }
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
                            {activeSection === "company" && (
                                <motion.div key="company" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Organization Identity</h4>
                                            <Badge className="bg-slate-50 text-slate-400 text-[8px] border-none font-black shadow-none">CORE FOUNDATION</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                                                <Input className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 uppercase tracking-tight text-lg shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all outline-none" defaultValue="Default Company" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time Zone</label>
                                                <select className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-[13px] shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none">
                                                    <option>UTC+05:30 Asia/Kolkata (IST)</option>
                                                    <option>UTC+00:00 GMT</option>
                                                    <option>UTC-05:00 Eastern Time</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="space-y-3 md:w-1/2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Emblem (Logo)</label>
                                                <div className="h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-indigo-300 hover:bg-slate-100 transition-all cursor-pointer group">
                                                    <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Upload Branding</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 md:w-1/2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Office Locations</label>
                                                <Input className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 uppercase tracking-tight text-[12px] shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all outline-none" defaultValue="HQ - Cyber Hub, Sub-node Alpha" />
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mt-6 block">Standard Workweek</label>
                                                <div className="flex gap-2">
                                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                                        <div key={idx} className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black", idx < 5 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400")}>{day}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "roles" && (
                                <motion.div key="roles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Roles & Permissions</h4>
                                            <Badge className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-4 h-8 border-none shadow-none">Security Core</Badge>
                                        </div>

                                        {[
                                            { role: "Super Admin", sub: "Absolute system override, settings control", users: 2, icon: ShieldCheck, color: "rose" },
                                            { role: "HR Controller", sub: "Personnel, payroll, and policy management", users: 4, icon: Users, color: "indigo" },
                                            { role: "Department Manager", sub: "Team oversight, leave approval, attendance", users: 12, icon: Globe, color: "emerald" },
                                            { role: "Standard Employee", sub: "Basic dashboard, leave application", users: 142, icon: UserCheck, color: "slate" }
                                        ].map((r, i) => (
                                            <div key={i} className="flex items-start justify-between p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:border-indigo-100">
                                                <div className="flex gap-6 items-center">
                                                    <div className={`p-4 bg-${r.color}-50 text-${r.color}-500 rounded-[22px] transition-all`}>
                                                        <r.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{r.role}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.sub}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <Badge className="bg-slate-50 text-slate-600 border-none font-black text-[10px] uppercase">Nodes: {r.users}</Badge>
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-2 hover:underline">Edit Privileges</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "attendance" && (
                                <motion.div key="attendance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Attendance Logic Configuration</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Standard Work Shift Start</label>
                                                <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 text-lg shadow-inner outline-none" defaultValue="09:00" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Standard Work Shift End</label>
                                                <Input type="time" className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 text-lg shadow-inner outline-none" defaultValue="18:00" />
                                            </div>
                                        </div>
                                        <div className="space-y-6 pt-4 border-t border-slate-50">
                                            <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-[28px]">
                                                <div>
                                                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Late Mark Rules</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">Deduct half-day after 3 late anomalies</p>
                                                </div>
                                                <Switch checked={true} className="data-[state=checked]:bg-indigo-600 scale-125" />
                                            </div>
                                            <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-[28px]">
                                                <div>
                                                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Overtime Logistics</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">Calculate extra compensation post 6:30 PM</p>
                                                </div>
                                                <Switch checked={false} className="data-[state=checked]:bg-indigo-600 scale-125" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Break Time Duration</label>
                                                <select className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-[13px] shadow-inner outline-none appearance-none">
                                                    <option>60 Minutes (Standard)</option>
                                                    <option>45 Minutes</option>
                                                    <option>30 Minutes</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "leave" && (
                                <motion.div key="leave" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Leave Policy & Limits</h4>
                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { type: "Sick Leave", count: 12, cf: "0 allowed" },
                                                { type: "Casual Leave", count: 12, cf: "0 allowed" },
                                                { type: "Paid Leave (Earned)", count: 15, cf: "Max 30 carried" }
                                            ].map((lv, i) => (
                                                <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{lv.type}</span>
                                                    <span className="text-3xl font-black text-indigo-600 tracking-tighter mt-4 leading-none">{lv.count}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lv.cf}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-[28px] mt-6">
                                            <div>
                                                <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Multi-tier Approval Workflow</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">Requires Manager AND HR validation</p>
                                            </div>
                                            <Switch checked={true} className="data-[state=checked]:bg-indigo-600 scale-125" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "payroll" && (
                                <motion.div key="payroll" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Compensation Logistics</h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Salary Structure</label>
                                                <select className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-[13px] shadow-inner outline-none appearance-none">
                                                    <option>Standard (Basic + HRA + Allowances)</option>
                                                    <option>Consolidated Hourly</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Cycle</label>
                                                <select className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-[13px] shadow-inner outline-none appearance-none">
                                                    <option>Monthly (1st of every month)</option>
                                                    <option>Bi-Weekly</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-[28px]">
                                            <div>
                                                <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Automate Tax Deductions (TDS)</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">System calculates slabs automatically</p>
                                            </div>
                                            <Switch checked={true} className="data-[state=checked]:bg-indigo-600 scale-125" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "notifications" && (
                                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Alert Hub</h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: "Email Notifications", sub: "Leave approvals, Payroll processed, Urgent notes", state: true, icon: MailIcon },
                                                { label: "In-App Alerts", sub: "System events, document expirations", state: true, icon: Monitor },
                                                { label: "Reminder Settings", sub: "Pending tasks, pending onboarding documents", state: false, icon: Bell }
                                            ].map((alert, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><alert.icon className="w-5 h-5" /></div>
                                                        <div>
                                                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{alert.label}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{alert.sub}</p>
                                                        </div>
                                                    </div>
                                                    <Switch checked={alert.state} className="data-[state=checked]:bg-amber-500 scale-110" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "documents" && (
                                <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-8">
                                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Documentation Protocols</h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Maximum Upload Matrix (Size)</label>
                                                <Input className="bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-lg shadow-inner outline-none" defaultValue="10 MB Limit" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Rules</label>
                                                <select className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-black text-slate-900 tracking-tight text-[13px] shadow-inner outline-none appearance-none">
                                                    <option>Strict (HR Manual Approval)</option>
                                                    <option>Automated (AI Parsing)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 mt-6">
                                            <h5 className="text-[12px] font-black text-slate-900 uppercase tracking-tight mb-4">Core Required Documents</h5>
                                            <div className="flex flex-wrap gap-3">
                                                {['Aadhar Card', 'PAN Card', 'Bank Passbook', 'Degree Cert', 'Relieving Letter'].map(doc => (
                                                    <Badge key={doc} className="bg-white border-slate-200 text-slate-600 px-4 py-2 uppercase tracking-widest text-[9px] font-black shadow-sm">{doc}</Badge>
                                                ))}
                                                <Button variant="outline" className="h-8 border-dashed border-slate-300 text-slate-400 bg-transparent uppercase tracking-widest text-[9px] font-black">+ Add Document</Button>
                                            </div>
                                        </div>
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
