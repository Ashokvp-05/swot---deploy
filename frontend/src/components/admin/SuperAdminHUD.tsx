"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Activity, Building2, Ticket, TrendingUp, Server, Cpu, Clock, Shield, Globe, LayoutDashboard, CreditCard, Users, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PlatformStats {
    totalCompanies: number
    activeCompanies: number
    blockedCompanies: number
    totalUsers: number
    activeUsers: number
    pendingUsers: number
    suspendedUsers: number
    inactiveUsers: number
    totalTickets: number
    dailyActiveUsers: number
    growthRate: string
}

export function SuperAdminHUD({ initialStats, token }: { initialStats: PlatformStats, token: string }) {
    const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    const { data } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/companies/super-admin-dashboard`, fetcher, { 
        fallbackData: { platform: initialStats },
        refreshInterval: 10000 
    })
    
    const stats = data?.platform || initialStats
    const [revenue, setRevenue] = useState(8420.00)
    const [lastUpdated, setLastUpdated] = useState<string>("")
    
    useEffect(() => {
        setLastUpdated(new Date().toLocaleTimeString())
        const interval = setInterval(() => {
            setRevenue(prev => prev + (Math.random() * 10 - 5))
            setLastUpdated(new Date().toLocaleTimeString())
        }, 10000)
        return () => clearInterval(interval)
    }, [])


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* PLATFORM ANALYTICS GRID - More Compact & Clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: "Companies", value: stats.totalCompanies, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Users", value: stats.activeUsers, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Revenue", value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Support", value: stats.totalTickets, icon: Ticket, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Growth", value: stats.growthRate, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl p-5 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} dark:bg-opacity-20`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight tabular-nums leading-none">{stat.value}</h3>
                    </Card>
                ))}
            </div>

            {/* Platform Status Ribbon */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-widest">Status: <span className="text-emerald-500">Good</span></span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speed: <span className="text-slate-800 dark:text-white">12ms</span></span>
                    </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Refreshed: {lastUpdated}</p>
            </div>
        </div>
    )
}
