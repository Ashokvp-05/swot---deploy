"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Shield, Zap, Users, Globe, LayoutDashboard, Key } from "lucide-react"
import { getDashboardByRole } from "@/lib/role-redirect"

interface LandingPageProps {
    session?: any
}

export default function LandingPage({ session }: LandingPageProps) {
    const isLoggedIn = !!session?.user
    const role = session?.user?.role
    const dashboardLink = getDashboardByRole(role)

    return (
        <div className="min-h-screen bg-[#020005] text-white overflow-hidden relative selection:bg-purple-500/30">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-fuchsia-900/10 rounded-full blur-[80px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="font-bold text-xl">R</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">Rudratic HR</span>
                </div>
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <Link href={dashboardLink}>
                            <Button className="bg-white text-black hover:bg-slate-200 font-bold rounded-full px-6">
                                <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-white text-black hover:bg-slate-200 font-bold rounded-full px-6">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                v3.0 Now Available
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400">
                                Enterprise HR <br />
                                Reimagined.
                            </h1>
                            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                                The all-in-one platform for modern teams. Manage attendance, payroll, performance, and culture with AI-driven insights.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            {isLoggedIn ? (
                                <Link href={dashboardLink}>
                                    <Button className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-transform hover:scale-105">
                                        Open Workspace <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-transform hover:scale-105">
                                        Launch Console <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            )}

                            <Button variant="outline" className="h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm">
                                View Demo
                            </Button>
                        </motion.div>

                        <div className="pt-8 flex items-center gap-8 text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm">SOC2 Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm">99.9% Uptime</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-[2rem] transform rotate-3 scale-105 blur-2xl" />
                        <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden">
                            {/* Mock UI Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                </div>
                                <div className="text-xs font-mono text-slate-500">dashboard.rudratic.com</div>
                            </div>

                            {/* Mock UI Content */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                                        <Users className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="text-2xl font-bold">1,248</div>
                                    <div className="text-xs text-slate-400">Total Employees</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="text-2xl font-bold">98.2%</div>
                                    <div className="text-xs text-slate-400">Productivity Rate</div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm font-bold">Recent Activity</div>
                                    <div className="text-xs text-slate-500">Live</div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-2 w-24 bg-white/10 rounded" />
                                                <div className="h-1.5 w-16 bg-white/5 rounded" />
                                            </div>
                                            <div className="text-xs text-emerald-400">Just now</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Features (Footer) */}
            <div className="border-t border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption & audit logs." },
                        { icon: users, title: "Team Management", desc: "Effortless onboarding & offboarding." },
                        { icon: LayoutDashboard, title: "Real-time Analytics", desc: "Live dashboard & custom reports." },
                        { icon: Globe, title: "Global Payroll", desc: "Multi-currency support built-in." }
                    ].map((feature, i) => (
                        <div key={i} className="group">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                <feature.icon className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                            </div>
                            <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-500">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function users(props: any) {
    return <Users {...props} />
}
