"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, DollarSign, Loader2, Play, CheckCircle2, AlertCircle, FileText, ChevronRight, Lock, Unlock, Download, Send, Plus, Activity, Users, Clock, TrendingUp, ShieldCheck, Settings, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

export default function PayrollControlCenter({ token }: { token: string }) {
    const [batches, setBatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("batches")
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [statsLoading, setStatsLoading] = useState(true)

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/batches`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setBatches(data)
        } catch (e) {
            toast.error("Financial ledger sync error")
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setStats(data)
        } catch (e) { } finally { setStatsLoading(false) }
    }

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                const userData = data.data || data.users || data;
                setUsers(Array.isArray(userData) ? userData : []);
            }
        } catch (e) {
            console.error("User sync error:", e);
            setUsers([]);
        }
    }

    useEffect(() => {
        fetchBatches()
        fetchStats()
        fetchUsers()
    }, [token])

    const createBatch = async () => {
        const date = new Date()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()

        setProcessing("creating")
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/batches`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, year })
            })

            if (res.ok) {
                toast.success(`Operational Batch ${month}/${year} initialized`)
                fetchBatches()
            } else {
                const err = await res.json()
                toast.error(err.error || "Execution failed")
            }
        } catch (e) {
            toast.error("Network synchronization collision")
        } finally {
            setProcessing(null)
        }
    }

    const runCalculation = async (batchId: string) => {
        setProcessing(batchId)
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/batches/${batchId}/generate`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Temporal calculation cycle complete")
                fetchBatches()
            } else {
                toast.error("Calculation failure")
            }
        } catch (e) {
            toast.error("Simulation error")
        } finally {
            setProcessing(null)
        }
    }

    const updateStatus = async (batchId: string, status: string) => {
        setProcessing(batchId)
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/batches/${batchId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                toast.success(`Financial state: ${status}`)
                fetchBatches()
            } else {
                toast.error("Override rejected")
            }
        } catch (e) {
            toast.error("Authority verification timeout")
        } finally {
            setProcessing(null)
        }
    }

    return (
        <div className="space-y-12 font-sans px-2">
            {/* HUD HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-600 rounded-[20px] shadow-xl shadow-emerald-100 transition-transform hover:-rotate-3">
                        <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 border-none uppercase tracking-tighter italic leading-none">Fiscal Terminal</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Financial Settlement & Organizational Liquidity protocols</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px]">
                    {[
                        { id: 'batches', label: 'Batches', icon: CreditCard },
                        { id: 'salary', label: 'Salary Structures', icon: FileText },
                        { id: 'reports', label: 'Reports', icon: Activity },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === t.id ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* DASHBOARD STATS OVERLAY */}
            {!statsLoading && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Payroll Amount', value: `₹${(stats.estimatedExpenditure / 100000).toFixed(2)}L`, sub: 'Current Active Ledger', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Total Personnel Paid', value: `${stats.configuredEmployees}`, sub: `Allocated within limit: ${stats.totalEmployees}`, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Pending Payments', value: stats.missingConfig > 0 ? stats.missingConfig : 0, sub: 'Requires Generation Phase', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Total Deductions', value: `₹${((stats.estimatedExpenditure * 0.12) / 1000).toFixed(1)}k`, sub: 'Calculated tax and PF', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-[32px] border border-slate-50 p-8 shadow-sm">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-6", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{s.value}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-2">{s.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'batches' && (
                <div className="space-y-12">
                    <div className="flex justify-end">
                        <Button
                            onClick={createBatch}
                            disabled={processing !== null}
                            className="h-14 bg-slate-900 hover:bg-black text-white rounded-[20px] px-10 text-[11px] font-black uppercase tracking-widest gap-3 shadow-2xl shadow-slate-900/10 transition-all active:scale-95"
                        >
                            {processing === "creating" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Initialize New Batch
                        </Button>
                    </div>

                    {/* BATCH GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 text-black">
                        {loading ? (
                            <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 text-slate-400">
                                <div className="w-10 h-10 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing synchronization nodes...</p>
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 text-slate-400 bg-white border-[3px] border-dashed border-slate-100 rounded-[50px] opacity-60">
                                <CreditCard className="w-16 h-16 opacity-10" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting fiscal cycle initialization</p>
                            </div>
                        ) : (
                            batches.map((batch, idx) => (
                                <motion.div 
                                    key={batch.id} 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-slate-50 rounded-[44px] shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                                >
                                    <div className="p-10 pb-0 flex flex-row items-center justify-between">
                                        <div className="space-y-2 pb-6">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">{batch.month} / {batch.year}</h3>
                                                <Badge className={cn("text-[9px] font-black uppercase tracking-tighter px-3 h-5 border-none shadow-none", 
                                                    batch.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-600' :
                                                    batch.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-amber-50 text-amber-600'
                                                )}>
                                                    {batch.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{batch._count?.payslips || 0} Registered Personnel Units</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-[20px] mb-6 group-hover:bg-emerald-50 transition-colors">
                                            <DollarSign className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    </div>

                                    <div className="p-10 space-y-8">
                                        <div className="space-y-4">
                                            {batch.status === 'DRAFT' && (
                                                <Button
                                                    onClick={() => runCalculation(batch.id)}
                                                    disabled={processing === batch.id}
                                                    className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-[18px] text-[10px] font-black uppercase tracking-widest gap-3 transition-all border border-slate-100/50"
                                                >
                                                    {processing === batch.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                                                    Run Calculation Cycle
                                                </Button>
                                            )}

                                            {batch.status === 'DRAFT' && batch._count.payslips > 0 && (
                                                <Button
                                                    onClick={() => updateStatus(batch.id, 'APPROVED')}
                                                    disabled={processing === batch.id}
                                                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                                                >
                                                    {processing === batch.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                    Authorize Batch
                                                </Button>
                                            )}

                                            {batch.status === 'APPROVED' && (
                                                <Button
                                                    onClick={() => updateStatus(batch.id, 'RELEASED')}
                                                    disabled={processing === batch.id}
                                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
                                                >
                                                    {processing === batch.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                    Release to Fleet
                                                </Button>
                                            )}

                                            {batch.status === 'RELEASED' && (
                                                <div className="p-8 bg-emerald-50 rounded-[28px] border border-emerald-100/50 flex flex-col items-center gap-4 text-center">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-emerald-600 text-[12px] font-black uppercase tracking-tight italic">Liquidity Consummated</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Released: {new Date(batch.releasedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2 group/link">
                                                Intelligence Ledger <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                            </button>
                                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 transition-all flex items-center gap-2">
                                                Export CSV <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'salary' && (
                <div className="bg-white rounded-[44px] border border-slate-50 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Employee Payroll Matrix</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time salary calculation and disbursement terminal</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Input placeholder="Search personnel..." className="h-12 w-[300px] border-slate-100 bg-white rounded-xl text-xs font-black uppercase tracking-widest px-6" />
                            <select className="h-12 border border-slate-100 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 text-slate-500 outline-none">
                                <option>Current Period</option>
                                <option>Previous Month</option>
                            </select>
                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] px-3 py-1.5 rounded-full">{(Array.isArray(users) ? users.length : 0)} Active Nodes</Badge>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-[20%]">Personnel Node</th>
                                    <th className="px-4 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Base Struct</th>
                                    <th className="px-4 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Allowances</th>
                                    <th className="px-4 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deductions</th>
                                    <th className="px-4 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Salary</th>
                                    <th className="px-4 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-6 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Array.isArray(users) && users.map((user) => (
                                    <SalaryAuditRow key={user.id} user={user} token={token} onUpdate={fetchStats} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="p-10 rounded-[44px] border-slate-50 shadow-sm grow flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Financial Intelligence Exports</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed uppercase font-bold tracking-tight">Generate high-fidelity snapshots of organizational payroll, tax liability, and statutory compliance for external audits.</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Button className="h-14 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Download className="w-4 h-4" /> Annual Summary
                            </Button>
                            <Button className="h-14 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Download className="w-4 h-4" /> Tax Manifest
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-10 rounded-[44px] border-slate-50 shadow-sm bg-slate-900 text-white flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />
                        <div className="relative z-10">
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-none font-black text-[9px] px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">Compliance Engine Active</Badge>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-4">Statutory <span className="text-indigo-400">Guardian</span></h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Automated verification of PF, ESI, and Professional Tax nodes across all jurisdictions. Real-time reconciliation with local policies.</p>
                        </div>
                        <div className="pt-8 flex items-center gap-4 relative z-10">
                            <div className="flex -space-x-3">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black">AI</div>)}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Autonomous Validation Engine</span>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

function SalaryAuditRow({ user, token, onUpdate }: { user: any, token: string, onUpdate: () => void }) {
    const [config, setConfig] = useState<any>(null)
    const [bank, setBank] = useState<any>(null)
    const [tax, setTax] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    const fetchDetails = async () => {
        try {
            const [cRes, bRes, tRes] = await Promise.all([
                fetch(`${API_BASE_URL}/payroll/salary-config/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/payroll/bank-details/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/payroll/tax-details/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
            ])
            if (cRes.ok) setConfig(await cRes.json())
            if (bRes.ok) setBank(await bRes.json())
            if (tRes.ok) setTax(await tRes.json())
        } catch (e) {}
    }

    useEffect(() => {
        fetchDetails()
    }, [user.id, token])

    const handleSave = async (type: string, data: any) => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/${type}/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                toast.success(`${type.split('-').join(' ')} synchronized`)
                fetchDetails()
                onUpdate()
            }
        } catch (e) { toast.error("Write error") } finally { setSaving(false) }
    }

    const basic = Number(config?.basicSalary || 0)
    const hra = Number(config?.hra || 0)
    const pf = Number(config?.pf || 0)
    const taxAmt = Number(config?.tax || 0)
    const grossVal = basic + hra
    const deductionsVal = pf + taxAmt
    const netVal = grossVal - deductionsVal

    return (
        <tr className="group hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white transition-colors uppercase shadow-sm">
                        {user.name[0]}
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{user.designation?.name || 'Standard'}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-[11px] font-black uppercase text-slate-600">₹{basic.toLocaleString()}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-[11px] font-black uppercase text-emerald-600">₹{hra.toLocaleString()}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-[11px] font-black uppercase text-rose-500">₹{deductionsVal.toLocaleString()}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-[12px] font-black uppercase text-indigo-600 italic">₹{netVal.toLocaleString()}</span>
            </td>
            <td className="px-4 py-4">
                <Badge className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 border-none shadow-none", config ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400")}>
                    {config ? "Pending" : "Missing Config"}
                </Badge>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Preparing Payslip Ledger...')} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:bg-slate-100 hover:text-indigo-600 gap-2 border border-transparent hover:border-slate-200">
                        <FileText className="w-3 h-3" /> View Payslip
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Initiating secure PDF download...')} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:bg-slate-100 hover:text-slate-900 gap-2 border border-transparent hover:border-slate-200 hidden md:flex">
                        <Download className="w-3 h-3" />
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:bg-slate-100 hover:text-slate-900 gap-2 border border-transparent hover:border-slate-200">
                                <Settings className="w-3 h-3" /> Edit Payroll
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-white border-l border-slate-50 w-[600px] sm:w-[720px] p-0 rounded-l-[50px] shadow-2xl overflow-y-auto custom-scrollbar">
                        <SheetHeader className="pt-20 px-12 pb-10 border-b border-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-100 rotate-6">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Compensation <span className="text-indigo-600">Console</span></SheetTitle>
                                    <SheetDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Deploy financial parameters for {user.name}</SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="p-12 space-y-12">
                            {/* SALARY CONFIG */}
                            <div className="space-y-8">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">1. Salary Structure</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Basic Monthly Salary (₹)</Label>
                                        <Input 
                                            defaultValue={config?.basicSalary || 0} 
                                            onBlur={(e) => setConfig({ ...config, basicSalary: Number(e.target.value) })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">HRA (₹)</Label>
                                        <Input 
                                            defaultValue={config?.hra || 0}
                                            onBlur={(e) => setConfig({ ...config, hra: Number(e.target.value) })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">PF Deduction (₹)</Label>
                                        <Input 
                                            defaultValue={config?.pf || 0}
                                            onBlur={(e) => setConfig({ ...config, pf: Number(e.target.value) })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Income Tax (₹)</Label>
                                        <Input 
                                            defaultValue={config?.tax || 0}
                                            onBlur={(e) => setConfig({ ...config, tax: Number(e.target.value) })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                </div>
                                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-indigo-100" onClick={() => handleSave('salary-config', config)}>
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Update Structure
                                </Button>
                            </div>

                            {/* BANK DETAILS */}
                            <div className="space-y-8">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">2. Disbursement Node (Bank)</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3 col-span-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Account Holder Name</Label>
                                        <Input 
                                            defaultValue={bank?.accountHolder || user.name}
                                            onBlur={(e) => setBank({ ...bank, accountHolder: e.target.value })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Bank Name</Label>
                                        <Input 
                                            defaultValue={bank?.bankName || ''}
                                            onBlur={(e) => setBank({ ...bank, bankName: e.target.value })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">IFSC Code</Label>
                                        <Input 
                                            defaultValue={bank?.ifscCode || ''}
                                            onBlur={(e) => setBank({ ...bank, ifscCode: e.target.value })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3 col-span-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Account Number</Label>
                                        <Input 
                                            defaultValue={bank?.accountNumber || ''}
                                            onBlur={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                </div>
                                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-emerald-100" onClick={() => handleSave('bank-details', bank)}>
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Update Disbursement Node
                                </Button>
                            </div>

                            {/* TAX DETAILS */}
                            <div className="space-y-8 pb-12">
                                <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.4em]">3. Statutory Compliance</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">PAN Identifier</Label>
                                        <Input 
                                            defaultValue={tax?.panNumber || ''}
                                            onBlur={(e) => setTax({ ...tax, panNumber: e.target.value })}
                                            className="h-14 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest px-6" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Tax Regime</Label>
                                        <select 
                                            defaultValue={tax?.taxRegime || 'NEW'}
                                            onChange={(e) => setTax({ ...tax, taxRegime: e.target.value })}
                                            className="w-full h-14 bg-slate-50 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest px-6 outline-none"
                                        >
                                            <option value="NEW">New Regime (Default)</option>
                                            <option value="OLD">Old Regime</option>
                                        </select>
                                    </div>
                                </div>
                                <Button className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-violet-100" onClick={() => handleSave('tax-details', tax)}>
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Update Compliance Node
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <Button variant="ghost" size="sm" onClick={() => toast.success('Transfer settled. Marked as Paid.')} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 gap-2 border border-transparent hover:border-emerald-100 bg-emerald-50/50 ml-1">
                    <CheckCircle2 className="w-3 h-3" /> Mark Paid
                </Button>
                </div>
            </td>
        </tr>
    )
}
