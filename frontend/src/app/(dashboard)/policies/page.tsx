"use client"

import { useState, useMemo } from "react"
import { Search, FileText, CheckCircle2, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog"

export default function PoliciesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [acknowledged, setAcknowledged] = useState<string[]>([])
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null)

    const policiesData = [
        { 
            id: "p1", 
            title: "Code of Conduct", 
            desc: "Professional ethics and workplace etiquette.",
            details: "This protocol outlines the behavioral expectations for all personnel. Continuous professional integrity is required in all communications and operational cycles. Failure to adhere to these standards may result in disciplinary syncs."
        },
        { 
            id: "p2", 
            title: "Dress Code Policy", 
            desc: "Guidelines for professional attire.",
            details: "The organization maintains a business-casual standard. While flexibility is permitted for remote nodes, on-site presence requires adherence to established visual professional standards."
        },
        { 
            id: "p3", 
            title: "Leave Policy", 
            desc: "Time-off allocation and vacation rules.",
            details: "Employees are granted 22 days of annual leave. Sick leave requires medical artifacts if duration exceeds 2 cycles. All requests must be submitted through the Temporal Request Node (Leave Page)."
        },
        { 
            id: "p4", 
            title: "Attendance Rules", 
            desc: "Clock-in protocols and hybrid work guidelines.",
            details: "Daily activity must be synchronized via the Biometric Shard by 10:00 AM local time. Hybrid nodes are required to maintain a 3/2 split between physical and remote presence."
        },
        { 
            id: "p5", 
            title: "Data Privacy Protocol", 
            desc: "GDPR compliance and information encryption.",
            details: "All personnel data is encrypted at rest. Data handling must follow internal security models. Unauthorized extraction of organizational intelligence is strictly prohibited."
        },
        { 
            id: "p6", 
            title: "Anti-Harassment", 
            desc: "Zero-tolerance policy for workplace misconduct.",
            details: "Swot-HR operates a zero-tolerance policy against any form of harassment. Protected environments are guaranteed for all employees. Anonymous reporting is available through the HelpDesk."
        },
        { 
            id: "p7", 
            title: "IT Security Policy", 
            desc: "Hardware usage and network protocols.",
            details: "Corporate hardware must not be used for external data mining. VPN synchronization is mandatory for all remote sessions. Passwords must meet complexity shard requirements."
        },
        { 
            id: "p8", 
            title: "Onboarding Guide", 
            desc: "Setup and integration for new employees.",
            details: "The initial integration phase involves account setup, security clearance, and access to internal knowledge fragments. New hires must complete mandatory skill syncs within 30 days."
        },
        { 
            id: "p9", 
            title: "Safety & Emergency", 
            desc: "Evacuation drills and health protocols.",
            details: "In case of system or physical anomaly, follow the emergency evacuation route. First-aid shards are located in each operational wing. Emergency protocols are triggered automatically by environmental sensors."
        },
        { 
            id: "p10", 
            title: "Workplace Training", 
            desc: "Mandatory professional development.",
            details: "Personnel performance is optimized through continuous learning models. Employees are encouraged to dedicate 2 hours per week to skill acquisition within the Training Module."
        }
    ]

    const filteredPolicies = useMemo(() => {
        return policiesData.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const handleAcknowledge = (id: string) => {
        if (acknowledged.includes(id)) return
        setAcknowledged(prev => [...prev, id])
        toast.success("Policy Acknowledged")
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-10">
                
                {/* Simple Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Policies & Documents</h1>
                        <p className="text-slate-500 mt-1">Read and acknowledge company protocols.</p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search policies..." 
                            className="pl-10 h-11 border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Simplified Policy List with Click Detail */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredPolicies.map((policy) => (
                        <Dialog key={policy.id}>
                            <DialogTrigger asChild>
                                <div 
                                    className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white dark:bg-slate-900 border rounded-2xl hover:border-indigo-500 transition-all hover:shadow-sm cursor-pointer"
                                >
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{policy.title}</h3>
                                            <p className="text-sm text-slate-500 truncate">{policy.desc}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-6 md:mt-0 w-full md:w-auto shrink-0" onClick={e => e.stopPropagation()}>
                                        {acknowledged.includes(policy.id) ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold whitespace-nowrap">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Acknowledged
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleAcknowledge(policy.id)}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-all whitespace-nowrap"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] rounded-[32px] p-10">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
                                        {policy.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-6">
                                        Organizational Protocol Node
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                                            "{policy.desc}"
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Framework</h4>
                                        <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {policy.details}
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}

                    {filteredPolicies.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-medium">
                            No policies found matching your search.
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
