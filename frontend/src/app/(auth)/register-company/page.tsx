"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Loader2,
    Eye,
    EyeOff,
    Building2,
    CheckCircle2,
    Users,
    Globe,
    Mail,
    Phone,
    Briefcase,
    ShieldCheck,
    ArrowRight,
    ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* --- 1. GLOBAL STYLES --- */
const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {
            --zoho-blue: #1e40af;
            --zoho-blue-light: #eff6ff;
            --zoho-border: #e2e8f0;
        }

        body {
            background-color: #f8fafc;
        }

        .font-brand { font-family: 'Outfit', sans-serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .pro-card {
            background: #ffffff;
            box-shadow: 
                0 4px 6px -1px rgba(0, 0, 0, 0.05),
                0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--zoho-border);
        }
        
        .pro-input {
            background: #ffffff;
            border: 1px solid var(--zoho-border);
            transition: all 0.2s ease;
        }
        .pro-input:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Custom Scrollbar for Form if needed */
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
    `}</style>
)

export default function RegisterCompanyPage() {
    const router = useRouter()
    const [mount, setMount] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formStep, setFormStep] = useState(1)

    const [formData, setFormData] = useState({
        companyName: "",
        industry: "",
        companyEmail: "",
        companyPhone: "",
        domain: "",
        address: "",
        adminName: "",
        email: "", // Admin email
        adminPhone: "",
        password: "",
        plan: "FREE" as "FREE" | "PRO"
    })

    useEffect(() => {
        setMount(true)
    }, [])

    const nextStep = () => {
        if (formStep === 1) {
            if (!formData.companyName || !formData.companyEmail || !formData.industry) {
                toast.error("Please fill in the required company details")
                return
            }
        }
        setFormStep(2)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    phone: formData.adminPhone,
                }),
            })

            const data = await apiRes.json()

            if (!apiRes.ok) throw new Error(data.error || "Failed to register company")

            toast.success("Organization successfully registered!")
            setFormStep(3)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!mount) return null

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-body text-slate-900 relative bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
            <GlobalStyles />

            {/* LEFT SIDE: Brand & Value Prop (Visible on Large Screens) */}
            <div className="hidden lg:flex w-1/3 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 text-white mb-16">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-brand font-bold text-blue-600 text-xl">
                            R
                        </div>
                        <span className="font-brand font-extrabold text-2xl tracking-tight">RUDRATIC</span>
                    </Link>

                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Build a better <br /> workplace with <br /> Rudratic People.
                        </h2>
                        <ul className="space-y-4">
                            {[
                                { icon: Users, text: "Seamless Employee Management" },
                                { icon: ShieldCheck, text: "Enterprise-Grade Security" },
                                { icon: Globe, text: "Automated Global Compliance" },
                                { icon: Briefcase, text: "Advanced Performance Tracking" }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-blue-100">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                                        <item.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm font-medium">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/10">
                    <p className="text-blue-200 text-xs">
                        &copy; 2026 Rudratic Technologies. All rights reserved. Professional HRMS Suite.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Registration Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 overflow-y-auto">

                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">R</div>
                    <span className="font-bold text-xl text-blue-900 tracking-tight">RUDRATIC</span>
                </div>

                <div className="w-full max-w-[580px]">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-bold text-slate-900 font-brand">Set up your organization</h1>
                        <p className="text-slate-500 mt-1">Get started with our all-in-one HRMS solution.</p>
                    </motion.div>

                    {/* Step Tabs */}
                    <div className="flex items-center gap-2 mb-8">
                        {[
                            { step: 1, label: "Organization" },
                            { step: 2, label: "Administrator" },
                            { step: 3, label: "Complete" }
                        ].map((s) => (
                            <div key={s.step} className="flex items-center gap-2">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                                    formStep === s.step
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                        : formStep > s.step
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-100 text-slate-400"
                                )}>
                                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                                        {formStep > s.step ? <CheckCircle2 className="w-3 h-3" /> : s.step}
                                    </span>
                                    {s.label}
                                </div>
                                {s.step < 3 && <div className="w-4 h-[1px] bg-slate-200" />}
                            </div>
                        ))}
                    </div>

                    <div className="pro-card rounded-2xl p-8 lg:p-10 relative overflow-hidden bg-white">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {formStep === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Company Name *</label>
                                                <div className="pro-input rounded-xl overflow-hidden flex items-center px-3">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <Input
                                                        value={formData.companyName}
                                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 px-3 font-medium text-sm"
                                                        placeholder="e.g. Rudratic Corp"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Industry *</label>
                                                <div className="pro-input rounded-xl overflow-hidden flex items-center px-3">
                                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                                    <Input
                                                        value={formData.industry}
                                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 px-3 font-medium text-sm"
                                                        placeholder="e.g. Technology"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Official Email *</label>
                                                <div className="pro-input rounded-xl overflow-hidden flex items-center px-3">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <Input
                                                        type="email"
                                                        value={formData.companyEmail}
                                                        onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 px-3 font-medium text-sm"
                                                        placeholder="contact@rudratic.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Company Phone</label>
                                                <div className="pro-input rounded-xl overflow-hidden flex items-center px-3">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <Input
                                                        value={formData.companyPhone}
                                                        onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 px-3 font-medium text-sm"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 ml-1">Corporate Domain / Website</label>
                                            <div className="pro-input rounded-xl overflow-hidden flex items-center px-3">
                                                <Globe className="w-4 h-4 text-slate-400" />
                                                <Input
                                                    value={formData.domain}
                                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                                    className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 px-3 font-medium text-sm"
                                                    placeholder="www.rudratic.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-4">
                                            <label className="text-xs font-semibold text-slate-700 ml-1">Subscription Plan</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { id: "FREE", label: "Professional", sub: "14-Day Free Trial" },
                                                    { id: "PRO", label: "Enterprise", sub: "Priority Support" }
                                                ].map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, plan: p.id as "FREE" | "PRO" })}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                                                            formData.plan === p.id
                                                                ? "border-blue-600 bg-blue-50/50"
                                                                : "border-slate-100 bg-white hover:border-slate-200"
                                                        )}
                                                    >
                                                        {formData.plan === p.id && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                        )}
                                                        <span className={cn(
                                                            "block text-sm font-bold",
                                                            formData.plan === p.id ? "text-blue-900" : "text-slate-700"
                                                        )}>{p.label}</span>
                                                        <span className="block text-[10px] text-slate-500 font-medium mt-0.5">{p.sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full h-12 mt-4 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            Next: Administrator Details
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ) : formStep === 2 ? (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Admin Full Name *</label>
                                                <div className="pro-input rounded-xl overflow-hidden px-3">
                                                    <Input
                                                        autoComplete="name"
                                                        value={formData.adminName}
                                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 font-medium text-sm"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 ml-1">Admin Mobile</label>
                                                <div className="pro-input rounded-xl overflow-hidden px-3">
                                                    <Input
                                                        value={formData.adminPhone}
                                                        onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                                                        className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 font-medium text-sm"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 ml-1">Login Email Address *</label>
                                            <div className="pro-input rounded-xl overflow-hidden px-3">
                                                <Input
                                                    type="email"
                                                    autoComplete="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 font-medium text-sm"
                                                    placeholder="admin@yourcompany.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 ml-1">Set Password *</label>
                                            <div className="pro-input rounded-xl flex items-center px-3">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="h-11 bg-transparent border-none text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 font-medium flex-1 text-sm transition-all"
                                                    placeholder="Minimum 8 characters"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                onClick={() => setFormStep(1)}
                                                variant="outline"
                                                className="h-12 flex-1 rounded-xl border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="h-12 flex-[2] bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : formStep === 3 ? (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6 text-center py-6"
                                    >
                                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 font-brand">Registration Complete!</h3>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                Congratulations! <span className="text-slate-900 font-bold">{formData.companyName}</span> has been successfully onboarded.
                                                We've sent a verification link to <span className="text-blue-600 font-bold underline">{formData.email}</span>.
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            className="w-full h-12 mt-4 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                                        >
                                            <Link href="/login">Launch Admin Console</Link>
                                        </Button>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </form>

                        {formStep < 3 && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-sm">
                                <span className="text-slate-500">Already have an organization?</span>
                                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer terms */}
                <div className="mt-12 text-center">
                    <p className="text-[11px] text-slate-400 max-w-[400px] leading-relaxed mx-auto">
                        By continuing, you agree to our <span className="text-slate-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    )
}
