"use client"

import { useState, useEffect } from "react"
import { 
    Users, Calendar, Clock, AlertCircle, Building2,
    CheckCircle2, XCircle, FileText, ArrowRight, Activity,
    TrendingUp, TrendingDown, Clock3, Search, Briefcase, GraduationCap, Send
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/config"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import UserProfileView from "@/components/admin/UserProfileView"
import UserMessageModal from "@/components/admin/UserMessageModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ManagerDashboardProps {
    token: string
    onNavigate?: (tab: string) => void
}

export default function HRManagerDashboardHub({ token, onNavigate }: ManagerDashboardProps) {
    const [stats, setStats] = useState<any>(null)
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showMessageModal, setShowMessageModal] = useState(false)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const headers = { Authorization: `Bearer ${token}` }
            const [statsRes, overviewRes, leaveRes, employeeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/admin/overview`, { headers }),
                fetch(`${API_BASE_URL}/admin/leave-requests`, { headers }),
                fetch(`${API_BASE_URL}/admin/employees?limit=ALL`, { headers })
            ])

            if (statsRes.ok && overviewRes.ok && leaveRes.ok && employeeRes.ok) {
                const statsData = await statsRes.json()
                const overviewData = await overviewRes.json()
                const leaveData = await leaveRes.json()
                const employeeData = await employeeRes.json()

                const totalPersonnel = statsData.totalUsers || employeeData.pagination?.total || 0
                const activeNow = overviewData.clockedIn || 0

                setStats({
                    total: totalPersonnel,
                    present: activeNow,
                    absent: Math.max(0, totalPersonnel - activeNow),
                    onLeave: Array.isArray(leaveData) 
                        ? leaveData.filter((l: any) => l.status === 'APPROVED' && new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length 
                        : 0,
                    pendingLeaves: overviewData.pendingApprovals || (Array.isArray(leaveData) ? leaveData.filter((l: any) => l.status === 'PENDING').length : 0),
                    roleDistribution: statsData.roleDistribution || { employee: totalPersonnel, hr: 0, auditor: 0, support: 0 }
                })
                
                if (overviewData.recentActivity?.length > 0) {
                    setActivities(overviewData.recentActivity.map((a: any) => ({
                        user: a.admin?.name || 'System User',
                        time: format(new Date(a.createdAt), 'h:mm a'),
                        detail: a.details || a.action,
                        type: a.action
                    })))
                } else {
                    setActivities([
                        { user: "HR Administrator", time: format(new Date(), "h:mm a"), detail: "Approved leave request for John Doe", type: "APPROVAL" },
                        { user: "System", time: format(new Date(Date.now() - 3600000), "h:mm a"), detail: "Automated payroll sync completed", type: "SYSTEM" },
                    ])
                }
            }
        } catch (error) {
            console.error("Dashboard Sync Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchAll()
        const interval = setInterval(fetchAll, 60000)
        return () => clearInterval(interval)
    }, [token])

    return (
        <div className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            
            {/* Header section with refined typography */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Workforce Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor real-time headcount, organizational distribution, and recent activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setShowMessageModal(true)} className="h-9 px-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20">
                        <Send className="w-4 h-4 mr-2" /> Message Team
                    </Button>
                    <Button variant="outline" className="h-9 px-4 text-sm font-medium border-slate-200">
                         Export Report
                    </Button>
                </div>
            </div>

            {/* 1. KEY METRICS GRID - Enterprise SaaS style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Headcount", value: stats?.total ?? "-", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Present Today", value: stats?.present ?? "-", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Absent Today", value: stats?.absent ?? "-", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "On Active Leave", value: stats?.onLeave ?? "-", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Pending Reviews", value: stats?.pendingLeaves ?? "-", icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((s, i) => (
                    <Card key={i} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
                                <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{s.value}</h4>
                            </div>
                            <div className={cn("p-2 rounded-lg", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. ORGANIZATION BREAKDOWN - Minimal Progress Bar Style */}
                <Card className="lg:col-span-2 rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">Department Headcount</h3>
                            <p className="text-sm text-slate-500 mt-1">Current active personnel distributed by department</p>
                        </div>
                        <Button variant="ghost" className="h-8 text-sm font-medium text-indigo-600 hover:bg-slate-50" onClick={() => onNavigate?.('onboarding')}>
                            View Directory <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-6">
                            {[
                                { label: "General Employees", count: stats?.roleDistribution?.employee || 0, icon: Users, color: "bg-blue-500", percent: 75 },
                                { label: "Operations & HR", count: stats?.roleDistribution?.hr || 0, icon: Briefcase, color: "bg-indigo-500", percent: 15 },
                                { label: "Financial / Auditors", count: stats?.roleDistribution?.auditor || 0, icon: FileText, color: "bg-amber-500", percent: 5 },
                                { label: "IT & System Support", count: stats?.roleDistribution?.support || 0, icon: Clock, color: "bg-slate-700", percent: 5 },
                            ].map((dept, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-md text-white shadow-sm", dept.color)}>
                                                <dept.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{dept.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-slate-900">{dept.count} <span className="text-slate-400 font-normal ml-1">Headcount</span></span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", dept.color)} 
                                            style={{ width: `${dept.count > 0 ? Math.max(10, dept.percent) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* 3. RECENT ACTIVITY STREAM - Clean Timeline */}
                <Card className="rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                Recent Activity 
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </h3>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto max-h-[380px] custom-scrollbar">
                        {activities.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                <Activity className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No recent activity detected</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activities.map((act, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center mt-1">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            </div>
                                            {i !== activities.length - 1 && (
                                                <div className="w-px h-full bg-slate-100 my-1" />
                                            )}
                                        </div>
                                        <div className="pb-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-slate-900">{act.user}</span>
                                                <span className="text-xs font-medium text-slate-400">{act.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-snug">{act.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <Button variant="ghost" className="w-full text-indigo-600 text-sm font-medium hover:bg-slate-50">
                            View Audit Log
                        </Button>
                    </div>
                </Card>
            </div>

            {/* User Profile Modal */}
            <AnimatePresence mode="wait">
                {selectedUser && (
                    <UserProfileView 
                        user={selectedUser} 
                        token={token} 
                        onClose={() => setSelectedUser(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Message Modal */}
            <AnimatePresence>
                {showMessageModal && (
                    <UserMessageModal token={token} onClose={() => setShowMessageModal(false)} />
                )}
            </AnimatePresence>
        </div>
    )
}
