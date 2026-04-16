"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, Shield, Radio, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { getDashboardByRole } from "@/lib/role-redirect"

const GlobalStyles = () => (
    <style jsx global>{`
        body { 
            font-family: 'Inter', var(--font-inter), system-ui, -apple-system, sans-serif; 
            background: #02040a;
            color: white;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }
        .glass-card {
            background: rgba(13, 14, 24, 0.82);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 100px rgba(0, 0, 0, 0.7);
        }
        .input-shard {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.25s ease;
        }
        .input-shard:focus-within {
            border-color: rgba(99, 102, 241, 0.6);
            background: rgba(255, 255, 255, 0.05);
        }
        .label-text {
            font-size: 11px;
            font-weight: 600;
            color: rgba(148, 163, 184, 0.8);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .social-btn {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            color: rgba(255, 255, 255, 0.7) !important;
            font-weight: 500 !important;
            letter-spacing: 0.025em;
        }
        .social-btn:hover {
            background: rgba(255, 255, 255, 0.07) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
            color: white !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        .social-btn:active {
            transform: translateY(0) scale(0.97);
            background: rgba(255, 255, 255, 0.05) !important;
            opacity: 0.8;
        }
    `}</style>
)

const BackgroundGrid = () => (
    <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[#02040a]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_100%_200px,#1a1c2e,transparent)]" />
    </div>
)

export default function LoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loginData, setLoginData] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mount, setMount] = useState(false)

    useEffect(() => { setMount(true) }, [])

    useEffect(() => {
        if (status === "authenticated") {
            const role = (session?.user as any)?.role
            router.push(getDashboardByRole(role))
            router.refresh()
        }
    }, [status, session, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: loginData.email.trim().toLowerCase(),
                password: loginData.password.trim(),
            }) as any

            if (result?.error) {
                toast.error("Invalid credentials")
                setLoading(false)
                return
            }
            router.refresh()
        } catch (err) {
            toast.error("Connection failed")
            setLoading(false)
        }
    }

    if (!mount || status === "loading") return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#02040a]">
            <GlobalStyles />
            <BackgroundGrid />

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
                
                {/* LEFT: Branding Section */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex flex-col select-none no-caret">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                        Join <span className="text-fuchsia-400">Rudratic</span> Workforce
                    </h1>
                    <p className="text-slate-400 text-lg mb-12 max-w-md font-medium leading-relaxed">
                        The all-in-one intelligence platform for modern team management, security, and enterprise efficiency.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: Shield, text: "Bank-grade security & encryption" },
                            { icon: Radio, text: "Real-time analytics & insights" },
                            { icon: ShieldCheck, text: "Role-based access control" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                                    <item.icon className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-slate-300 font-semibold text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT: Auth Card */}
                <div className="flex justify-center lg:justify-end">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[480px] relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-[2.5rem] blur-2xl z-0" />
                        
                        <div className="glass-card rounded-[2.5rem] p-10 lg:p-12 relative z-10 border border-white/5">
                            {/* Tabs */}
                            <div className="flex bg-[#0d0e18] rounded-2xl p-1.5 mb-10 border border-white/5">
                                <button type="button" className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/30">Sign In</button>
                                <Link href="/register" className="flex-1 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-300 transition-all text-center">Join Us</Link>
                            </div>

                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">WELCOME BACK</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Access your enterprise dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="label-text">EMAIL ADDRESS</label>
                                    <div className="input-shard rounded-xl flex items-center px-4 h-14">
                                        <Input 
                                            type="email" 
                                            value={loginData.email} 
                                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                            className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                            placeholder="name@company.com" 
                                            required 
                                            autoComplete="email"
                                        />
                                        <Mail className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-text">PASSWORD</label>
                                    <div className="input-shard rounded-xl flex items-center px-4 h-14">
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            value={loginData.password} 
                                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                            className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                            placeholder="••••••••" 
                                            required 
                                            autoComplete="current-password"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-1">
                                            {showPassword ? <EyeOff className="w-4 h-4 text-slate-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="rem" className="border-white/10" />
                                        <label htmlFor="rem" className="text-[10px] font-bold text-slate-400 cursor-pointer">Remember me</label>
                                    </div>
                                    <Link href="/forgot-password" className="text-[10px] text-indigo-400 font-black uppercase tracking-widest transition-colors hover:text-indigo-300">Forgot Password?</Link>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full h-14 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 uppercase tracking-widest text-[11px] transition-all active:scale-[0.98]">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN NOW"}
                                </Button>
                            </form>

                            <div className="my-8 text-[10px] font-black text-slate-700 text-center uppercase tracking-[0.3em]">FAST ACCESS</div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button className="social-btn h-14 rounded-2xl flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
                                    <span className="text-[10px] font-black tracking-widest">GOOGLE</span>
                                </Button>
                                <Button className="social-btn h-14 rounded-2xl flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fbb00" d="M13 1h10v10H13z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>
                                    <span className="text-[10px] font-black tracking-widest">MICROSOFT</span>
                                </Button>
                            </div>

                            <p className="mt-10 text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] text-center select-none opacity-50">
                                POWERED BY RUDRATIC INTELLIGENCE + ENTERPRISE V3.0.1
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
