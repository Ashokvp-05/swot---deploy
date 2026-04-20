"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Radio, Send, Users, FileText, Paperclip, 
    AlertTriangle, CheckCircle2, ChevronRight,
    MessageSquare, Zap, Megaphone, X, History, Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/config"

export function BroadcastCenter({ token }: { token: string }) {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL")
    const [targetAudience, setTargetAudience] = useState<"ALL" | "MANAGERS" | "EMPLOYEES" | "SPECIFIC">("ALL")
    const [attachedFiles, setAttachedFiles] = useState<string[]>([])
    const [isSending, setIsSending] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    
    // Employee Selection State
    const [searchQuery, setSearchQuery] = useState("")
    const [employees, setEmployees] = useState<any[]>([])
    const [selectedRecipients, setSelectedRecipients] = useState<any[]>([])
    const [loadingEmployees, setLoadingEmployees] = useState(false)

    useEffect(() => {
        if (targetAudience === "SPECIFIC" && searchQuery.length > 1) {
            fetchEmployees()
        }
    }, [searchQuery, targetAudience])

    const fetchEmployees = async () => {
        setLoadingEmployees(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/employees?search=${searchQuery}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setEmployees(data.users || [])
            }
        } catch (error) {
            console.error("Failed to fetch employees", error)
        } finally {
            setLoadingEmployees(false)
        }
    }

    // Mock history data for visual credibility
    const mockHistory = [
        { id: 1, title: "Q3 Policy Updates Attached", date: "Oct 12, 2026", audience: "ALL PERSONNEL", priority: "HIGH" },
        { id: 2, title: "System Maintenance Downtime", date: "Sep 28, 2026", audience: "ALL PERSONNEL", priority: "URGENT" },
        { id: 3, title: "Managerial Leadership Seminar", date: "Sep 05, 2026", audience: "MANAGERS ONLY", priority: "NORMAL" }
    ]

    const handleFileUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => file.name)
            setAttachedFiles(prev => [...prev, ...newFiles])
            toast.info(`Authorized file(s) linked: ${newFiles.join(", ")}`)
            // clear the input value so the same file could be uploaded again if removed
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const removeFile = (file: string) => {
        setAttachedFiles(prev => prev.filter(f => f !== file))
    }

    const handleBroadcast = () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Announcement title and message are required.")
            return
        }
        
        if (targetAudience === "SPECIFIC" && selectedRecipients.length === 0) {
            toast.error("Please select at least one specific employee to message.")
            return
        }
        
        setIsSending(true)
        // Simulate network transmit latency
        setTimeout(() => {
            setIsSending(false)
            setTitle("")
            setMessage("")
            setAttachedFiles([])
            setPriority("NORMAL")
            setTargetAudience("ALL")
            setSelectedRecipients([])
            toast.success("Intelligence Broadcast successfully transmitted to targets.")
        }, 1500)
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 font-body">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic font-brand">Announcements</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm ml-13">Send messages, updates, and documents to all employees.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowHistory(!showHistory)}
                        className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl"
                    >
                        <History className="w-4 h-4 mr-2" />
                        {showHistory ? "Close History" : "View Transmission Logs"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COL: Configuration */}
                <div className="col-span-1 space-y-8">
                    
                    {/* AUDIENCE SELECTOR */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" /> Target Node
                        </h3>
                        
                        <div className="space-y-3">
                            {[
                                { id: "ALL", label: "All Personnel" },
                                { id: "MANAGERS", label: "Managers Only" },
                                { id: "EMPLOYEES", label: "Staff Only" },
                                { id: "SPECIFIC", label: "Specific Personnel" }
                            ].map((aud) => (
                                <button
                                    key={aud.id}
                                    onClick={() => setTargetAudience(aud.id as any)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm tracking-tight",
                                        targetAudience === aud.id 
                                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm" 
                                            : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                    )}
                                >
                                    {aud.label}
                                    {targetAudience === aud.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                </button>
                            ))}
                        </div>
                        
                        {/* SPECIFIC EMPLOYEE SELECTOR (ANIMATED REVEAL) */}
                        <AnimatePresence>
                            {targetAudience === "SPECIFIC" && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-4 mt-4 border-t border-slate-100 overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        {/* Selected Chips */}
                                        {selectedRecipients.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedRecipients.map((recip) => (
                                                    <div key={recip.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
                                                        <div className="w-5 h-5 rounded-full bg-white text-indigo-700 flex items-center justify-center font-black text-[10px] shadow-sm border border-indigo-100">
                                                            {recip.name[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{recip.name}</span>
                                                        <button 
                                                            onClick={() => setSelectedRecipients(prev => prev.filter(r => r.id !== recip.id))}
                                                            className="text-slate-400 hover:text-rose-500 ml-1 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Search Input */}
                                        <div className="space-y-2">
                                            <Input 
                                                placeholder="Search name or email to add..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-10 text-sm font-semibold"
                                            />
                                            {loadingEmployees ? (
                                                <div className="p-3 flex justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Searching...</div>
                                            ) : (
                                                employees.length > 0 && searchQuery.length > 1 && (
                                                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-50 max-h-[160px] overflow-y-auto custom-scrollbar">
                                                        {employees.map(emp => {
                                                            const isAlreadySelected = selectedRecipients.some(r => r.id === emp.id);
                                                            if (isAlreadySelected) return null;
                                                            return (
                                                                <button 
                                                                    key={emp.id}
                                                                    onClick={() => {
                                                                        setSelectedRecipients(prev => [...prev, emp])
                                                                        setSearchQuery("")
                                                                        setEmployees([])
                                                                    }}
                                                                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left transition-colors"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-medium text-xs">
                                                                        {emp.name[0]?.toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-slate-900 truncate">{emp.name}</p>
                                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5 truncate">{emp.email}</p>
                                                                    </div>
                                                                    <div className="ml-auto opacity-50"><Plus className="w-4 h-4 text-slate-400" /></div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* PRIORITY MATRIX */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" /> Protocol Priority
                        </h3>
                        <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                            {[
                                { id: "NORMAL", color: "bg-white text-slate-700 shadow-sm" },
                                { id: "HIGH", color: "bg-amber-500 text-white shadow-md shadow-amber-200 text-amber-900 font-extrabold" },
                                { id: "URGENT", color: "bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse font-black" }
                            ].map((pri) => (
                                <button
                                    key={pri.id}
                                    onClick={() => setPriority(pri.id as any)}
                                    className={cn(
                                        "flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                                        priority === pri.id ? pri.color : "text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {pri.id}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Compose & Transmit */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                        
                        <div className="p-1 border-b border-slate-100 bg-slate-50/50">
                            <input
                                type="text"
                                placeholder="Subject Line / Directive Title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent px-5 py-4 outline-none text-lg font-black tracking-tight text-slate-800 placeholder:text-slate-300 font-brand"
                            />
                        </div>

                        <div className="flex-1 p-6">
                            <textarea
                                placeholder="Write official announcement, instruction, or details here. High-priority messages trigger immediate staff push notifications..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-48 resize-none bg-transparent outline-none text-[15px] leading-relaxed text-slate-600 placeholder:text-slate-300 font-medium"
                            />
                        </div>

                        {/* ATTACHMENTS TRAY */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 items-center">
                            {attachedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group">
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{file}</span>
                                    <button onClick={() => removeFile(file)} className="opacity-50 hover:opacity-100 text-rose-500 ml-1 transition-opacity">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                onClick={handleFileUploadClick}
                                className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 bg-white border border-dashed border-slate-200 hover:border-indigo-300 px-4 py-2 rounded-xl transition-all"
                            >
                                <Paperclip className="w-3.5 h-3.5" /> Attach Document
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                multiple 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Global messages require explicit authorization</span>
                        </div>
                        <Button 
                            onClick={handleBroadcast}
                            disabled={isSending}
                            className={cn(
                                "h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl transition-all",
                                priority === "URGENT" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                            )}
                        >
                            {isSending ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <Send className="w-4 h-4" /> Send Message
                                </span>
                            )}
                        </Button>
                    </div>

                </div>

            </div>

            {/* HISTORY OVERLAY / TRAY */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-900 rounded-[24px] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <History className="w-64 h-64 text-white" />
                            </div>
                            <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                <History className="w-4 h-4 text-indigo-400" /> Transmission Archives
                            </h3>
                            
                            <div className="space-y-3 relative z-10">
                                {mockHistory.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 px-6 py-4 rounded-xl hover:bg-slate-800 transition-colors cursor-default">
                                        <div className="flex items-center gap-4">
                                            {log.priority === 'URGENT' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <MessageSquare className="w-5 h-5 text-slate-500" />}
                                            <div>
                                                <p className="text-white font-bold tracking-tight">{log.title}</p>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">{log.audience}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-indigo-400 font-medium text-sm">{log.date}</p>
                                            <Badge className="bg-slate-700 text-slate-300 border-none text-[8px] uppercase tracking-widest mt-1">Status: Success</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
