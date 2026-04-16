"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, Users, Plus, Loader2, MapPin, DollarSign, Calendar, ChevronRight, Search, Filter, Mail, Phone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function RecruitmentHub({ token }: { token: string }) {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'JOBS' | 'APPLICANTS'>('JOBS')
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [applicants, setApplicants] = useState<any[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newJob, setNewJob] = useState({
        title: "",
        department: "",
        location: "Remote",
        salaryRange: "",
        description: "",
        requirements: ""
    })

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/lifecycle/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setJobs(data)
        } catch (e) {
            toast.error("Recruitment pipeline sync failure")
        } finally {
            setLoading(false)
        }
    }

    const fetchApplicants = async (jobId: string) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/lifecycle/jobs/${jobId}/applicants`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setApplicants(data)
        } catch (e) {
            toast.error("Applicant data retrieval error")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (applicantId: string, status: 'HIRED' | 'REJECTED') => {
        try {
            const res = await fetch(`${API_BASE_URL}/lifecycle/applicants/${applicantId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                toast.success(`Applicant status updated: ${status}`);
                if (selectedJob) fetchApplicants(selectedJob.id);
            }
        } catch (e) {
            toast.error("Synchronization failure: Status not updated");
        }
    }

    const handleCreateJob = async () => {
        if (!newJob.title || !newJob.department) {
            return toast.error("Architecture incomplete: Title and Department required");
        }
        try {
            const res = await fetch(`${API_BASE_URL}/lifecycle/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newJob)
            })
            if (res.ok) {
                toast.success("Recruitment node activated successfully");
                setIsCreateOpen(false);
                setNewJob({ title: "", department: "", location: "Remote", salaryRange: "", description: "", requirements: "" });
                fetchJobs();
            }
        } catch (e) {
            toast.error("Synchronization failure: Node not created");
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [token])

    return (
        <div className="space-y-10">
            {/* HERO BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Talent <span className="text-indigo-600">Acquisition</span></h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Strategic recruitment & personnel pipeline</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => { setView('JOBS'); setSelectedJob(null); }}
                        className={`text-[10px] font-black uppercase tracking-widest ${view === 'JOBS' ? 'text-indigo-600' : 'text-slate-500'}`}
                    >
                        Opportunities
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 text-[11px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-indigo-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Provision Job Post
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 gap-8">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-700">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500/30" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Scanning talent horizons...</p>
                    </div>
                ) : view === 'JOBS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <Card 
                            className="border-2 border-dashed border-slate-100 hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer" 
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white mb-6">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 group-hover:text-indigo-600 transition-colors">Register Opportunity</h4>
                            <p className="text-[10px] text-slate-400 mt-2">Activate a new hiring protocol node</p>
                        </Card>
                        {jobs.map((job) => (
                             <Card key={job.id} className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group hover:ring-2 hover:ring-indigo-500/20 transition-all cursor-pointer" onClick={() => { setSelectedJob(job); setView('APPLICANTS'); fetchApplicants(job.id); }}>
                                 <CardHeader className="p-8 pb-4">
                                     <div className="flex justify-between items-start mb-6">
                                         <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                             <Briefcase className="w-6 h-6" />
                                         </div>
                                         <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 font-black text-[8px] tracking-widest uppercase">{job.status}</Badge>
                                     </div>
                                     <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic line-clamp-1">{job.title}</h3>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{job.department} • {job.location}</p>
                                 </CardHeader>
                                 <CardContent className="p-8 pt-4 space-y-6">
                                     <div className="flex items-center gap-6">
                                         <div className="flex items-center gap-2">
                                             <Users className="w-4 h-4 text-slate-400" />
                                             <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase italic">{job._count?.applicants || 0} Candidates</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <DollarSign className="w-4 h-4 text-slate-400" />
                                             <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{job.salaryRange || "TBD"}</span>
                                         </div>
                                     </div>
                                     <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modified {new Date(job.updatedAt).toLocaleDateString()}</span>
                                         <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                     </div>
                                 </CardContent>
                             </Card>
                         ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5">
                            <Button variant="ghost" onClick={() => { setView('JOBS'); setSelectedJob(null); }} className="p-2 h-auto text-slate-400 hover:text-indigo-600"><ChevronRight className="rotate-180" /></Button>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider italic">{selectedJob?.title}</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Candidate Pool • {applicants.length} Identities</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {applicants.map((app) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 border border-slate-100 dark:border-white/5 transition-colors">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{app.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Mail className="w-3 h-3" /> {app.email}</span>
                                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Phone className="w-3 h-3" /> {app.phone || "No Pulse"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <Badge className={`h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter ${app.status === 'HIRED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                            }`}>
                                            {app.status}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleUpdateStatus(app.id, 'HIRED')}
                                                        className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        Hire
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                                        className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600"><FileText className="w-5 h-5" /></Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* PROVISIONING DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 border-none rounded-[3rem] shadow-2xl p-10 max-w-2xl font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Talent Architecture</DialogTitle>
                        <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Configure a new recruitment protocol shard</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-6 py-6 font-sans">
                        <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Opportunity Title</Label>
                            <Input 
                                className="h-14 rounded-2xl bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 px-6 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none" 
                                placeholder="e.g. Senior Logic Architect"
                                value={newJob.title}
                                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Department</Label>
                            <Input 
                                className="h-14 rounded-2xl bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 px-6 font-bold text-slate-900 dark:text-white" 
                                placeholder="Engineering"
                                value={newJob.department}
                                onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location</Label>
                            <Input 
                                className="h-14 rounded-2xl bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 px-6 font-bold text-slate-900 dark:text-white" 
                                placeholder="Remote / HQ"
                                value={newJob.location}
                                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Salary Range / Compensation</Label>
                            <Input 
                                className="h-14 rounded-2xl bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 px-6 font-bold text-slate-900 dark:text-white" 
                                placeholder="$120k - $160k"
                                value={newJob.salaryRange}
                                onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Description</Label>
                            <Textarea 
                                className="min-h-[120px] rounded-2xl bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 p-6 font-medium text-slate-900 dark:text-white" 
                                placeholder="Define the core objectives..."
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsCreateOpen(false)}
                            className="h-14 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-400"
                        >
                            Abort
                        </Button>
                        <Button 
                            onClick={handleCreateJob}
                            className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            Deploy Protocol
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
