"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, User, Building2, Shield, Radio, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { 
            font-family: 'Inter', sans-serif; 
            background: #02040a;
            color: white;
            overflow-x: hidden;
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
            border-color: rgba(217, 70, 239, 0.6);
            background: rgba(255, 255, 255, 0.05);
        }
    `}</style>
)

const BackgroundGrid = () => (
    <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[#02040a]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_0%_800px,#2e1a2c,transparent)]" />
    </div>
)

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ fullName: "", email: "", company: "", password: "", confirmPassword: "", agreeToTerms: false })
    const [loading, setLoading] = useState(false)
    const [mount, setMount] = useState(false)

    useEffect(() => { setMount(true) }, [])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.agreeToTerms) {
            toast.error("Compliance required: Please agree to Terms & Privacy")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Security mismatch")
            return
        }
        setLoading(true)
        try {
            const api_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
            const response = await fetch(`${api_url}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    department: formData.company || "General",
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || "Registration failed")
                setLoading(false)
                return
            }
            await signIn("credentials", { 
                redirect: false, 
                email: formData.email.trim().toLowerCase(), 
                password: formData.password 
            })
            toast.success("Identity Shard Created")
            router.push("/")
            router.refresh()
        } catch (err: any) {
            toast.error("Server connection lost")
            setLoading(false)
        }
    }

    if (!mount) return null

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
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                    <item.icon className="w-4 h-4 text-fuchsia-400" />
                                </div>
                                <span className="text-slate-300 font-semibold text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT: Auth Card */}
                <div className="flex justify-center lg:justify-end">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[480px] relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 rounded-[3rem] blur-2xl z-0" />
                        
                        <div className="glass-card rounded-[3rem] p-10 lg:p-12 relative z-10 border border-white/5">
                            {/* Tabs */}
                            <div className="flex bg-[#0d0e18] rounded-2xl p-1.5 mb-10 border border-white/5">
                                <Link href="/login" className="flex-1 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-300 transition-all text-center">Sign In</Link>
                                <button type="button" className="flex-1 py-3 bg-fuchsia-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-fuchsia-600/30">Join Us</button>
                            </div>

                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">JOIN RUDRATIC</h2>
                                <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider">Start your journey with us today</p>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">FULL NAME</label>
                                        <div className="input-shard rounded-xl flex items-center px-4 h-12">
                                            <Input 
                                                value={formData.fullName} 
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                                placeholder="John Doe" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">COMPANY</label>
                                        <div className="input-shard rounded-xl flex items-center px-4 h-12">
                                            <Input 
                                                value={formData.company} 
                                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                                placeholder="Acme Inc." 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">EMAIL ADDRESS</label>
                                    <div className="input-shard rounded-xl flex items-center px-4 h-12">
                                        <Input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                            placeholder="name@company.com" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PASSWORD</label>
                                        <div className="input-shard rounded-xl flex items-center px-4 h-12">
                                            <Input 
                                                type="password" 
                                                value={formData.password} 
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                                placeholder="••••••••" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CONFIRM</label>
                                        <div className="input-shard rounded-xl flex items-center px-4 h-12">
                                            <Input 
                                                type="password" 
                                                value={formData.confirmPassword} 
                                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                                className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full placeholder:text-slate-700" 
                                                placeholder="••••••••" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                    <Checkbox 
                                        id="terms" 
                                        checked={formData.agreeToTerms} 
                                        onCheckedChange={(c) => setFormData({...formData, agreeToTerms: c as boolean})} 
                                        className="border-white/10 data-[state=checked]:bg-fuchsia-600" 
                                    />
                                    <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">I agree to the Terms & Privacy</label>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full h-14 mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl shadow-xl shadow-fuchsia-600/30 uppercase tracking-widest text-[11px] transition-all active:scale-[0.98]">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "JOIN NOW"}
                                </Button>
                            </form>

                            <div className="my-8 text-[10px] font-black text-slate-700 text-center uppercase tracking-[0.3em]">FAST ACCESS</div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12 bg-white/5 border-white/5 text-[10px] font-bold uppercase rounded-xl hover:bg-white/10 text-white">
                                    GOOGLE
                                </Button>
                                <Button variant="outline" className="h-12 bg-white/5 border-white/5 text-[10px] font-bold uppercase rounded-xl hover:bg-white/10 text-white">
                                    MICROSOFT
                                </Button>
                            </div>

                            <p className="mt-10 text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] text-center select-none opacity-50">
                                POWERED BY RUDRATIC INTELLIGENCE • ENTERPRISE V3.0.1
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
