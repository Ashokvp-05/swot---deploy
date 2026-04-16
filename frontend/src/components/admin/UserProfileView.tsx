"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Mail, Phone, MapPin, Calendar, Briefcase, 
    ShieldCheck, Eye, EyeOff, ArrowLeft, Building2, 
    Fingerprint, ShieldAlert, Heart, HardDrive, 
    Globe, PhoneCall, MailCheck, ShieldQuestion,
    Activity, Zap, Database, Lock, Unlock, X, Edit3,
    ArrowLeftCircle, Verified, UserCog, Shield,
    Cpu, Laptop, Layers, Radio, Key, Monitor, History as HistoryIcon,
    ChevronRight, Clock, CheckCircle2, UserPlus, FileText, GraduationCap, UploadCloud, XCircle, FilePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface UserProfileViewProps {
    user: any
    token: string
    onClose: () => void
    onEdit?: () => void
}

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    `}</style>
)

export default function UserProfileView({ user, token, onClose, onEdit }: UserProfileViewProps) {
    const [privacyShield, setPrivacyShield] = useState(true)
    
    // Determine if this is a high-level admin node
    const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role
    const isSuperAdmin = roleName === "SUPER_ADMIN"

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] } 
        }
    }

    // Mock lifecycle activities for Phase 2
    const activities = [
        { title: "Employee created", detail: "System registry entry initialized", time: format(new Date(user?.createdAt || Date.now() - 86400000 * 3), 'hh:mm a'), date: format(new Date(user?.createdAt || Date.now()), 'MMM dd, yyyy'), icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Documents uploaded", detail: "Personnel KYC artifacts secured", time: format(new Date(user?.createdAt || Date.now() - 86400000 * 2), 'hh:mm a'), date: format(new Date(user?.createdAt || Date.now()), 'MMM dd, yyyy'), icon: UploadCloud, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "HR verification", detail: "Internal policy matrix authorized", time: format(new Date(user?.createdAt || Date.now() - 86400000 * 1), 'hh:mm a'), date: format(new Date(user?.createdAt || Date.now()), 'MMM dd, yyyy'), icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Onboarding approved", detail: "Final deployment protocol validated", time: format(new Date(user?.createdAt || Date.now()), 'hh:mm a'), date: format(new Date(user?.createdAt || Date.now()), 'MMM dd, yyyy'), icon: Verified, color: "text-emerald-600", bg: "bg-emerald-50" },
    ]

    const renderDataField = (label: string, value: any, icon: any, subtext?: string) => (
        <div className="group relative">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-brand">{label}</span>
            </div>
            <div className="pl-11">
                <p className={cn(
                    "text-[14px] font-bold tracking-tight",
                    !value || value === "NOT_SET" ? "text-slate-300 italic" : "text-slate-900"
                )}>
                    {privacyShield && label.toLowerCase().includes('aadhaar') ? 'XXXX-XXXX-XXXX' : 
                     privacyShield && label.toLowerCase().includes('pan') ? 'XXXXX0000X' :
                     (!value || value === "NOT_SET") ? "Verified Protocol Active" : value}
                </p>
                {subtext && <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{subtext}</p>}
            </div>
        </div>
    )

    const renderDocumentAction = (label: string, icon: any, statusContext: string, size?: string, uploadedAt?: string, requiresUpload?: boolean) => (
        <div className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all bg-white shadow-sm hover:shadow-xl group/doc overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/10 to-transparent opacity-0 group-hover/doc:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5 mb-4 md:mb-0 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 group-hover/doc:bg-indigo-600 group-hover/doc:text-white transition-all flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h4 className="text-[12px] font-black text-slate-900 uppercase font-brand tracking-widest leading-none">{label}</h4>
                    <div className="flex items-center gap-3 mt-2">
                        <p className={cn("text-[9px] font-black uppercase tracking-widest", statusContext.includes('Correction') ? "text-rose-500" : "text-slate-400")}>{statusContext}</p>
                        {size && <span className="w-1 h-1 bg-slate-200 rounded-full" />}
                        {size && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{size}</p>}
                        {uploadedAt && <span className="w-1 h-1 bg-slate-200 rounded-full" />}
                        {uploadedAt && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{uploadedAt}</p>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
                {requiresUpload ? (
                     <Button size="sm" variant="outline" onClick={() => { import('sonner').then(m => m.toast.info("Re-upload requested from personnel node.")); }} className="h-11 px-6 rounded-xl border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-sm"><FilePlus className="w-4 h-4 mr-2"/> Request File</Button>
                ) : (
                     <>
                        <button onClick={() => { import('sonner').then(m => m.toast.error("Document Rejected. Context Required.")); }} className="h-11 px-5 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 bg-white font-black text-[9px] uppercase tracking-widest transition-all gap-2"><XCircle className="w-4 h-4" /> Reject</button>
                        <button onClick={() => { import('sonner').then(m => m.toast.success("Document Verified.")); }} className="h-11 px-5 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white border border-transparent bg-emerald-50 font-black text-[9px] uppercase tracking-widest transition-all shadow-sm gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</button>
                     </>
                )}
            </div>
        </div>
    )

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 font-body backdrop-blur-3xl bg-slate-950/40"
        >
            <GlobalStyles />
            <motion.div 
                initial={{ scale: 0.98, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 30 }}
                className="bg-white w-full max-w-7xl h-full max-h-[900px] rounded-[56px] shadow-[0_32px_120px_rgba(15,23,42,0.3)] flex flex-col overflow-hidden border border-white"
            >
                {/* ── HIGH-FIDELITY ADMINISTRATIVE HEADER ── */}
                <div className="px-12 py-10 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white">
                    <div className="flex items-center gap-7">
                        <button 
                            onClick={onClose}
                            className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 font-brand tracking-tighter flex items-center gap-4 uppercase italic leading-none">
                                {isSuperAdmin ? "Executive ID manifest" : "Personnel Identity Hub"}
                                <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse" />
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2.5">
                                {isSuperAdmin ? "System Authority Shard · Operational Core" : "Universal Personnel Node · Registered Asset"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        {onEdit && (
                            <Button 
                                variant="outline" 
                                onClick={onEdit}
                                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] gap-3.5 hover:bg-slate-950 hover:text-white transition-all border border-slate-100 text-slate-900"
                            >
                                <Edit3 className="w-4 h-4" /> Modify Record
                            </Button>
                        )}
                        {!isSuperAdmin && (
                            <Button 
                                variant="ghost" 
                                onClick={() => setPrivacyShield(!privacyShield)}
                                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] gap-3.5 hover:bg-slate-50 transition-all border border-slate-100"
                            >
                                {privacyShield ? <Lock className="w-4 h-4 text-indigo-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                                {privacyShield ? "Decrypt Identification" : "Shield Active"}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-12 md:p-20 space-y-24">
                    
                    {/* ── IDENTITY HUB ── */}
                    <div className="flex flex-col xl:flex-row items-center gap-20 pb-20 border-b border-slate-50">
                        <div className="relative">
                            <div className={cn(
                                "w-60 h-60 rounded-[80px] border-4 border-white shadow-[0_45px_100px_rgba(0,0,0,0.15)] flex items-center justify-center relative p-1 transition-transform hover:rotate-2 active:scale-95",
                                isSuperAdmin ? "bg-slate-900" : "bg-slate-50"
                            )}>
                                <div className={cn("absolute inset-2 rounded-[74px]", isSuperAdmin ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/10" : "bg-white")} />
                                <span className={cn("text-6xl font-black font-brand tracking-tighter relative z-20 italic", isSuperAdmin ? "text-white" : "text-indigo-600")}>
                                    {user?.name?.[0]}{user?.name?.split(' ')?.[1]?.[0] || user?.name?.[1]?.toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-3xl border border-slate-50 z-20">
                                {isSuperAdmin ? <Shield className="w-10 h-10 text-indigo-600" /> : <ShieldCheck className="w-10 h-10 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="flex-1 text-center xl:text-left">
                            <div className="flex flex-col xl:flex-row xl:items-center gap-8 mb-12 justify-center xl:justify-start">
                                <h1 className="text-6xl font-black text-slate-900 font-brand tracking-tighter leading-none italic uppercase">{user?.name}</h1>
                                <Badge className={cn(
                                    "border-none px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl",
                                    isSuperAdmin ? "bg-slate-950 text-white shadow-slate-200" : "bg-indigo-600 text-white shadow-indigo-100"
                                )}>
                                    {isSuperAdmin ? "Verified System Authority" : "Verified Personnel Node"}
                                </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
                                {[
                                    { label: "Administrative Tier", value: roleName || "Standard", icon: Layers, color: "text-indigo-500" },
                                    { label: "Deployment Branch", value: user?.branch?.name || "Global", icon: Globe, color: "text-slate-400" },
                                    { label: "Functional Shard", value: user?.department?.name || "Core", icon: Building2, color: "text-slate-400" },
                                    { label: "Auth Email", value: user?.email, icon: MailCheck, color: "text-slate-400" },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-3">
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">{stat.label}</p>
                                        <div className="flex items-center gap-3">
                                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                                            <p className="text-[16px] font-bold text-slate-800 tracking-tight truncate font-brand uppercase italic">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── DATA & TIMELINE SPLIT ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-24">
                        
                        {/* LEFT: INFORMATION MANIFEST (8 COLS) */}
                        <div className="xl:col-span-8 space-y-24">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                                {isSuperAdmin ? (
                                    <>
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
                                                    <Key className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Access Matrix</h3>
                                            </div>
                                            <div className="space-y-12">
                                                {renderDataField("Registry Control", "Full Read/Write Shard", <Database className="w-full h-full" />)}
                                                {renderDataField("Security Ledger", "Immutable Access Verified", <Activity className="w-full h-full" />)}
                                                {renderDataField("Deployment Hub", "Global Branch Control", <Globe className="w-full h-full" />)}
                                            </div>
                                        </div>
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                    <Radio className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Connectivity</h3>
                                            </div>
                                            <div className="space-y-12">
                                                {renderDataField("Primary Auth Node", user?.email, <Mail className="w-full h-full" />)}
                                                {renderDataField("System Terminal ID", `SUPER_ADMIN_${user?.id}`, <Cpu className="w-full h-full" />)}
                                                {renderDataField("Interface Latency", "1ms Optimization Active", <Zap className="w-full h-full" />)}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Fingerprint className="w-6 h-6" /></div>
                                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Biometrics</h3>
                                            </div>
                                            <div className="space-y-10">
                                                {renderDataField("Birth Genesis", user?.profile?.dob ? new Date(user?.profile?.dob).toLocaleDateString() : null, <Calendar className="w-full h-full" />)}
                                                {renderDataField("Gender Matrix", user?.profile?.gender, <User className="w-full h-full" />)}
                                                {renderDataField("Hematology Type", user?.profile?.bloodGroup, <Heart className="w-full h-full" />)}
                                            </div>
                                        </div>
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Database className="w-6 h-6" /></div>
                                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Registry IDs</h3>
                                            </div>
                                            <div className="space-y-10">
                                                {renderDataField("National ID (Aadhaar)", user?.profile?.aadhaarNumber, <Verified className="w-full h-full" />)}
                                                {renderDataField("Tax Identification (PAN)", user?.profile?.panNumber, <HardDrive className="w-full h-full" />)}
                                                {renderDataField("UAN Infrastructure", user?.profile?.uanNumber, <Zap className="w-full h-full" />)}
                                            </div>
                                        </div>
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><FileText className="w-6 h-6" /></div>
                                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Document Manifest</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {renderDocumentAction("Curriculum Vitae (Resume)", <FileText className="w-full h-full" />, "Status: Pending Review", "1.2 MB", "Uploaded: 2d ago")}
                                                {renderDocumentAction("Educational Certifications", <GraduationCap className="w-full h-full" />, "Status: Correction Required", "4.8 MB", "Uploaded: 3d ago", true)}
                                                {renderDocumentAction("Offer Letter & Agreement", <Briefcase className="w-full h-full" />, "Status: Awaiting Verification", "850 KB", "Uploaded: 1h ago")}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: CHRONOS TIMELINE (4 COLS) */}
                        {!isSuperAdmin && (
                            <div className="xl:col-span-4 space-y-12">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400">
                                            <HistoryIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Chronos Timeline</h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lifecycle Activity Manifest</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>

                                <div className="space-y-10 relative">
                                    <div className="absolute left-[23px] top-2 bottom-2 w-px bg-slate-100" />
                                    {activities.map((act, i) => (
                                        <div key={i} className="flex gap-6 group relative">
                                            <div className={cn("w-12 h-12 rounded-2xl shadow-sm border border-white flex items-center justify-center z-10 transition-transform group-hover:scale-110", act.bg)}>
                                                <act.icon className={cn("w-5 h-5", act.color)} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <h4 className="text-[11px] font-black text-slate-900 uppercase italic font-brand tracking-tighter">{act.title}</h4>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">{act.time}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{act.detail}</p>
                                                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-2">{act.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* NEXT MILESTONE PREVIEW */}
                                    <div className="flex gap-6 group opacity-40">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center z-10">
                                            <CheckCircle2 className="w-5 h-5 text-slate-200" />
                                        </div>
                                        <div className="flex-1 mt-2">
                                            <h4 className="text-[11px] font-black text-slate-200 uppercase italic font-brand tracking-tighter">Onboarding Finalization</h4>
                                            <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest mt-1">Pending Approval Protocol</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* SUPER ADMIN HARDWARE (Fallback for 4-col on Admin) */}
                        {isSuperAdmin && (
                            <div className="xl:col-span-4 space-y-12">
                                <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Laptop className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand">Infrastructure</h3>
                                </div>
                                <div className="space-y-12">
                                    {renderDataField("Station Identity", "AZ-CENTRAL-NODE-08", <Monitor className="w-full h-full" />)}
                                    {renderDataField("Hardware Shard", "Verified Primary Terminal", <ShieldCheck className="w-full h-full" />)}
                                    {renderDataField("Protocol Shard", "v4.9.0-Final Stable", <HistoryIcon className="w-full h-full" />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── ADMINISTRATIVE FOOTER ── */}
                <div className="p-12 border-t border-slate-50 bg-white flex justify-center shrink-0">
                    <Button 
                        onClick={onClose}
                        className="h-16 px-14 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 rounded-[24px] font-black text-[12px] uppercase tracking-[0.4em] gap-6 transition-all active:scale-95 group shadow-sm border border-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                        {isSuperAdmin ? "Return to Command Core" : "Return to Personnel Roster"}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
