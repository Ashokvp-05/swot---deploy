"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    HelpCircle, Mail, MessageSquare, Book, Search, 
    ShieldCheck, Zap, Globe, ChevronRight, Ticket,
    AlertCircle, FileText, Download, Fingerprint
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { useSession } from "next-auth/react"
import { API_BASE_URL } from "@/lib/config"

export default function HelpPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        const target = e.target as HTMLFormElement
        const title = (target.elements.namedItem('subject') as HTMLInputElement).value
        const priority = (target.elements.namedItem('priority') as HTMLSelectElement).value.toUpperCase()
        const description = (target.elements.namedItem('description') as HTMLTextAreaElement).value
        const token = (session?.user as any)?.accessToken

        if (!token) {
            toast.error("Authentication required to raise tickets.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority: priority === 'URGENT (SOS)' ? 'HIGH' : priority,
                    category: 'SUPPORT',
                    module: 'HELP_DESK'
                })
            })

            if (res.ok) {
                toast.success("Support Ticket Raised", {
                    description: "Incident has been synced to the HR Administrator node.",
                })
                target.reset()
            } else {
                toast.error("Interface Error", { description: "Failed to transmit ticket to HQ." })
            }
        } catch (err) {
            toast.error("Network Latency", { description: "Failed to reach the support shard." })
        } finally {
            setLoading(false)
        }
    }

    const faqItems = [
        {
            q: "How do I reset my attendance node?",
            a: "Manual reset is restricted. If you stayed clocked in past 12 hours without confirmation, the system resets it automatically to 'REST'. Contact HR for manual adjustments."
        },
        {
            q: "When is the optimal clock-out epoch?",
            a: "The standard pulse reminder is sent daily at 7:00 PM. We recommend syncing your activity records before leaving to ensure data integrity."
        },
        {
            q: "What defines the 'Remote Mode' protocol?",
            a: "Remote mode allows you to clock in from any coordinate. Note that your GPS location is captured to ensure compliance with our work-from-home security models."
        },
        {
            q: "My leave balance deviates from expected value.",
            a: "Leave balances are synchronized monthly. If you believe your earned or medical leave count is wrong, please raise a ticket below with relevant artifacts."
        }
    ]

    const filteredFaqs = faqItems.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-6 lg:p-10 font-sans relative overflow-hidden">
            {/* Soft Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-950/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 dark:bg-blue-950/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-10 relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                <HelpCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 italic">Operational Support</span>
                        </div>
                        <h1 className="text-5xl font-bold text-slate-950 dark:text-white tracking-tighter italic uppercase font-brand leading-none">Intelligence Hub</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-medium tracking-tight max-w-2xl">Access organizational wisdom and administrative support channels.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT PANEL: FAQ & POLICIES */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* FAQ SECTION */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Core FAQ Registry</h2>
                            </div>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                                            <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-100 dark:border-slate-800 px-8 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors last:border-0">
                                                <AccordionTrigger className="text-slate-800 dark:text-slate-200 font-bold text-sm text-left hover:no-underline hover:text-indigo-600 dark:text-white py-6">
                                                    {faq.q}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pb-6">
                                                    {faq.a}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )) : (
                                            <div className="p-12 text-center text-slate-500 font-bold text-xs uppercase tracking-widest italic">
                                                No FAQ nodes match your query.
                                            </div>
                                        )}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </section>

                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] font-bold text-slate-400 uppercase italic">Don't see your issue? Raise a targeted incident report on the right panel.</p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: SUPPORT TICKET */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[40px] shadow-xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/10 to-transparent pointer-events-none" />
                            <CardHeader className="p-10 pb-4 relative z-10">
                                <div className="p-3.5 bg-indigo-600 rounded-2xl w-fit mb-6 shadow-xl shadow-indigo-600/20">
                                    <Ticket className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-950 dark:text-white italic uppercase tracking-tighter leading-none">Raise Ticket</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">Contact HR or SysAdmin</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 relative z-10">
                                <form onSubmit={handleSubmitTicket} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject Matter</label>
                                        <Input 
                                            name="subject"
                                            placeholder="e.g. Leave Sync Correction" 
                                            required 
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 h-12 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Priority Protocol</label>
                                        <select name="priority" className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest transition-all focus:ring-2 focus:ring-indigo-100">
                                            <option>Normal</option>
                                            <option>High</option>
                                            <option>Urgent (SOS)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Incident Description</label>
                                        <Textarea
                                            name="description"
                                            placeholder="Provide technical or contextual details..."
                                            className="min-h-[140px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 rounded-[24px] text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-100 transition-all p-5"
                                            required
                                        />
                                    </div>
                                    <Button className="w-full h-14 bg-indigo-600 text-white hover:bg-slate-900 hover:text-white dark:hover:bg-indigo-500 rounded-[20px] font-bold uppercase tracking-[0.15em] text-xs shadow-xl shadow-indigo-600/10 transition-all active:scale-95" type="submit" disabled={loading}>
                                        {loading ? "Transmitting..." : "Initialize Ticket"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>



                    </div>
                </div>
            </div>
        </div>
    )
}
