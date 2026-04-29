"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Check, X, ShieldAlert,
    Lock, Edit3, Trash2, 
    Search, Users, CreditCard, 
    Calendar, Settings, Activity,
    ShieldCheck, CheckSquare, Square,
    Save, RotateCcw, AlertTriangle, RefreshCw, 
    Database, Cpu, Zap, Shield, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .protocol-row {
            background: #ffffff;
            border-bottom: 1px solid #F8FAFC;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .protocol-row:hover {
            background: #F1F5F9/30;
            box-shadow: inset 4px 0 0 #4F46E5;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
    `}</style>
)

export function GovernanceTable({ token }: { token: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    
    const roles = [
        { id: "COMPANY_ADMIN", label: "COMPANY ADMIN", color: "text-indigo-600" },
        { id: "HR_ADMIN", label: "HR ADMIN", color: "text-emerald-600" },
        { id: "MANAGER", label: "MANAGER", color: "text-amber-600" },
        { id: "PAYROLL_ADMIN", label: "PAYROLL ADMIN", color: "text-violet-600" },
        { id: "AUDITOR", label: "AUDITOR", color: "text-rose-600" }
    ]

    const [permData, setPermData] = useState([
        { module: "EMPLOYEES", icon: Users, COMPANY_ADMIN: true, HR_ADMIN: true, MANAGER: true, PAYROLL_ADMIN: false, AUDITOR: true },
        { module: "PAYROLL", icon: CreditCard, COMPANY_ADMIN: true, HR_ADMIN: true, MANAGER: false, PAYROLL_ADMIN: true, AUDITOR: true },
        { module: "LEAVE", icon: Calendar, COMPANY_ADMIN: true, HR_ADMIN: true, MANAGER: true, PAYROLL_ADMIN: true, AUDITOR: true },
        { module: "SETTINGS", icon: Settings, COMPANY_ADMIN: true, HR_ADMIN: false, MANAGER: false, PAYROLL_ADMIN: false, AUDITOR: true },
        { module: "SECURITY LOGS", icon: Activity, COMPANY_ADMIN: true, HR_ADMIN: true, MANAGER: false, PAYROLL_ADMIN: false, AUDITOR: true }
    ])

    const [tempData, setTempData] = useState(permData)

    const handleToggle = (moduleIndex: number, roleId: string) => {
        if (!isEditing) return
        const newData = [...tempData]
        const currentVal = (newData[moduleIndex] as any)[roleId]
        ;(newData[moduleIndex] as any)[roleId] = !currentVal
        setTempData(newData)
    }

    const startEditing = () => {
        setTempData(JSON.parse(JSON.stringify(permData)))
        setIsEditing(true)
        toast.info("Edit Mode Enabled", { 
            description: "You can now modify permissions.",
        })
    }

    const saveChanges = async () => {
        setIsSyncing(true)
        await new Promise(r => setTimeout(r, 1500))
        setPermData(tempData)
        setIsEditing(false)
        setIsSyncing(false)
        toast.success("Settings Saved", { 
            description: "Permissions have been updated.",
        })
    }

    const cancelChanges = () => {
        setIsEditing(false)
        setTempData(permData)
        toast.error("Changes Cancelled")
    }

    const toggleAllByRole = (roleId: string) => {
        if (!isEditing) return
        const anyUnchecked = tempData.some(p => !(p as any)[roleId])
        const newData = tempData.map(p => ({ ...p, [roleId]: anyUnchecked }))
        setTempData(newData)
    }

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm h-full flex flex-col font-body mb-10">
            <GlobalStyles />
            
            {/* ── PERMISSIONS OVERVIEW ── */}
            <div className="p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white shrink-0">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-50">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight font-brand">Permissions Management</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Version 4.8.2 · {roles.length} Roles
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                        isEditing 
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse" 
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isEditing ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]")} />
                        {isEditing ? "Editing..." : "System Secure"}
                    </div>
                    
                    <div className="h-6 w-px bg-slate-100 mx-2" />

                    {!isEditing ? (
                        <Button 
                            onClick={startEditing}
                            className="h-11 bg-slate-900 hover:bg-black text-white rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <Edit3 className="w-4 h-4" /> Edit Permissions
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost"
                                onClick={cancelChanges}
                                className="h-11 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl px-5 text-[10px] font-bold uppercase tracking-widest gap-2 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" /> Cancel
                            </Button>
                            <Button 
                                onClick={saveChanges}
                                disabled={isSyncing}
                                className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 text-[10px] font-bold uppercase tracking-widest gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                            >
                                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── PERMISSIONS TABLE ── */}
            <div className="flex-1 overflow-x-auto custom-scrollbar bg-slate-50/10">
                <div className="min-w-[1240px]">
                    {/* TABLE HEADER */}
                    <div className="flex items-center bg-slate-900 shadow-xl relative z-10 py-2">
                        <div className="w-[300px] px-10 py-6">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-brand">Module Name</span>
                        </div>
                        {roles.map(role => (
                            <div key={role.id} className="flex-1 px-6 py-6 border-l border-white/5 text-center">
                                <button 
                                    onClick={() => toggleAllByRole(role.id)}
                                    disabled={!isEditing}
                                    className={cn(
                                        "group flex flex-col items-center gap-2 mx-auto transition-all",
                                        !isEditing ? "cursor-default" : "hover:scale-110 active:scale-95"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest font-brand transition-colors leading-none",
                                        isEditing ? "text-indigo-300 group-hover:text-white" : "text-white/70"
                                    )}>
                                        {role.label.replace('_', ' ')}
                                    </span>
                                    {isEditing && (
                                        <div className="w-5 h-5 border border-white/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-400 transition-all">
                                            <Zap className="w-3 h-3 text-indigo-300 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* TABLE BODY */}
                    <div className="divide-y divide-slate-50 relative">
                        {(isEditing ? tempData : permData).map((row, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="protocol-row flex items-center group/row"
                            >
                                {/* MODULE */}
                                <div className="w-[300px] px-10 py-8 flex items-center gap-6 border-r border-slate-50 bg-white/50 backdrop-blur-sm sticky left-0 z-20">
                                    <div className={cn(
                                        "w-11 h-11 rounded-[18px] flex items-center justify-center transition-all shadow-sm border border-transparent group-hover/row:border-indigo-100",
                                        isEditing ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
                                    )}>
                                        <row.icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-bold text-slate-800 tracking-tight font-brand leading-none mb-1 group-hover/row:text-indigo-600 transition-colors">
                                            {row.module}
                                        </p>
                                        <p className="text-[8px] font-semibold text-slate-300 uppercase tracking-widest truncate">System Module</p>
                                    </div>
                                </div>

                                {/* PERMISSION */}
                                {roles.map(role => {
                                    const hasAccess = (row as any)[role.id]
                                    return (
                                        <div key={role.id} className="flex-1 px-6 py-8 flex items-center justify-center border-r border-slate-50/50">
                                            <button 
                                                onClick={() => handleToggle(i, role.id)}
                                                disabled={!isEditing}
                                                className={cn(
                                                    "w-14 h-14 rounded-[22px] flex items-center justify-center mx-auto transition-all duration-400 transform relative",
                                                    !isEditing ? "cursor-default" : "active:scale-90 hover:scale-105",
                                                    hasAccess 
                                                        ? isEditing 
                                                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-4 ring-indigo-50" 
                                                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                                        : "bg-slate-50 text-slate-100 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                {hasAccess ? (
                                                    <>
                                                        <ShieldCheck className="w-6 h-6 z-10" strokeWidth={2.5} />
                                                        {!isEditing && <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full animate-pulse" />}
                                                    </>
                                                ) : (
                                                    <Lock className="w-5 h-5 opacity-40" strokeWidth={2} />
                                                )}
                                            </button>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── SYSTEM STATUS ── */}
            <div className="p-8 border-t border-slate-50 bg-white flex justify-between items-center px-12 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">Status: Secure</span>
                    </div>
                    <div className="w-px h-4 bg-slate-100 mx-2" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none font-brand">v4.8.2 Stable</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-indigo-600 uppercase tracking-widest transition-all hover:scale-105 group">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        System Online
                    </div>
                </div>
            </div>
        </div>
    )
}
