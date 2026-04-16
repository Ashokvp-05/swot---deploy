"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

/* --- 1. GLOBAL STYLES --- */
const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
            --brand-primary: #a855f7;
            --brand-glass: rgba(15, 15, 20, 0.6);
            --brand-border: rgba(255, 255, 255, 0.08);
        }

        .font-brand { font-family: 'Orbitron', sans-serif; }
        .font-tech { font-family: 'Rajdhani', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .glass-card {
            background: var(--brand-glass);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: 
                0 0 0 1px var(--brand-border),
                0 20px 40px -10px rgba(0, 0, 0, 0.5);
        }
        
        .premium-input {
            background: rgba(5, 5, 8, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-input:focus-within {
            background: rgba(5, 5, 8, 0.8);
            border-color: rgba(168, 85, 247, 0.5);
            box-shadow: 0 0 20px -5px rgba(168, 85, 247, 0.2);
        }
    `}</style>
)

/* --- 2. ASSETS --- */
const RudraticLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M25 10 L50 10 L40 60 L15 60 Z" fill="url(#grad1)" />
        <path d="M55 10 L95 10 L80 40 L50 40 Z" fill="url(#grad2)" />
        <path d="M48 48 L75 48 L85 70 L58 70 Z" fill="url(#grad3)" />
        <defs>
            <linearGradient id="grad1" x1="15" y1="10" x2="50" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="#9333ea" /><stop offset="1" stopColor="#d946ef" /></linearGradient>
            <linearGradient id="grad2" x1="50" y1="10" x2="95" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#d946ef" /><stop offset="1" stopColor="#ec4899" /></linearGradient>
            <linearGradient id="grad3" x1="48" y1="48" x2="85" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#7e22ce" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
        </defs>
    </svg>
)

/* --- 3. BACKGROUND --- */
const NetworkBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) return
        let w = 0, h = 0, animId = 0
        const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
        handleResize()

        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15
        }))

        const animate = () => {
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w); grad.addColorStop(0, "#110e2e"); grad.addColorStop(1, "#020005")
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

            ctx.fillStyle = "rgba(168, 85, 247, 0.4)"; ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1
                ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill()
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = p.x - particles[j].x, dy = p.y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 120) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke() }
                }
            })
            animId = requestAnimationFrame(animate)
        }
        animate()
        window.addEventListener('resize', handleResize)
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animId) }
    }, [])
    return <canvas ref={canvasRef} className="absolute inset-0 block" />
}

function ResetFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Mouse Spotlight Effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const backgroundStyle = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.15), transparent 80%)`

    useEffect(() => {
        const handleMouseMap = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
        window.addEventListener("mousemove", handleMouseMap)
        return () => window.removeEventListener("mousemove", handleMouseMap)
    }, [mouseX, mouseY])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password })
            })
            if (!res.ok) throw new Error("Failed to reset password")
            setSuccess(true)
            toast.success("Password Updated")
            setTimeout(() => router.push("/login"), 3000)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-white font-bold">Invalid Token</h4>
                    <p className="text-xs text-slate-400">The reset link is missing or has expired.</p>
                </div>
                <Link href="/forgot-password">
                    <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold">Request New Link</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="relative z-10 w-full max-w-[1280px] px-8 lg:px-16 grid lg:grid-cols-2 gap-24 items-center h-full">
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ background: backgroundStyle }}
            />

            {/* LEFT: BRANDING */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex flex-col items-start select-none"
            >
                <div className="flex items-center gap-6 mb-6">
                    <RudraticLogo className="w-24 h-24 drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]" />
                    <h1 className="font-brand text-[3.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm tracking-tight">RUDRATIC</h1>
                </div>
                <h2 className="pl-[8.5rem] -mt-4 mb-8 font-tech text-3xl text-slate-300 tracking-[0.25em] font-semibold uppercase opacity-90">NEXUS HR</h2>
                <p className="pl-[8.6rem] text-sm text-slate-500 font-medium tracking-wider uppercase border-l border-white/10 pl-5 leading-relaxed">Credential Update<br /><span className="text-[10px] text-purple-400/80 mt-1 block">Security Override Protocol</span></p>
            </motion.div>

            {/* RIGHT: PREMIUM RESET CARD */}
            <div className="flex justify-center lg:justify-end w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                    className="w-full max-w-[440px] relative group"
                >
                    <div className="glass-card rounded-[24px] p-8 lg:p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                        <div className="flex flex-col items-center mb-8">
                            <RudraticLogo className="w-10 h-10 mb-4 opacity-90" />
                            <h3 className="text-xl font-bold text-white tracking-tight">New Password</h3>
                            <p className="text-xs text-slate-400 mt-1">Configure secure access</p>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Passphrase</label>
                                    <div className="premium-input rounded-xl relative flex items-center">
                                        <Lock className="ml-4 w-4 h-4 text-slate-500" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus:ring-0 text-[14px] flex-1"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-slate-500 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Verify Password</label>
                                    <div className="premium-input rounded-xl relative flex items-center">
                                        <Lock className="ml-4 w-4 h-4 text-slate-500" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus:ring-0 text-[14px] flex-1"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-[0_10px_30px_-10px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.01] active:scale-[0.99] text-sm uppercase tracking-wider"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Credentials"}
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-white font-bold">Protocol Complete</h4>
                                    <p className="text-xs text-slate-400">Your credentials have been synchronized.<br />Redirecting to authentication portal...</p>
                                </div>
                                <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                            </motion.div>
                        )}
                        <div className="mt-8 text-center pt-6 border-t border-white/5">
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Secured by Rudratic Identity™</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center font-body text-slate-200 relative overflow-hidden bg-[#020005]">
            <GlobalStyles />
            <NetworkBackground />
            <Suspense fallback={<div className="font-brand text-2xl text-white">Initializing Token Validation...</div>}>
                <ResetFormContent />
            </Suspense>
        </div>
    )
}
