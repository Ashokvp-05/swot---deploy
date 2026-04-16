"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageSquare, Zap, BarChart3, CheckCircle2, Loader2, Send, Smile, Frown, Meh, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/config"
import { toast } from "sonner"

export default function CulturePulse({ token }: { token: string }) {
    const [polls, setPolls] = useState<any[]>([])
    const [mood, setMood] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/enterprise/polls/active`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            setPolls(Array.isArray(data) ? data : [])
        } catch (e) {
            toast.error("Cultural telemetry link severed")
            setPolls([])
        }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [token])

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/enterprise/polls/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pollId, optionId })
            })
            if (res.ok) {
                toast.success("Cultural alignment synchronized")
                fetchData()
            }
        } catch (e) { toast.error("Signal rejection") }
    }

    const MoodButton = ({ type, icon: Icon, color }: any) => (
        <button
            onClick={() => setMood(type)}
            className={`p-4 rounded-xl border transition-all flex items-center gap-3 group px-6 ${mood === type ? `bg-primary border-primary text-white shadow-md` :
                `bg-card border-border/40 text-muted-foreground hover:border-primary/40`
                }`}
        >
            <Icon className={`w-4 h-4 ${mood === type ? "scale-110" : "group-hover:scale-105"} transition-transform font-bold`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{type}</span>
        </button>
    )

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Personnel <span className="text-rose-500">Insights</span></h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Real-time organizational feedback & engagement</p>
                </div>
            </div>

            {/* ATMOSPHERE CHECK-IN */}
            <Card className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center italic">Personal Atmosphere Check-in</h4>
                <div className="flex flex-wrap justify-center gap-4">
                    <MoodButton type="Exstatic" icon={Trophy} color="rose" />
                    <MoodButton type="Optimal" icon={Smile} color="indigo" />
                    <MoodButton type="Stable" icon={Meh} color="emerald" />
                    <MoodButton type="Dephased" icon={Frown} color="amber" />
                </div>
            </Card>

            {/* ACTIVE POLLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(polls) && polls.length === 0 ? (
                    <div className="md:col-span-2 py-16 text-center bg-accent/50 rounded-2xl border border-dashed border-border/40">
                        <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">No active feedback requests</p>
                    </div>
                ) : Array.isArray(polls) && polls.map((poll) => (
                    <motion.div key={poll.id} layout className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm space-y-6">
                        <div>
                            <Badge variant="secondary" className="h-6 px-3 rounded-md text-[8px] font-bold bg-rose-500/5 text-rose-500 border-rose-500/10 uppercase mb-4 tracking-widest italic">Survey Active</Badge>
                            <h4 className="text-lg font-bold text-foreground tracking-tight">{poll.title}</h4>
                            <p className="text-xs font-medium text-muted-foreground mt-2">{poll.question}</p>
                        </div>

                        <div className="space-y-3">
                            {poll.options.map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleVote(poll.id, opt.id)}
                                    className="w-full p-4 rounded-xl border border-border/30 hover:border-primary/40 bg-accent/30 group transition-all flex justify-between items-center"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary">{opt.text}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(opt._count.responses / 10) * 100}%` }} className="h-full bg-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold text-primary">{opt._count.responses}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
