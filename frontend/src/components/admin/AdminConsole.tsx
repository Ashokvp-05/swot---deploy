"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Activity, Users, CalendarRange,
    FileText, ShieldCheck, Timer,
    ArrowRight, Clock, ShieldAlert,
    Laptop, MapPin, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminConsole({ role, token, overview, pendingUsers = [], pendingLeaves = [] }: any) {
    return (
        <div className="bg-card dark:bg-card border border-border rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-sm dark:shadow-none h-full flex flex-col relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />

            <Tabs defaultValue="activity" className="flex-1 flex flex-col overflow-hidden">
                <div className="p-10 pb-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">Operations Pulse</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time Workforce Dynamics</p>
                        </div>
                    </div>

                    <TabsList className="bg-slate-100 dark:bg-slate-950 p-1 h-12 rounded-2xl border border-border">
                        <TabsTrigger value="activity" className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Live Activity</TabsTrigger>
                        <TabsTrigger value="remote" className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Active Personnel</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-10 mt-1">
                    <TabsContent value="activity" className="m-0 space-y-6">
                        {overview.recentActivity && overview.recentActivity.length > 0 ? (
                            overview.recentActivity.map((log: any, idx: number) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 bg-background/50 border border-border rounded-[28px] flex items-center justify-between group/log hover:border-indigo-500/20 transition-all cursor-default"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-border group-hover/log:scale-110 transition-transform">
                                            <Zap className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wide leading-none group-hover/log:text-indigo-600 dark:group-hover/log:text-indigo-400 transition-colors uppercase">{log.action}</p>
                                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Admin System</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                <span suppressHydrationWarning>{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-bold uppercase border-border group-hover/log:border-indigo-500/30 transition-all opacity-70">Identity Linked</Badge>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-slate-700">
                                <ShieldCheck className="w-12 h-12 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting live protocols...</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="remote" className="m-0 space-y-6">
                        {overview.remoteUsers && overview.remoteUsers.length > 0 ? (
                            overview.remoteUsers.map((user: any, idx: number) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 bg-slate-900/40 border border-white/5 rounded-[32px] flex items-center justify-between group/user hover:border-indigo-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative h-14 w-14 group-hover/user:scale-110 transition-transform">
                                            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-pulse" />
                                            <div className="relative h-full w-full rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-xl italic uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-sm uppercase tracking-wider group-hover/user:text-indigo-400 transition-colors uppercase">{user.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1.5">
                                                    {user.status === 'REMOTE' ? <Laptop className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-indigo-400" />}
                                                    <span className={`text-[9px] font-black ${user.status === 'REMOTE' ? 'text-emerald-400' : 'text-indigo-400'} uppercase tracking-widest`}>{user.status}</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">{user.location || "Office HQ"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white italic tracking-tighter uppercase mb-0.5">Clocked-In</p>
                                        <p suppressHydrationWarning className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(user.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-slate-700">
                                <Users className="w-12 h-12 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No active personnel detected</p>
                            </div>
                        )}
                    </TabsContent>
                </div>

                <div className="p-10 pt-4 border-t border-white/5 bg-slate-950/40">
                    <Button variant="ghost" className="w-full h-14 rounded-[20px] text-[10px] font-black uppercase border border-white/5 hover:bg-white/5 hover:text-white transition-all gap-3 tracking-widest">
                        Expand Strategic Audit Center
                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </Tabs>
        </div>
    )
}
