"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
    Calendar, Users, Loader2, Download, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday } from "date-fns"

export default function AttendanceControlCenter({ token }: { token: string }) {
    const [loading, setLoading] = useState(true)
    const [overview, setOverview] = useState<any>(null)
    const [liveSessions, setLiveSessions] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [logDeptFilter, setLogDeptFilter] = useState("ALL")
    const [calendarMonth, setCalendarMonth] = useState(new Date())

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const headers = { "Authorization": `Bearer ${token}` }
            const [overviewRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/overview`, { headers }),
                fetch(`${API_BASE_URL}/users?limit=ALL`, { headers })
            ])
            if (overviewRes.ok) {
                const o = await overviewRes.json()
                setOverview(o)
                setLiveSessions(o.liveSessions || [])
            }
            if (usersRes.ok) {
                const ud = await usersRes.json()
                setAllUsers(Array.isArray(ud) ? ud : (ud?.users || []))
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [token])

    useEffect(() => {
        fetchData()
        const iv = setInterval(() => fetchData(true), 15000)
        return () => clearInterval(iv)
    }, [fetchData])

    const handleExport = async () => {
        try {
            const now = new Date()
            const startStr = format(startOfDay(now), "yyyy-MM-dd")
            const endStr = format(endOfDay(now), "yyyy-MM-dd")
            const res = await fetch(`${API_BASE_URL}/reports/export/excel?start=${startStr}&end=${endStr}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `Daily_Attendance_${startStr}.xlsx`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success("Report downloaded")
            } else { toast.error("Failed to generate report") }
        } catch { toast.error("Export failed") }
    }

    // Data
    const sessionMap = new Map(liveSessions.map((s: any) => [s.id, s]))
    const departments = Array.from(new Set(allUsers.map((u: any) => u.department?.name).filter(Boolean)))
    const activeUsers = allUsers.filter((u: any) => u.status === 'ACTIVE')
    const attendanceRows = activeUsers
        .map((u: any) => {
            const session = sessionMap.get(u.id)
            let status: 'Present' | 'Absent' | 'On Leave' = 'Absent'
            if (session || u.isLive) status = 'Present'
            return { ...u, session, attendanceStatus: status }
        })
        .filter((u: any) => logDeptFilter === 'ALL' || u.department?.name === logDeptFilter)

    const totalStaff = overview?.totalActiveUsers ?? activeUsers.length
    const checkedIn = overview?.clockedIn ?? 0
    const absent = Math.max(0, totalStaff - checkedIn)
    const onLeave = overview?.pendingApprovals ?? 0

    // Calendar
    const calStart = startOfWeek(startOfMonth(calendarMonth))
    const calEnd = endOfWeek(endOfMonth(calendarMonth))
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

    const AVATAR_COLORS: Record<string, string> = {
        A: '#6366f1', B: '#10b981', C: '#f43f5e', D: '#f59e0b', E: '#8b5cf6',
        F: '#06b6d4', G: '#ec4899', H: '#14b8a6', I: '#f97316', J: '#3b82f6',
        K: '#ef4444', L: '#84cc16', M: '#d946ef', N: '#0ea5e9', O: '#eab308',
        P: '#a855f7', Q: '#22c55e', R: '#fb7185', S: '#818cf8', T: '#34d399',
        U: '#fbbf24', V: '#a78bfa', W: '#22d3ee', X: '#f472b6', Y: '#2dd4bf',
        Z: '#fb923c',
    }
    const getColor = (name: string) => AVATAR_COLORS[name?.[0]?.toUpperCase()] || '#94a3b8'

    return (
        <div>
            {/* ── Stat Cards ── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {[
                    { label: "TOTAL STAFF", value: totalStaff, color: "#1e293b" },
                    { label: "CHECKED IN", value: checkedIn, color: "#16a34a" },
                    { label: "ABSENT", value: absent, color: "#ef4444" },
                    { label: "ON LEAVE", value: onLeave, color: "#4f46e5" },
                ].map((stat, i) => (
                    <div key={i} style={{
                        flex: 1, background: '#fff', border: '1px solid #e2e8f0',
                        borderRadius: 12, padding: '20px 24px'
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>{stat.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                
                {/* Left: Daily Attendance Log */}
                <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Log Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Daily Attendance Log</h2>
                        <Button onClick={handleExport} variant="outline" size="sm" style={{ fontSize: 12, gap: 6, borderRadius: 8, borderColor: '#e2e8f0', height: 36 }}>
                            <Download style={{ width: 14, height: 14 }} /> Export
                        </Button>
                    </div>

                    {/* Filters */}
                    <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '6px 12px', border: '1px solid #f1f5f9' }}>
                            <Calendar style={{ width: 14, height: 14 }} />
                            Today — {format(new Date(), 'MMMM d, yyyy')}
                        </div>
                        <select value={logDeptFilter} onChange={e => setLogDeptFilter(e.target.value)} style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 12px', outline: 'none', cursor: 'pointer' }}>
                            <option value="ALL">All Departments ▾</option>
                            {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                                <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Employee</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Check In</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Check Out</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hours</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60 }}><Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', margin: '0 auto' }} /></td></tr>
                            ) : attendanceRows.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>No employees found</td></tr>
                            ) : attendanceRows.map((user: any, idx: number) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: getColor(user.name),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0
                                            }}>
                                                {user.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{user.name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{user.department?.name || user.designation?.name || user.email?.split('@')[0]}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: 14, color: '#475569' }}>
                                        {user.session?.clockIn ? format(new Date(user.session.clockIn), 'hh:mm a') : '—'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: 14, color: '#94a3b8' }}>—</td>
                                    <td style={{ padding: '16px', fontSize: 14, color: '#94a3b8' }}>—</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            fontSize: 12, fontWeight: 600,
                                            padding: '4px 14px', borderRadius: 20,
                                            ...(user.attendanceStatus === 'Present' ? { background: '#dcfce7', color: '#16a34a' } :
                                                user.attendanceStatus === 'On Leave' ? { background: '#fef3c7', color: '#d97706' } :
                                                { background: '#fee2e2', color: '#ef4444' })
                                        }}>
                                            {user.attendanceStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right: Calendar */}
                <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                    {/* Calendar Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            {format(calendarMonth, 'MMMM yyyy')}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <ChevronLeft style={{ width: 16, height: 16 }} />
                            </button>
                            <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <ChevronRight style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '6px 0' }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {calDays.map((day, i) => {
                            const inMonth = isSameMonth(day, calendarMonth)
                            const todayDay = isToday(day)
                            const hasEvent = inMonth && [2, 9, 18].includes(day.getDate())
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0' }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: todayDay ? 700 : 400,
                                        color: !inMonth ? '#e2e8f0' : todayDay ? '#fff' : '#475569',
                                        background: todayDay ? '#4f46e5' : 'transparent',
                                        cursor: inMonth ? 'pointer' : 'default'
                                    }}>
                                        {day.getDate()}
                                    </div>
                                    {hasEvent && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f43f5e', marginTop: 2 }} />}
                                </div>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }} />
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Events</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5' }} />
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
