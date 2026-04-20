"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    TrendingUp, Star, Users, CheckCircle, 
    Plus, Search, Filter, Loader2, Sparkles,
    BarChart3, Target, MessageSquare, AlertCircle,
    ChevronDown, Edit3, Send, Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"

interface PerformanceReview {
    id: string
    userId: string
    user: { name: string; email: string, designation?: { name: string } }
    reviewer: { name: string }
    reviewCycle: string
    overallRating: number
    status: 'DRAFT' | 'SUBMITTED' | 'FINALIZED'
    comments: string
    ratings: any[]
}

interface KPI {
    id: string
    name: string
    description: string
    weight: number
}

export default function PerformanceHub({ token }: { token: string }) {
    const [loading, setLoading] = useState(true)
    const [reviews, setReviews] = useState<PerformanceReview[]>([])
    const [kpis, setKpis] = useState<KPI[]>([])
    const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'kpis'>('pipeline')
    const [isSaving, setIsSaving] = useState(false)

    const h = { Authorization: `Bearer ${token}` }

    const fetchPerformance = async () => {
        setLoading(true)
        try {
            const [revRes, kpiRes] = await Promise.all([
                fetch(`${API_BASE_URL}/performance/all`, { headers: h }),
                fetch(`${API_BASE_URL}/performance/kpis`, { headers: h })
            ])
            if (revRes.ok) setReviews(await revRes.json())
            if (kpiRes.ok) setKpis(await kpiRes.json())
        } catch { toast.error("Performance node sync failure") }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchPerformance() }, [token])

    const handleFinalize = async (id: string, hrComments?: string) => {
        setIsSaving(true)
        try {
            const res = await fetch(`${API_BASE_URL}/performance/review/${id}/status`, {
                method: "PATCH",
                headers: { ...h, "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'FINALIZED', hrComments })
            })
            if (res.ok) {
                toast.success("Review Finalized & Locked")
                fetchPerformance()
            } else {
                const d = await res.json()
                toast.error(d.error || "Finalization failed")
            }
        } catch { toast.error("Network instability") }
        finally { setIsSaving(false) }
    }

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <Card className="border-none bg-white shadow-sm rounded-3xl overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── METRICS ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={Target} label="Active KPIs" value={kpis.length} color="bg-indigo-50 text-indigo-600" />
                <StatCard icon={Users} label="Team Reviews" value={reviews.length} color="bg-rose-50 text-rose-600" />
                <StatCard icon={Star} label="Avg Rating" value={(reviews.reduce((acc, r) => acc + r.overallRating, 0) / (reviews.length || 1)).toFixed(1)} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={CheckCircle} label="Finalized" value={reviews.filter(r => r.status === 'FINALIZED').length} color="bg-amber-50 text-amber-600" />
            </div>

            {/* ── INTERFACE ── */}
            <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            Performance Control 
                            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> System Intelligence & KPI Calibration
                        </CardDescription>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                        <button 
                            onClick={() => setActiveSubTab('pipeline')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeSubTab === 'pipeline' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            )}
                        >Review Pipeline</button>
                        <button 
                            onClick={() => setActiveSubTab('kpis')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeSubTab === 'kpis' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            )}
                        >KPI Definitions</button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                        {activeSubTab === 'pipeline' ? (
                            <motion.div 
                                key="pipeline"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="p-0"
                            >
                                <div className="divide-y divide-slate-50">
                                    {loading ? (
                                        <div className="p-32 flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compiling Appraisals...</p>
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="p-32 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <AlertCircle className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">No active reviews found in cycle</p>
                                        </div>
                                    ) : reviews.map((r) => (
                                        <div key={r.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600">
                                                        {r.user.name[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900">{r.user.name}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{r.user.designation?.name || 'Personnel'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right mr-4">
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Review Cycle</p>
                                                        <p className="text-xs font-black text-slate-700">{r.reviewCycle}</p>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-none",
                                                        r.status === 'FINALIZED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {r.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                                                <div className="lg:col-span-8 flex gap-8">
                                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex-1">
                                                        <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-3 flex items-center gap-2">
                                                            <Star className="w-3 h-3" /> Evaluation Output
                                                        </p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-slate-900">{r.overallRating.toFixed(1)}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">/ 5.0 Precision Score</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex-[2]">
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                                            <MessageSquare className="w-3 h-3" /> Form Comments
                                                        </p>
                                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">&quot;{r.comments || 'No qualitative data provided.'}&quot;</p>
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-4 flex justify-end gap-3">
                                                    <Button variant="outline" className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest px-6 text-slate-600 border-slate-100 italic">View Detailed Log</Button>
                                                    {r.status === 'SUBMITTED' && (
                                                        <Button 
                                                            disabled={isSaving}
                                                            onClick={() => handleFinalize(r.id)}
                                                            className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-indigo-600/20"
                                                        >
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize & Sign"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="kpis"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="p-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {kpis.map((k) => (
                                        <Card key={k.id} className="border border-slate-100 bg-slate-50/30 rounded-3xl shadow-none overflow-hidden group hover:border-indigo-200 transition-colors">
                                            <CardHeader className="pb-4">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <CardTitle className="text-sm font-black text-slate-900 tracking-tight">{k.name}</CardTitle>
                                                <CardDescription className="text-xs font-medium text-slate-500 leading-relaxed mt-2">{k.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Weighting</span>
                                                    <Badge className="bg-indigo-50 text-indigo-600 border-none shadow-none text-[10px] font-black">{k.weight}%</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <button className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group hover:border-indigo-300 hover:bg-slate-50 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-indigo-600">Define New KPI</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* ── FOOTER INTEL ── */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-6">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><Trophy className="w-3 h-3 text-amber-500" /> Top Performer: Sarah J. (4.9)</span>
                    <span className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-rose-500" /> Needs Attention: 2 Members</span>
                </div>
                <span>Cycle: Q4 ALPHA TRANSMISSION</span>
            </div>
        </div>
    )
}
