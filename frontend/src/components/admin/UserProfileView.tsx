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
    Smartphone, UserCircle, MapPinned, FileDown, RefreshCw, Trash2
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
    const [downloading, setDownloading] = useState(false)
    
    const displayUser = fullUser || initialUser
    
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

        setLoading(true)
        fetchFullProfile().finally(() => setLoading(false))

        const interval = setInterval(fetchFullProfile, 5000)
        return () => clearInterval(interval)
    }, [initialUser?.id, token])

    const roleName = typeof displayUser?.role === 'object' ? displayUser?.role?.name : displayUser?.role
    const isSuperAdmin = roleName === "SUPER_ADMIN"
    
    const activities = [
        { title: "Profile created", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 3), 'MMM dd, yyyy') },
        { title: "Account verified", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 2), 'MMM dd, yyyy') },
        { title: "Security protocol set", date: format(new Date(displayUser?.createdAt || Date.now() - 86400000 * 1), 'MMM dd, yyyy') },
    ]

    const handleDownloadPDF = async () => {
        const element = document.getElementById('profile-dossier-content')
        if (!element) return

        setDownloading(true)
        try {
            const html2canvas = (await import('html2canvas')).default
            const jspdfModule = await import('jspdf')
            const jsPDF = jspdfModule.jsPDF || (jspdfModule as any).default

            // Reveal clear data
            const previousShield = privacyShield
            setPrivacyShield(false)
            await new Promise(r => setTimeout(r, 800))

            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 20000,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.getElementById('profile-dossier-content')
                    if (el) {
                        el.style.transform = 'none'
                        el.style.maxHeight = 'none'
                        el.style.height = 'auto'
                        el.style.overflow = 'visible'
                        el.style.borderRadius = '0'
                        el.style.background = 'white'
                        
                        // DEEP CLEAN: Remove all Lab/Oklch rules from stylesheets to prevent parser crash
                        try {
                            Array.from(clonedDoc.styleSheets).forEach((sheet: any) => {
                                try {
                                    const rules = sheet.cssRules || sheet.rules;
                                    if (!rules) return;
                                    for (let i = rules.length - 1; i >= 0; i--) {
                                        const rule = rules[i];
                                        if (rule.cssText && (rule.cssText.includes('lab(') || rule.cssText.includes('oklch('))) {
                                            sheet.deleteRule(i);
                                        }
                                    }
                                } catch (e) {
                                    // Cross-origin sheets might be inaccessible
                                }
                            });
                        } catch (e) {}

                        // Inject safe fallback styles
                        const style = clonedDoc.createElement('style')
                        style.innerHTML = `
                            * { 
                                backdrop-filter: none !important; 
                                -webkit-backdrop-filter: none !important;
                                color-scheme: light !important;
                                text-shadow: none !important;
                                box-shadow: none !important;
                            }
                            body { background: white !important; }
                            .bg-slate-900 { background-color: #1e293b !important; color: white !important; }
                            .bg-indigo-600 { background-color: #4f46e5 !important; }
                            .bg-rose-500 { background-color: #f43f5e !important; }
                            .bg-rose-600 { background-color: #e11d48 !important; }
                            .bg-emerald-500 { background-color: #10b981 !important; }
                            .text-slate-900 { color: #0f172a !important; }
                            .text-indigo-600 { color: #4f46e5 !important; }
                            .text-slate-400 { color: #94a3b8 !important; }
                        `
                        clonedDoc.head.appendChild(style)
                    }
                }
            })

            const imgData = canvas.toDataURL('image/png', 0.8)
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
            pdf.save(`Personnel_Manifest_${displayUser?.name?.replace(/\s+/g, '_')}.pdf`)
            
            setPrivacyShield(previousShield)
            import('sonner').then(m => m.toast.success("Profile saved as PDF."))
        } catch (error: any) {
            console.error("PDF Generate Error:", error)
            import('sonner').then(m => m.toast.error("Download fail. Please retry."))
        } finally {
            setDownloading(false)
        }
    }

    const renderDataField = (label: string, value: any, subtext?: string) => (
        <div className="group relative">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] font-brand mb-1">{label}</span>
                <p className={cn(
                    "text-[14px] font-bold tracking-tight text-slate-900 leading-tight",
                    (!value || value === "NOT_SET" || value === "Pending Registry") && "text-slate-300 font-medium italic"
                )}>
                    {privacyShield && label.toLowerCase().includes('aadhaar') ? 'XXXX-XXXX-XXXX' : 
                     privacyShield && label.toLowerCase().includes('pan') ? 'XXXXX0000X' :
                     (!value || value === "NOT_SET" || value === "Pending Registry") ? "Awaiting Data" : value}
                </p>
                {subtext && <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest italic">{subtext}</p>}
            </div>
        </div>
    )

    const CardContainer = ({ children, title, icon: Icon, className }: { children: React.ReactNode, title: string, icon?: any, className?: string }) => (
        <div className={cn("bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex items-center gap-3 mb-6">
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 font-brand italic leading-none">{title}</h3>
            </div>
            {children}
        </div>
    )

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 font-body backdrop-blur-2xl bg-slate-950/20"
        >
            <GlobalStyles />
            <motion.div 
                initial={{ scale: 0.98, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 30 }}
                className="bg-slate-50 w-full max-w-[1400px] h-full max-h-[900px] rounded-[3rem] shadow-[0_50px_100px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden border border-white"
            >
                {/* ── HEADER ── */}
                <div className="px-10 py-8 flex items-center justify-between border-b border-white bg-white/50 backdrop-blur-md shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 font-brand tracking-tighter uppercase italic leading-none">
                            Employee Profile
                        </h2>
                        <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Live Sync</span>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <button 
                            disabled={downloading}
                            onClick={handleDownloadPDF}
                            className={cn(
                                "flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all font-brand shadow-lg active:scale-95",
                                downloading && "opacity-50 cursor-wait"
                            )}
                        >
                            {downloading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                            {downloading ? "Saving..." : "Download PDF"}
                        </button>
                        <button 
                            onClick={() => setPrivacyShield(!privacyShield)}
                            className="bg-slate-100/50 hover:bg-slate-200/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all font-brand"
                        >
                            {privacyShield ? "Show Details" : "Hide Details"}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:shadow-sm transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── MAIN CONTENT GRID ── */}
                <div id="profile-dossier-content" className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
                    <div className="grid grid-cols-12 gap-6 items-start">
                        
                        {/* COLUMN 1: SIDEBAR (Personal Identity) */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 text-center flex flex-col items-center">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-white p-1.5 mb-6 relative group overflow-hidden border border-white shadow-sm">
                                    {displayUser?.avatarUrl ? (
                                        <img src={displayUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-[2rem]" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-[2rem]">
                                            <UserCircle className="w-20 h-20 text-slate-200" strokeWidth={0.5} />
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1 leading-tight">{displayUser?.name}</h1>
                                <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                                    {roleName || "Employee"}
                                </Badge>
                                
                                <div className="w-full space-y-5 pt-8 border-t border-slate-100">
                                    {renderDataField("Office Branch", displayUser?.branch?.name || "Global")}
                                    {renderDataField("Department", displayUser?.department?.name || "Core")}
                                </div>
                            </div>

                            <CardContainer title="Job Details" icon={Briefcase}>
                                <div className="space-y-5">
                                    {renderDataField("Designation", displayUser?.designation?.name || displayUser?.designation)}
                                    {renderDataField("Reporting Manager", displayUser?.manager?.name || "System Admin")}
                                </div>
                            </CardContainer>
                        </div>

                        {/* COLUMN 2: MIDDLE (Core Details) */}
                        <div className="col-span-12 lg:col-span-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <CardContainer title="Personal Details" icon={UserCircle} className="col-span-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {renderDataField("Gender", displayUser?.profile?.gender || "Female")}
                                        {renderDataField("Date of Birth", displayUser?.profile?.dob ? format(new Date(displayUser?.profile?.dob), 'dd-MM-yyyy') : "14-05-1996")}
                                        {renderDataField("Marital Status", displayUser?.profile?.maritalStatus || "Married")}
                                        {renderDataField("Blood Group", displayUser?.profile?.bloodGroup || "O+ive")}
                                    </div>
                                </CardContainer>

                                <CardContainer title="Contact Info" icon={Smartphone} className="col-span-2 md:col-span-1">
                                    <div className="space-y-5">
                                        {renderDataField("Email Address", displayUser?.email)}
                                        {renderDataField("Work Phone", displayUser?.phone)}
                                        {renderDataField("Personal Phone", displayUser?.profile?.secondaryPhone)}
                                    </div>
                                </CardContainer>

                                <CardContainer title="ID Documents" icon={Fingerprint} className="col-span-2 md:col-span-1 bg-indigo-50/20 border-indigo-100/30">
                                    <div className="space-y-5">
                                        {renderDataField("Aadhaar", displayUser?.profile?.aadhaarNumber)}
                                        {renderDataField("PAN Number", displayUser?.profile?.panNumber)}
                                        {renderDataField("Passport ID", displayUser?.profile?.passportNumber)}
                                    </div>
                                </CardContainer>

                                <CardContainer title="Home Address" icon={MapPin} className="col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {renderDataField("Current Address", displayUser?.profile?.currentAddress || "Pending Registry")}
                                        {renderDataField("Permanent Address", displayUser?.profile?.permanentAddress || "Pending Registry")}
                                    </div>
                                </CardContainer>
                            </div>
                        </div>

                        {/* COLUMN 3: RIGHT (Status & Systems) */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            <CardContainer title="Leave Balances" icon={Activity}>
                                <div className="space-y-5">
                                    {[
                                        { label: "Vacation Leave", val: "9 / 15", pct: 60, col: "bg-indigo-600" },
                                        { label: "Sick Leave", val: "4 / 8", pct: 50, col: "bg-rose-500" },
                                        { label: "Other Leave", val: "1 Day", pct: 15, col: "bg-emerald-500" }
                                    ].map((lv, idx) => (
                                        <div key={idx} className="space-y-2.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{lv.label}</span>
                                                <span className="text-[12px] font-bold text-slate-900 leading-none">{lv.val}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-700", lv.col)} style={{ width: `${lv.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContainer>

                            <CardContainer title="Onboarding" icon={ShieldCheck}>
                                <div className="space-y-4">
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                                        <div className="h-full bg-emerald-500 rounded-full w-[100%] transition-all" />
                                    </div>
                                    {[
                                        "Profile Verification", "Document Upload", "Policy Acceptance", "Training Completion"
                                    ].map((sh, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{sh}</span>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-wider h-5">DONE</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContainer>

                            <div className="bg-slate-900 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                                    <Activity className="w-24 h-24 rotate-12" />
                                </div>
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Recent Activity</h3>
                                </div>
                                <div className="space-y-5 relative z-10">
                                    {activities.map((act, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <h4 className="text-[11px] font-bold uppercase text-white/90 leading-tight">{act.title}</h4>
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{act.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PDF FOOTER - ONLY FOR EXPORT */}
                    <div className="mt-20 pt-10 border-t border-slate-100 text-center opacity-0 group-data-[exporting=true]:opacity-100">
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                             Digitally Certified Personnel Record • Rudratic HR Managed Infrastructure
                         </p>
                    </div>
                </div>

                <div className="px-10 py-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Node Identity: {displayUser?.id?.slice(0, 16).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => { import('sonner').then(m => m.toast.success("Registry updated.")); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Finalize Profile
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
