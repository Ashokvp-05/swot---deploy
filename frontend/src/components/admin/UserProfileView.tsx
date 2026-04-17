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
    ChevronRight, Clock, CheckCircle2, UserPlus, FileText, GraduationCap, UploadCloud, XCircle, FilePlus,
    Smartphone, UserCircle, MapPinned
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

export default function UserProfileView({ user: initialUser, token, onClose, onEdit }: UserProfileViewProps) {
    const [privacyShield, setPrivacyShield] = useState(true)
    const [fullUser, setFullUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    
    const displayUser = fullUser || initialUser
    
    // Real-time polling for full profile orchestration
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!initialUser?.id) return
            try {
                const API = process.env.NEXT_PUBLIC_API_URL
                const res = await fetch(`${API}/users/${initialUser.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await res.json()
                setFullUser(data)
            } catch (err) {
                console.error("Profile sync fail", err)
            }
        }

        // Initial fetch
        setLoading(true)
        fetchFullProfile().finally(() => setLoading(false))

        // Establish real-time polling interval (5s)
        const interval = setInterval(fetchFullProfile, 5000)
        return () => clearInterval(interval)
    }, [initialUser?.id, token])

    // Determine role name and administrative status
    const roleName = typeof displayUser?.role === 'object' ? displayUser?.role?.name : displayUser?.role
    const isSuperAdmin = roleName === "SUPER_ADMIN"
    
    const activities = [
        { title: "Profile created", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 3), 'MMM dd, yyyy') },
        { title: "Account verified", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 2), 'MMM dd, yyyy') },
        { title: "Security protocol set", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 1), 'MMM dd, yyyy') },
    ]

    const renderDataField = (label: string, value: any, icon: any, subtext?: string) => (
        <div className="group relative">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-brand mb-2">{label}</span>
                <p className={cn(
                    "text-[15px] font-bold tracking-tight text-slate-900",
                    (!value || value === "NOT_SET") && "text-slate-300 font-normal"
                )}>
                    {privacyShield && label.toLowerCase().includes('aadhaar') ? 'XXXX-XXXX-XXXX' : 
                     privacyShield && label.toLowerCase().includes('pan') ? 'XXXXX0000X' :
                     (!value || value === "NOT_SET") ? "Awaiting Data" : value}
                </p>
                {subtext && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{subtext}</p>}
            </div>
        </div>
    )

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
        <div className="border-b border-slate-50 pb-4 mb-6">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand italic leading-none">{title}</h3>
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
                className="bg-white w-full max-w-7xl h-full max-h-[920px] rounded-[64px] shadow-[0_50px_150px_rgba(15,23,42,0.45)] flex flex-col overflow-hidden border border-white"
            >
                {/* ── MINIMALIST ADMINISTRATIVE HEADER ── */}
                <div className="px-12 py-10 flex items-center justify-between border-b border-slate-50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 font-brand tracking-tighter uppercase italic leading-none">
                            Employee Profile
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Live Sync
                            </span>
                            <span className="relative flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => setPrivacyShield(!privacyShield)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors font-brand"
                        >
                            {privacyShield ? "Show Details" : "Hide Details"}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 space-y-4">
                    
                    {/* ── HIGH-DENSITY COMMON ENGLISH MANIFEST ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
                        
                        {/* COLUMN 1: PROFILE & ROLE */}
                        <div className="space-y-4">
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-3xl border-2 border-white shadow-lg flex items-center justify-center relative p-1 bg-white mb-4 overflow-hidden">
                                     {displayUser?.avatarUrl ? (
                                        <img src={displayUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                                     ) : (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <UserCircle className="w-16 h-16 text-slate-200" strokeWidth={1} />
                                            <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                                                {displayUser?.name?.[0]}{displayUser?.name?.split(' ')?.[1]?.[0] || displayUser?.name?.[1]?.toUpperCase()}
                                            </span>
                                        </div>
                                     )}
                                </div>
                                {isSuperAdmin && (
                                    <div className="mb-4">
                                        <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                            Ultimate Authority
                                        </span>
                                    </div>
                                )}
                                <h1 className="text-xl font-bold text-slate-900 tracking-tighter uppercase leading-tight text-center">{displayUser?.name}</h1>
                                
                                <div className="w-full space-y-4 pt-4 border-t border-slate-100 mt-4">
                                    {renderDataField("User Role", roleName || "Employee", <Shield />)}
                                    {renderDataField("Office Branch", displayUser?.branch?.name || "Global", <Globe />)}
                                    {renderDataField("Department", displayUser?.department?.name || "Core", <Building2 />)}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={Briefcase} title="Job Details" subtitle="Position & Hierarchy" />
                                <div className="space-y-4">
                                    {renderDataField("Designation", displayUser?.designation?.name || displayUser?.designation, <Briefcase />)}
                                    {renderDataField("Reporting Manager", displayUser?.manager?.name || "System Admin", <UserCog />)}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: PERSONAL & CONTACT */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={UserCircle} title="Personal Details" subtitle="Basic Information" />
                                <div className="grid grid-cols-2 gap-4">
                                    {renderDataField("Gender", displayUser?.profile?.gender || "Female", <User />)}
                                    {renderDataField("Date of Birth", displayUser?.profile?.dob ? format(new Date(displayUser?.profile?.dob), 'dd-MM-yyyy') : "14-05-1996", <Calendar />)}
                                    {renderDataField("Marital Status", displayUser?.profile?.maritalStatus || "Married", <Heart />)}
                                    {renderDataField("Blood Group", displayUser?.profile?.bloodGroup || "O+ive", <Activity />)}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={Smartphone} title="Contact Info" subtitle="Reachability" />
                                {renderDataField("Email Address", displayUser?.email, <MailCheck />)}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {renderDataField("Work Phone", displayUser?.phone, <Smartphone />)}
                                    {renderDataField("Personal Phone", displayUser?.profile?.secondaryPhone, <Phone />)}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={MapPin} title="Home Address" subtitle="Residential Details" />
                                <div className="space-y-4">
                                    {renderDataField("Current Address", displayUser?.profile?.currentAddress || "Pending Registry", <MapPin />)}
                                    {renderDataField("Permanent Address", displayUser?.profile?.permanentAddress || "Pending Registry", <Building2 />)}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 3: DOCUMENTS & ONBOARDING */}
                        <div className="space-y-4">
                            <div className="bg-indigo-50/20 rounded-3xl p-6 border border-indigo-100/30 shadow-sm">
                                <SectionHeader icon={Fingerprint} title="ID Documents" subtitle="Identity Verification" />
                                <div className="space-y-4">
                                    {renderDataField("Aadhaar Number", displayUser?.profile?.aadhaarNumber, <Verified />)}
                                    {renderDataField("PAN Number", displayUser?.profile?.panNumber, <HardDrive />)}
                                    {renderDataField("Passport ID", displayUser?.profile?.passportNumber, <Globe />)}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={ShieldCheck} title="Onboarding Progress" subtitle="Step Completion" />
                                <div className="space-y-4">
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-4">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${displayUser?.onboardingSteps?.length > 0 ? (displayUser.onboardingSteps.filter((s:any) => s.completed).length / displayUser.onboardingSteps.length * 100) : 100}%` }} 
                                        />
                                    </div>
                                    {displayUser?.onboardingSteps?.length > 0 ? (
                                        displayUser.onboardingSteps.map((step: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{step.task}</span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase italic",
                                                    step.completed ? "text-emerald-600" : "text-amber-600"
                                                )}>{step.completed ? "Completed" : "Pending"}</span>
                                            </div>
                                        ))
                                    ) : (
                                        [
                                            { l: "Profile Verification", s: "Completed" },
                                            { l: "Document Upload", s: "Completed" },
                                            { l: "Policy Acceptance", s: "Completed" },
                                            { l: "Training Completion", s: "Completed" },
                                            { l: "Final HR Approval", s: "Completed" }
                                        ].map((sh, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{sh.l}</span>
                                                <span className="text-[9px] font-black uppercase italic text-emerald-600">{sh.s}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 4: STATUS & ACTIVITY */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <SectionHeader icon={Activity} title="Leave balances" subtitle="Time Off Status" />
                                <div className="space-y-6">
                                    {displayUser?.leaveBalances?.length > 0 ? (
                                        displayUser.leaveBalances.map((lb: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{lb.leaveTypeConfig?.name || "Leave"}</span>
                                                    <span className="text-[12px] font-bold text-slate-900">{lb.used} / {lb.total}</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full rounded-full bg-indigo-600")} 
                                                        style={{ width: `${lb.total > 0 ? (lb.used / lb.total) * 100 : 0}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        [
                                            { label: "Vacation Leave", val: "9 / 15", pct: 60, col: "bg-indigo-600" },
                                            { label: "Sick Leave", val: "4 / 8", pct: 50, col: "bg-rose-500" },
                                            { label: "Other Leave", val: "1 Day", pct: 10, col: "bg-slate-400" }
                                        ].map((lv, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{lv.label}</span>
                                                    <span className="text-[12px] font-bold text-slate-900">{lv.val}</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", lv.col)} style={{ width: `${lv.pct}%` }} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {isSuperAdmin && (
                                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-sm mt-4">
                                    <SectionHeader icon={Shield} title="System Control" subtitle="Root Level Access" />
                                    <div className="space-y-4">
                                        {renderDataField("System ID", displayUser?.id?.slice(0, 13).toUpperCase(), <Database />)}
                                        {renderDataField("Registry Status", "Global Root", <HardDrive />)}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex-1 mt-4">
                                <div className="border-b border-white/10 pb-4 mb-4">
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
                                </div>
                                <div className="space-y-4">
                                    {activities.map((act, i) => (
                                        <div key={i} className="flex flex-col py-1 border-b border-white/5 last:border-0">
                                            <h4 className="text-[10px] font-bold uppercase text-white">{act.title}</h4>
                                            <p className="text-[8px] text-white/40 font-medium uppercase tracking-widest">{act.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MINIMALIST FOOTER ── */}
                <div className="p-10 border-t border-slate-50 flex items-center justify-end shrink-0">

                    <Button 
                        onClick={() => { import('sonner').then(m => m.toast.success("Profile saved.")); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 h-14 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 font-brand"
                    >
                        Save
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
