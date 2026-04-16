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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; }
        .glass-card {
            background: rgba(13, 14, 24, 0.82);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 100px rgba(0, 0, 0, 0.6);
        }
        .input-shard {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-shard:focus-within {
            border-color: rgba(217, 70, 239, 0.6);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: 0 0 15px rgba(217, 70, 239, 0.2);
        }
    `}</style>
)

const NetworkGrid = () => (
    <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[#02040a]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_100%_200px,#1e2235,transparent)]" />
    </div>
)

export default function SignUpPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ fullName: "", email: "", company: "", password: "", confirmPassword: "", agreeToTerms: false })
    const [loading, setLoading] = useState(false)
    const [mount, setMount] = useState(false)

    useEffect(() => { setMount(true) }, [])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Frontend Validations
        if (!formData.agreeToTerms) {
            toast.error("Compliance required: Please agree to Terms & Privacy")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Security mismatch: Passwords do not correlate")
            return
        }
        if (formData.password.length < 6) {
            toast.error("Invalid security key: Minimum 6 characters required")
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
                toast.error(data.error || "Registration sequence failed")
                setLoading(false)
                return
            }

            toast.success("Identity Shard Created. Initializing Auth Sync...")
            
            // Automatic Sign In
            const result = await signIn("credentials", { 
                redirect: false, 
                email: formData.email.trim().toLowerCase(), 
                password: formData.password 
            })

            if (result?.error) {
                toast.info("Account created. Please sign in manually.")
                router.push("/login")
            } else {
                toast.success("Authentication Protocol Success")
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            toast.error("Network handshake interrupted. Verify server status.")
            setLoading(false)
        }
    }

    if (!mount) return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#02040a]">
            <GlobalStyles />
            <NetworkGrid />

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
                
                {/* LEFT: Branding Section */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hidden lg:flex flex-col select-none">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none uppercase italic">
                        Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 font-bold">Rudratic</span> Workforce
                    </h1>
                    <p className="text-slate-400 text-lg mb-12 max-w-sm font-medium leading-relaxed opacity-80">
                        The all-in-one intelligence platform for modern team management, security, and enterprise efficiency.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: Shield, text: "Bank-grade security & encryption" },
                            { icon: Radio, text: "Real-time analytics & insights" },
                            { icon: ShieldCheck, text: "Role-based access control" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-colors group-hover:border-fuchsia-500/50">
                                    <item.icon className="w-4 h-4 text-fuchsia-400" />
                                </div>
                                <span className="text-slate-400 font-bold text-sm uppercase tracking-wide group-hover:text-white transition-colors">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT: Auth Card */}
                <div className="flex justify-center lg:justify-end">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-[480px] relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600/20 to-indigo-600/20 rounded-[2.5rem] blur-3xl z-0" />
                        
                        <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 relative z-10">
                            {/* Tabs */}
                            <div className="flex bg-white/5 rounded-2xl p-1.5 mb-10 border border-white/5">
                                <Link href="/login" className="flex-1 py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:text-slate-300 transition-all text-center">Sign In</Link>
                                <button type="button" className="flex-1 py-3 bg-fuchsia-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-fuchsia-600/20">Join Us</button>
                            </div>

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 italic">Join Rudratic</h2>
                                <p className="text-[10px] text-fuchsia-400 font-black uppercase tracking-widest">Start your journey with us today</p>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="input-shard rounded-2xl flex items-center px-4 h-12">
                                            <Input 
                                                value={formData.fullName} 
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                className="bg-transparent border-none text-white focus:ring-0 text-sm h-full placeholder:text-slate-800" 
                                                placeholder="John Doe" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company</label>
                                        <div className="input-shard rounded-2xl flex items-center px-4 h-12">
                                            <Input 
                                                value={formData.company} 
                                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                className="bg-transparent border-none text-white focus:ring-0 text-sm h-full placeholder:text-slate-800" 
                                                placeholder="Acme Inc." 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="input-shard rounded-2xl flex items-center px-4 h-12">
                                        <Input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="bg-transparent border-none text-white focus:ring-0 text-sm h-full w-full placeholder:text-slate-800" 
                                            placeholder="name@company.com" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                        <div className="input-shard rounded-2xl flex items-center px-4 h-12">
                                            <Input 
                                                type="password" 
                                                value={formData.password} 
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="bg-transparent border-none text-white focus:ring-0 text-sm h-full placeholder:text-slate-800" 
                                                placeholder="••••••••" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                                        <div className="input-shard rounded-2xl flex items-center px-4 h-12">
                                            <Input 
                                                type="password" 
                                                value={formData.confirmPassword} 
                                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                                className="bg-transparent border-none text-white focus:ring-0 text-sm h-full placeholder:text-slate-800" 
                                                placeholder="••••••••" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 px-1">
                                    <Checkbox 
                                        id="terms" 
                                        checked={formData.agreeToTerms} 
                                        onCheckedChange={(c) => setFormData({...formData, agreeToTerms: c as boolean})} 
                                        className="border-white/10 data-[state=checked]:bg-fuchsia-600 data-[state=checked]:border-fuchsia-600 rounded-md" 
                                    />
                                    <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer leading-none">I agree to the Terms & Privacy</label>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full h-14 mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl shadow-xl shadow-fuchsia-600/30 uppercase tracking-[0.2em] text-[11px] transition-all active:scale-[0.98]">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Now"}
                                </Button>
                            </form>

                            <div className="my-8 flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Fast Access</div>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12 bg-white/5 border-white/5 text-[10px] font-black uppercase rounded-2xl hover:bg-white/10 text-white tracking-widest">
                                    Google
                                </Button>
                                <Button variant="outline" className="h-12 bg-white/5 border-white/5 text-[10px] font-black uppercase rounded-2xl hover:bg-white/10 text-white tracking-widest">
                                    Microsoft
                                </Button>
                            </div>

                            <p className="mt-12 text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] text-center select-none">
                                Powered by Rudratic Intelligence • Enterprise v3.0.1
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
