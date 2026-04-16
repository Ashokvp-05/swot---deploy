"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Landmark, Plus, Loader2, Clock, CheckCircle2, XCircle, ChevronRight, FileText, Send, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

export default function WorkflowPortal({ token }: { token: string }) {
    const [expenses, setExpenses] = useState<any[]>([])
    const [advances, setAdvances] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState<'EXPENSE' | 'ADVANCE' | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formData, setFormData] = useState({ amount: "", description: "", category: "TRAVEL", reason: "", terms: "Deduct from next salary" })

    const fetchClaims = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/workflow/my-claims`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setExpenses(data.expenses || [])
                setAdvances(data.advances || [])
            }
        } catch (e) {
            toast.error("Financial claim sync failure")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClaims()
    }, [token])

    const handleSubmit = async () => {
        setFormLoading(true)
        const endpoint = showModal === 'EXPENSE' ? 'expense-claims' : 'salary-advances'
        try {
            const res = await fetch(`${API_BASE_URL}/workflow/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success(`${showModal} protocol initiated`)
                setShowModal(null)
                fetchClaims()
            } else {
                toast.error("Transmission rejected")
            }
        } catch (e) {
            toast.error("Network synchronization collision")
        } finally {
            setFormLoading(false)
        }
    }

    return (
        <div className="space-y-10">
            {/* HUD HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Workflow <span className="text-indigo-600">Portal</span></h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel liquidity & reimbursement protocol</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setShowModal('EXPENSE')}
                        className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 text-[11px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-indigo-600/20"
                    >
                        <Wallet className="w-5 h-5" />
                        File Expense
                    </Button>
                    <Button
                        onClick={() => setShowModal('ADVANCE')}
                        variant="outline"
                        className="h-14 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl px-8 text-[11px] font-black uppercase tracking-widest gap-2"
                    >
                        <Landmark className="w-5 h-5 text-indigo-500" />
                        Request Advance
                    </Button>
                </div>
            </div>

            {/* CLAIMS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* EXPENSES */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2">Expense Audit Log</h3>
                    <div className="space-y-4">
                        {expenses.length === 0 ? (
                            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active expense claims</p>
                            </div>
                        ) : expenses.map((claim) => (
                            <div key={claim.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:ring-2 hover:ring-indigo-500/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">${claim.amount}</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{claim.category} • {new Date(claim.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[8px] font-black uppercase tracking-tighter ${claim.status === 'APPROVED' ? 'border-emerald-500 text-emerald-500' :
                                        claim.status === 'REJECTED' ? 'border-rose-500 text-rose-500' :
                                            'border-amber-500 text-amber-500'
                                    }`}>
                                    {claim.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ADVANCES */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2">Salary Advance Timeline</h3>
                    <div className="space-y-4">
                        {advances.length === 0 ? (
                            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active salary advances</p>
                            </div>
                        ) : advances.map((adv) => (
                            <div key={adv.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:ring-2 hover:ring-indigo-500/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">${adv.amount}</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{adv.reason.substring(0, 20)}...</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[8px] font-black uppercase tracking-tighter ${adv.status === 'APPROVED' ? 'border-emerald-500 text-emerald-500' :
                                        adv.status === 'REJECTED' ? 'border-rose-500 text-rose-500' :
                                            'border-amber-500 text-amber-500'
                                    }`}>
                                    {adv.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[40px] shadow-xl overflow-hidden p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Incentivize {showModal === 'EXPENSE' ? 'Reimbursement' : 'Liquidity'}</h3>
                                <Button size="icon" variant="ghost" className="text-slate-500 hover:text-white" onClick={() => setShowModal(null)}>
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Amount ($)</label>
                                    <Input
                                        type="number"
                                        className="h-14 bg-slate-950 border-white/5 rounded-2xl px-6 text-sm font-bold text-white"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Justification / Audit Notes</label>
                                    <Textarea
                                        className="bg-slate-950 border-white/5 rounded-2xl min-h-[120px] p-6 text-xs font-bold leading-relaxed text-white resize-none"
                                        value={showModal === 'EXPENSE' ? formData.description : formData.reason}
                                        onChange={(e) => setFormData({ ...formData, [showModal === 'EXPENSE' ? 'description' : 'reason']: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                disabled={formLoading}
                                onClick={handleSubmit}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 gap-2"
                            >
                                {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Transmit Workflow Signal
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
