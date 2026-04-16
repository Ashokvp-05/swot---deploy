"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Briefcase, Heart, Activity, Search, AlertCircle, CheckCircle2, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"
import { toast } from "sonner"

export default function GovernanceHub({ token }: { token: string }) {
    const [projects, setProjects] = useState<any[]>([])
    const [stats, setStats] = useState({ activeTickets: 0, avgWellness: 0, engagementScore: 0 })

    useEffect(() => {
        const fetchGovData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/enterprise/projects`, { headers: { Authorization: `Bearer ${token}` } })
                const data = await res.json()
                setProjects(data)
                // Set simulated enterprise stats
                setStats({ activeTickets: 12, avgWellness: 88, engagementScore: 92 })
            } catch (e) { toast.error("Governance telemetry offline") }
        }
        fetchGovData()
    }, [token])

    return (
        <div className="space-y-10">
            {/* GOVERNANCE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Active Project Nodes", value: projects.length, icon: Briefcase, color: "text-indigo-500" },
                    { label: "Cultural Stability Index", value: `${stats.avgWellness}%`, icon: Heart, color: "text-rose-500" },
                    { label: "Tactical Ticket Load", value: stats.activeTickets, icon: AlertCircle, color: "text-amber-500" }
                ].map((m, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:ring-2 hover:ring-indigo-500/20 transition-all">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{m.value}</h4>
                                </div>
                                <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-black/20 ${m.color}`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* PROJECT GRID */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white">Project <span className="text-indigo-600">Oversight</span></h3>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                        <Plus className="w-4 h-4" /> Initialize Protocol
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((proj) => (
                        <div key={proj.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <Badge variant="outline" className="h-6 px-3 rounded-lg text-[8px] font-black border-indigo-500/20 text-indigo-500 uppercase tracking-widest mb-3">Enterprise Cluster</Badge>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{proj.name}</h4>
                                </div>
                                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-black uppercase text-[8px] px-3">{proj.status}</Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Resource Distribution</span>
                                    <span>{proj.tasks?.length || 0} Sub-nodes</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[65%]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
