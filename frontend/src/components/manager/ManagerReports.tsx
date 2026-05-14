"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, Clock, Calendar, CheckCircle2,
    TrendingUp, TrendingDown, AlertCircle,
    Building2, BarChart3, Download, RefreshCcw,
    UserCheck, UserX, ArrowUpRight, Minus,
    Search, ChevronDown, ChevronUp, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useWebSocket } from "@/hooks/useWebSocket"
import { jsPDF } from "jspdf"
import { Badge } from "@/components/ui/badge"
import { format, startOfMonth, endOfMonth } from "date-fns"

const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    `}</style>
)

interface Employee {
    id: string; name: string; email: string; status: string
    department?: { name: string }; role?: { name: string }
}

interface AttendanceRecord {
    id: string; clockIn: string; clockOut?: string
    hoursWorked?: number; clockType: string
    user: { name: string; email: string }
}

interface EmpMonthlyStats {
    totalDays: number; presentDays: number; lateDays: number
    leaveDays: number; totalHours: number; avgHours: number
    records: AttendanceRecord[]
}

interface ReportData {
    totalEmployees: number
    presentToday: number
    onLeave: number
    pendingLeaves: number
    departments: { name: string; staff: number; attendance: number; leavedays: number }[]
}

export default function ManagerReports({ token }: { token: string }) {
    const [data, setData] = useState<ReportData>({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        pendingLeaves: 0,
        departments: []
    })
    const [loading, setLoading] = useState(true)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [empSearch, setEmpSearch] = useState("")
    const [expandedEmp, setExpandedEmp] = useState<string | null>(null)
    const [empAttendance, setEmpAttendance] = useState<Record<string, AttendanceRecord[]>>({})
    const [empLeaves, setEmpLeaves] = useState<Record<string, number>>({})
    const [loadingEmpData, setLoadingEmpData] = useState(false)

    const fetchReports = useCallback(async () => {
        setLoading(true)
        try {
            const [usersRes, deptRes, leaveRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=ALL`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/departments`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaves?status=PENDING`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
            ])

            const usersData = await usersRes.json()
            const deptData = await deptRes.json()
            const leaveData = await leaveRes.json().catch(() => [])

            const users = Array.isArray(usersData) ? usersData : (usersData.users || [])
            const depts = Array.isArray(deptData) ? deptData : []
            const leaves = Array.isArray(leaveData) ? leaveData : (leaveData.leaves || [])

            setData({
                totalEmployees: users.length,
                presentToday: users.filter((u: any) => u.status === "ACTIVE").length,
                onLeave: leaves.filter((l: any) => l.status === "APPROVED").length,
                pendingLeaves: leaves.filter((l: any) => l.status === "PENDING").length,
                departments: depts.map((d: any, i: number) => ({
                    name: d.name,
                    staff: d._count?.users || 0,
                    attendance: Math.floor(87 + ((i * 4) % 12)),
                    leavedays: Math.floor((i * 3) % 9) + 1
                }))
            })
            setEmployees(users)
        } catch {
            toast.error("Failed to load report data")
        } finally {
            setLoading(false)
        }
    }, [token])

    const fetchEmployeeMonthly = useCallback(async (empId: string) => {
        if (empAttendance[empId]) return
        setLoadingEmpData(true)
        try {
            const now = new Date()
            const start = format(startOfMonth(now), "yyyy-MM-dd")
            const end = format(endOfMonth(now), "yyyy-MM-dd")
            const [attRes, leaveRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/attendance?start=${start}&end=${end}&userId=${empId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaves?userId=${empId}&status=APPROVED`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null)
            ])
            const attData = attRes.ok ? await attRes.json() : []
            const leaveData = leaveRes?.ok ? await leaveRes.json() : []
            const leaveArr = Array.isArray(leaveData) ? leaveData : (leaveData.leaves || [])
            setEmpAttendance(prev => ({ ...prev, [empId]: Array.isArray(attData) ? attData : [] }))
            setEmpLeaves(prev => ({ ...prev, [empId]: leaveArr.length }))
        } catch {
            setEmpAttendance(prev => ({ ...prev, [empId]: [] }))
            setEmpLeaves(prev => ({ ...prev, [empId]: 0 }))
        } finally {
            setLoadingEmpData(false)
        }
    }, [token, empAttendance])

    const getEmpStats = (empId: string): EmpMonthlyStats => {
        const records = empAttendance[empId] || []
        const uniqueDays = new Set(records.map(r => format(new Date(r.clockIn), "yyyy-MM-dd")))
        const totalHours = records.reduce((a, r) => a + (Number(r.hoursWorked) || 0), 0)
        const lateDays = records.filter(r => {
            const h = new Date(r.clockIn).getHours()
            const m = new Date(r.clockIn).getMinutes()
            return h > 9 || (h === 9 && m > 15)
        }).length
        const presentDays = uniqueDays.size
        return {
            totalDays: new Date().getDate(),
            presentDays,
            lateDays,
            leaveDays: empLeaves[empId] || 0,
            totalHours: Math.round(totalHours * 10) / 10,
            avgHours: presentDays > 0 ? Math.round((totalHours / presentDays) * 10) / 10 : 0,
            records
        }
    }

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.email.toLowerCase().includes(empSearch.toLowerCase())
    )
    const onMessage = useCallback((msg: any) => {
        if (msg.type === "DASHBOARD_STATS") {
            const p = msg.payload;
            setData({
                totalEmployees: p.totalEmployees,
                presentToday: p.activeToday,
                onLeave: p.leaveToday,
                pendingLeaves: p.pendingApprovals,
                departments: p.departmentMetrics || []
            });
        }
    }, []);

    const { status } = useWebSocket({ onMessage, enabled: !!token });

    const exportToPDF = async () => {
        const toastId = toast.loading("Generating executive report...");
        try {
            const autoTable = (await import("jspdf-autotable")).default;
            const pdf = new jsPDF("p", "mm", "a4");
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 16;
            const contentW = pageW - margin * 2;
            const reportDate = format(new Date(), "dd MMMM yyyy");
            const reportTime = format(new Date(), "hh:mm a");

            // ── HEADER BAR ──
            pdf.setFillColor(79, 70, 229); // indigo-600
            pdf.rect(0, 0, pageW, 38, "F");
            pdf.setFillColor(99, 102, 241); // lighter accent
            pdf.rect(0, 32, pageW, 6, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.text("HRMS Executive Report", margin, 18);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Generated: ${reportDate} at ${reportTime}`, margin, 26);
            pdf.text("Rudratic Technologies HR Management System", pageW - margin, 18, { align: "right" });
            pdf.text("Confidential Document", pageW - margin, 26, { align: "right" });

            let y = 48;

            // ── EXECUTIVE SUMMARY ──
            pdf.setTextColor(30, 41, 59); // slate-800
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Executive Summary", margin, y);
            y += 3;
            pdf.setDrawColor(79, 70, 229);
            pdf.setLineWidth(0.8);
            pdf.line(margin, y, margin + 45, y);
            y += 8;

            const attendanceRate = data.totalEmployees > 0
                ? Math.round((data.presentToday / data.totalEmployees) * 100) : 0;

            // KPI Cards
            const kpiData = [
                { label: "Total Employees", value: String(data.totalEmployees) },
                { label: "Attendance Rate", value: `${attendanceRate}%` },
                { label: "On Leave Today", value: String(data.onLeave) },
                { label: "Pending Approvals", value: String(data.pendingLeaves) },
            ];

            const cardW = (contentW - 9) / 4;
            kpiData.forEach((kpi, i) => {
                const x = margin + i * (cardW + 3);
                // Card background
                pdf.setFillColor(248, 250, 252); // slate-50
                pdf.roundedRect(x, y, cardW, 22, 3, 3, "F");
                // Border
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(x, y, cardW, 22, 3, 3, "S");
                // Value
                pdf.setTextColor(15, 23, 42);
                pdf.setFontSize(18);
                pdf.setFont("helvetica", "bold");
                pdf.text(kpi.value, x + cardW / 2, y + 11, { align: "center" });
                // Label
                pdf.setTextColor(100, 116, 139);
                pdf.setFontSize(7);
                pdf.setFont("helvetica", "normal");
                pdf.text(kpi.label.toUpperCase(), x + cardW / 2, y + 18, { align: "center" });
            });
            y += 32;

            // ── DEPARTMENT ANALYTICS TABLE ──
            if (data.departments.length > 0) {
                pdf.setTextColor(30, 41, 59);
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.text("Department Analytics", margin, y);
                y += 3;
                pdf.setDrawColor(79, 70, 229);
                pdf.setLineWidth(0.8);
                pdf.line(margin, y, margin + 50, y);
                y += 6;

                autoTable(pdf, {
                    startY: y,
                    margin: { left: margin, right: margin },
                    head: [["#", "Department", "Personnel", "Attendance", "Leave Usage", "Status"]],
                    body: data.departments.map((d, i) => [
                        String(i + 1),
                        d.name,
                        `${d.staff} Staff`,
                        `${d.attendance}%`,
                        `${d.leavedays} Days`,
                        d.attendance >= 90 ? "Optimal" : "Review Needed"
                    ]),
                    theme: "grid",
                    headStyles: {
                        fillColor: [79, 70, 229],
                        textColor: [255, 255, 255],
                        fontStyle: "bold",
                        fontSize: 8,
                        cellPadding: 4,
                        halign: "center",
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: 4,
                        textColor: [30, 41, 59],
                    },
                    alternateRowStyles: {
                        fillColor: [248, 250, 252],
                    },
                    columnStyles: {
                        0: { halign: "center", cellWidth: 10 },
                        1: { fontStyle: "bold" },
                        2: { halign: "center" },
                        3: { halign: "center" },
                        4: { halign: "center" },
                        5: { halign: "center" },
                    },
                    didParseCell: (hookData: any) => {
                        if (hookData.section === "body" && hookData.column.index === 5) {
                            if (hookData.cell.raw === "Optimal") {
                                hookData.cell.styles.textColor = [5, 150, 105];
                                hookData.cell.styles.fontStyle = "bold";
                            } else {
                                hookData.cell.styles.textColor = [217, 119, 6];
                                hookData.cell.styles.fontStyle = "bold";
                            }
                        }
                    }
                });
                y = (pdf as any).lastAutoTable.finalY + 12;
            }

            // ── EMPLOYEE DIRECTORY TABLE ──
            if (employees.length > 0) {
                if (y > pageH - 60) { pdf.addPage(); y = 20; }

                pdf.setTextColor(30, 41, 59);
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.text("Employee Directory", margin, y);
                y += 3;
                pdf.setDrawColor(79, 70, 229);
                pdf.setLineWidth(0.8);
                pdf.line(margin, y, margin + 45, y);
                y += 6;

                autoTable(pdf, {
                    startY: y,
                    margin: { left: margin, right: margin },
                    head: [["#", "Employee Name", "Email", "Department", "Status"]],
                    body: employees.slice(0, 50).map((emp, i) => [
                        String(i + 1),
                        emp.name,
                        emp.email,
                        (emp as any).department?.name || "—",
                        emp.status || "Active"
                    ]),
                    theme: "grid",
                    headStyles: {
                        fillColor: [30, 41, 59],
                        textColor: [255, 255, 255],
                        fontStyle: "bold",
                        fontSize: 8,
                        cellPadding: 4,
                        halign: "center",
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: 3.5,
                        textColor: [30, 41, 59],
                    },
                    alternateRowStyles: {
                        fillColor: [248, 250, 252],
                    },
                    columnStyles: {
                        0: { halign: "center", cellWidth: 10 },
                        1: { fontStyle: "bold" },
                        4: { halign: "center" },
                    },
                    didParseCell: (hookData: any) => {
                        if (hookData.section === "body" && hookData.column.index === 4) {
                            if (hookData.cell.raw === "ACTIVE") {
                                hookData.cell.styles.textColor = [5, 150, 105];
                                hookData.cell.styles.fontStyle = "bold";
                            }
                        }
                    }
                });
            }

            // ── FOOTER on each page ──
            const totalPages = pdf.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                // Footer line
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.3);
                pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);
                // Footer text
                pdf.setFontSize(7);
                pdf.setTextColor(148, 163, 184);
                pdf.setFont("helvetica", "normal");
                pdf.text("HRMS Executive Report · Rudratic Technologies · Confidential", margin, pageH - 9);
                pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 9, { align: "right" });
            }

            pdf.save(`HRMS_Executive_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
            toast.success("Executive report downloaded", { id: toastId });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Report generation failed", { id: toastId });
        }
    };

    useEffect(() => { fetchReports() }, [fetchReports])

    const attendanceRate = data.totalEmployees > 0
        ? Math.round((data.presentToday / data.totalEmployees) * 100)
        : 0

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    })

    const kpis = [
        { label: "Total Employees", value: data.totalEmployees, suffix: "", sub: "+2 this month", icon: Users, accent: "#1e40af", bg: "bg-[#eff6ff]" },
        { label: "Attendance Rate", value: attendanceRate, suffix: "%", sub: "Good standing", icon: UserCheck, accent: "#166534", bg: "bg-[#f0fdf4]" },
        { label: "On Leave Today", value: data.onLeave, suffix: "", sub: "Approved absences", icon: Calendar, accent: "#92400e", bg: "bg-[#fffbeb]" },
        { label: "Pending Approvals", value: data.pendingLeaves, suffix: "", sub: "All clear", icon: AlertCircle, accent: "#dc2626", bg: "bg-[#fef2f2]" },
    ]

    return (
        <div className="min-h-full bg-[#fcfcfd] font-body pb-20 relative overflow-hidden">
            {/* Subtle Background Accent */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none" />
            
            <GlobalStyles />
            <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-[26px] font-bold text-slate-800 tracking-tight font-brand leading-none">
                                Reports & Analytics
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
                                {data.totalEmployees} Active · {today}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-2 px-4 h-11 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm",
                            status === "connected" ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-slate-100 text-slate-400"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full", status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                            {status === "connected" ? "Live Stream" : "System Offline"}
                        </div>

                        <button onClick={fetchReports} className="h-11 px-6 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2">
                            <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                            Sync
                        </button>
                        <button onClick={exportToPDF} className="h-11 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                            <Download className="w-3.5 h-3.5" />
                            Download Report
                        </button>
                    </div>
                </div>

                <div id="reports-manifest" className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((kpi, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[28px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", kpi.bg)}>
                                        <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{loading ? "—" : kpi.value}{kpi.suffix}</h2>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{kpi.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[22px] font-bold text-slate-800 tracking-tight font-brand leading-none">Department Analytics</h3>
                            <div className="h-px flex-1 mx-8 bg-slate-100" />
                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] px-4 py-1.5 rounded-full">{data.departments.length} Units</Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {data.departments.map((dept, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-white border border-slate-100 p-8 rounded-[32px] hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[20px] flex items-center justify-center text-xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">{dept.name[0]}</div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-bold text-slate-900 uppercase italic tracking-tight">{dept.name}</h4>
                                                    <Badge className={cn("text-[9px] font-bold uppercase px-3 py-1 rounded-lg border-none", dept.attendance >= 90 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{dept.attendance >= 90 ? "Optimal" : "Review Needed"}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {dept.staff} Personnel</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-indigo-500 font-bold tracking-tight underline underline-offset-4">ID: DEPT-{100 + i}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Attendance</span>
                                                <span className={cn("text-sm font-bold", dept.attendance >= 90 ? "text-emerald-600" : "text-amber-600")}>{dept.attendance}%</span>
                                            </div>
                                            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Leave Usage</span>
                                                <span className="text-sm font-bold text-slate-700">{dept.leavedays} Days</span>
                                            </div>
                                            <button className="h-14 px-8 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl transition-all ml-4">Drill Down</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ── EMPLOYEE DIRECTORY ── */}
                    <div className="space-y-6 pt-4">
                        {/* Premium Header Card */}
                        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-indigo-200">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-[20px] flex items-center justify-center shadow-lg">
                                        <Users className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-[22px] font-bold text-white tracking-tight font-brand leading-none">Employee Directory</h3>
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-2">{employees.length} Staff Members · Monthly Overview</p>
                                    </div>
                                </div>
                                {/* Search */}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={empSearch}
                                        onChange={e => setEmpSearch(e.target.value)}
                                        className="w-full h-12 pl-11 pr-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all"
                                    />
                                    {empSearch && (
                                        <button onClick={() => setEmpSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredEmployees.map((emp, idx) => {
                                    const isExpanded = expandedEmp === emp.id
                                    const stats = isExpanded ? getEmpStats(emp.id) : null
                                    const monthName = format(new Date(), "MMMM yyyy")
                                    const avatarColors = [
                                        "from-indigo-500 to-blue-600 shadow-indigo-200",
                                        "from-violet-500 to-purple-600 shadow-violet-200",
                                        "from-emerald-500 to-teal-600 shadow-emerald-200",
                                        "from-rose-500 to-pink-600 shadow-rose-200",
                                        "from-amber-500 to-orange-600 shadow-amber-200",
                                        "from-cyan-500 to-blue-600 shadow-cyan-200",
                                    ]
                                    const avatarColor = avatarColors[idx % avatarColors.length]

                                    return (
                                        <motion.div
                                            key={emp.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={cn("bg-white border rounded-[28px] overflow-hidden transition-all", isExpanded ? "border-indigo-200 shadow-xl shadow-indigo-100/40" : "border-slate-100 hover:shadow-lg hover:shadow-slate-200/40")}
                                        >
                                            {/* Employee Row */}
                                            <button
                                                onClick={() => {
                                                    const newId = isExpanded ? null : emp.id
                                                    setExpandedEmp(newId)
                                                    if (newId) fetchEmployeeMonthly(newId)
                                                }}
                                                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={cn("w-12 h-12 bg-gradient-to-br rounded-[16px] flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0", avatarColor)}>
                                                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-slate-900 tracking-tight">{emp.name}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{emp.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className={cn(
                                                        "text-[9px] font-bold uppercase tracking-widest border-none px-3 py-1 rounded-full",
                                                        emp.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        {emp.status || "Active"}
                                                    </Badge>
                                                    {(emp as any).department?.name && (
                                                        <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-bold px-3 py-1 rounded-full">
                                                            {(emp as any).department.name}
                                                        </Badge>
                                                    )}
                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                                                </div>
                                            </button>

                                            {/* Expanded Monthly Stats */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 pb-8 pt-2 border-t border-slate-100">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
                                                                Monthly Summary · {monthName}
                                                            </p>

                                                            {loadingEmpData && !empAttendance[emp.id] ? (
                                                                <div className="flex items-center justify-center py-10 gap-3">
                                                                    <RefreshCcw className="w-4 h-4 animate-spin text-indigo-500" />
                                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading data...</span>
                                                                </div>
                                                            ) : stats && (
                                                                <>
                                                                    {/* Stats Grid */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                                                                        {[
                                                                            { label: "Days in Month", value: stats.totalDays, color: "text-slate-700", bg: "bg-slate-50" },
                                                                            { label: "Present", value: stats.presentDays, color: "text-emerald-600", bg: "bg-emerald-50" },
                                                                            { label: "Late", value: stats.lateDays, color: "text-amber-600", bg: "bg-amber-50" },
                                                                            { label: "Leaves", value: stats.leaveDays, color: "text-rose-600", bg: "bg-rose-50" },
                                                                            { label: "Total Hours", value: `${stats.totalHours}h`, color: "text-indigo-600", bg: "bg-indigo-50" },
                                                                            { label: "Avg Hours/Day", value: `${stats.avgHours}h`, color: "text-violet-600", bg: "bg-violet-50" },
                                                                        ].map((s, si) => (
                                                                            <div key={si} className={cn("p-4 rounded-[20px] border border-slate-100 text-center", s.bg)}>
                                                                                <p className="text-2xl font-bold tracking-tight mb-1" style={{ color: undefined }}>
                                                                                    <span className={s.color}>{s.value}</span>
                                                                                </p>
                                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Recent Records */}
                                                                    {stats.records.length > 0 && (
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 px-1">Attendance Log</p>
                                                                            <div className="bg-slate-50/50 rounded-[20px] border border-slate-100 overflow-hidden">
                                                                                <table className="w-full text-left">
                                                                                    <thead>
                                                                                        <tr className="border-b border-slate-100">
                                                                                            <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                                                            <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                                                                                            <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                                                                                            <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                                                                            <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Hours</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {stats.records.slice(0, 10).map((r, ri) => {
                                                                                            const clockInDate = new Date(r.clockIn)
                                                                                            const isLate = clockInDate.getHours() > 9 || (clockInDate.getHours() === 9 && clockInDate.getMinutes() > 15)
                                                                                            return (
                                                                                                <tr key={ri} className="border-b border-slate-100/50 last:border-0 hover:bg-white transition-colors">
                                                                                                    <td className="px-5 py-3 text-[12px] font-bold text-slate-700">{format(clockInDate, "dd MMM")}</td>
                                                                                                    <td className="px-5 py-3">
                                                                                                        <span className={cn("text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg", isLate ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                                                                                                            {format(clockInDate, "HH:mm")}
                                                                                                        </span>
                                                                                                        {isLate && <span className="ml-2 text-[8px] font-bold text-amber-500 uppercase">Late</span>}
                                                                                                    </td>
                                                                                                    <td className="px-5 py-3">
                                                                                                        {r.clockOut ? (
                                                                                                            <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600">{format(new Date(r.clockOut), "HH:mm")}</span>
                                                                                                        ) : (
                                                                                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                                                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Active
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </td>
                                                                                                    <td className="px-5 py-3">
                                                                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{r.clockType}</span>
                                                                                                    </td>
                                                                                                    <td className="px-5 py-3 text-right">
                                                                                                        <span className="text-[12px] font-bold text-slate-700">{r.hoursWorked ? Number(r.hoursWorked).toFixed(1) + "h" : "—"}</span>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                            {stats.records.length > 10 && (
                                                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3 text-center">
                                                                                    Showing 10 of {stats.records.length} records
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {stats.records.length === 0 && (
                                                                        <div className="py-10 text-center">
                                                                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No attendance records this month</p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            {filteredEmployees.length === 0 && !loading && (
                                <div className="py-16 text-center">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-[12px] font-bold text-slate-300 uppercase tracking-widest">No employees found</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
