"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Clock, Activity, User, Shield, 
    FileText, CheckCircle2, AlertCircle,
    ArrowRight, ChevronRight, Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"

export default function HistoryPage() {
    const { data: session, status } = useSession()
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login")
        }
    }, [status])

    const fetchHistory = async () => {
        if (!session?.user?.accessToken) return
        try {
            const res = await fetch(`${API_BASE_URL}/admin/overview`, {
                headers: { Authorization: `Bearer ${session.user.accessToken}` }
            })
            if (res.ok) {
                const data = await res.json()
                if (data.recentActivity) {
                    setActivities(data.recentActivity)
                }
            }
        } catch (error) {
            console.error("History Fetch Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.accessToken) {
            fetchHistory()
            const interval = setInterval(fetchHistory, 10000) // Refresh every 10s
            return () => clearInterval(interval)
        }
    }, [session])

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading History...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-5xl mx-auto py-12 px-6 space-y-12 font-brand">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Zap className="w-4 h-4" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter italic">
                        Activity <span className="text-indigo-600">History</span>
                    </h1>
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Live Feed</span>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-11">
                    List of all system updates and actions
                </p>
            </div>

            {/* ACTIVITY FEED */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Timeline</CardTitle>
                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest italic">A simple record of what happened in the system</p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-4 py-1 border-indigo-100 text-indigo-600 text-[9px] font-bold uppercase">
                            {activities.length} Entries
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-white/5">
                        <AnimatePresence>
                            {activities.length > 0 ? (
                                activities.map((activity, index) => (
                                    <motion.div 
                                        key={activity.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group p-8 flex items-start gap-8 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        {/* TIME COLUMN */}
                                        <div className="w-24 shrink-0 flex flex-col pt-1">
                                            <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase">
                                                {format(new Date(activity.createdAt), 'HH:mm')}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {format(new Date(activity.createdAt), 'dd MMM yyyy')}
                                            </span>
                                        </div>

                                        {/* INDICATOR */}
                                        <div className="relative pt-2">
                                            <div className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30 shrink-0 z-10 relative" />
                                            {index !== activities.length - 1 && (
                                                <div className="absolute top-5 left-[5.5px] w-px h-24 bg-slate-100 dark:bg-white/10" />
                                            )}
                                        </div>

                                        {/* CONTENT */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md">
                                                    {activity.action || 'EVENT'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <User className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-tight">
                                                        {activity.admin?.name || activity.user?.name || 'System Auto'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {activity.details || 'System operation executed successfully without additional parameters.'}
                                            </p>
                                        </div>

                                        {/* STATUS */}
                                        <div className="shrink-0 flex items-center pt-1 group-hover:translate-x-1 transition-transform">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-24 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-200">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Idle Stream</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No activity recorded in this cycle</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* FOOTER AUDIT NOTE */}
            <div className="flex items-center justify-center gap-3 py-6 border-t border-slate-50 dark:border-white/5 grayscale opacity-50">
                <Shield className="w-4 h-4 text-slate-400" />
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">
                    System History Secure & Verified
                </p>
            </div>

        </div>
    )
}
