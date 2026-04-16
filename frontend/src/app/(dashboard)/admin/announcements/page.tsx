"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    AlertCircle,
    Bell,
    Plus,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Megaphone,
    Calendar,
    Loader2,
    Activity,
    Zap,
    Radio
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { API_BASE_URL } from "@/lib/config"

interface Announcement {
    id: string
    title: string
    content: string
    type: string
    priority: string
    expiresAt: string | null
    createdAt: string
}

export default function AnnouncementsPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        type: "INFO",
        priority: "NORMAL",
        expiresAt: ""
    })

    useEffect(() => {
        if (token) fetchAnnouncements()
    }, [token])

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAnnouncements(Array.isArray(data) ? data : (data.announcements || []))
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast({ title: "Error", description: "Title and content are required", variant: "destructive" })
            return
        }

        try {
            const res = await fetch(`${API_BASE_URL}/announcements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newAnnouncement)
            })

            if (res.ok) {
                toast({ title: "Success", description: "Announcement broadcasted successfully" })
                setOpen(false)
                setNewAnnouncement({ title: "", content: "", type: "INFO", priority: "NORMAL", expiresAt: "" })
                fetchAnnouncements()
            } else {
                toast({ title: "Error", description: "Failed to broadcast announcement", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast({ title: "Deleted", description: "Announcement removed" })
                fetchAnnouncements()
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />
            case 'ALERT': return <AlertCircle className="w-5 h-5 text-rose-500" />
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            default: return <Info className="w-5 h-5 text-indigo-500" />
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'URGENT': return <Badge className="bg-rose-500/10 text-rose-600 border-none text-[8px] font-black uppercase tracking-widest">Urgent</Badge>
            case 'HIGH': return <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-black uppercase tracking-widest">High</Badge>
            case 'LOW': return <Badge className="bg-slate-500/10 text-slate-600 border-none text-[8px] font-black uppercase tracking-widest">Low</Badge>
            default: return <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[8px] font-black uppercase tracking-widest">Normal</Badge>
        }
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-10 animate-in fade-in duration-700">
            {/* Premium Multi-Layer Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Broadcast Center</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Dispatch organizational intelligence across all personnel nodes.</p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl gap-3 px-6 shadow-xl shadow-indigo-600/20 border-none font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
                                <Plus className="w-5 h-5" /> New Broadcast
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-none shadow-xl bg-white dark:bg-slate-950 rounded-[2.5rem] p-0 overflow-hidden">
                            <div className="bg-indigo-600 p-8 text-white">
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Compose Intelligence</DialogTitle>
                                <DialogDescription className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">Personnel Communication Protocol</DialogDescription>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title Designation</label>
                                    <Input
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                                        placeholder="e.g., Office Maintenance / Town Hall Meeting"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Payload</label>
                                    <Textarea
                                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                                        placeholder="Write your announcement here..."
                                        rows={4}
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                        <Select value={newAnnouncement.type} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, type: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="INFO">Information</SelectItem>
                                                <SelectItem value="WARNING">Warning</SelectItem>
                                                <SelectItem value="ALERT">Alert</SelectItem>
                                                <SelectItem value="SUCCESS">Success</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Criticality</label>
                                        <Select value={newAnnouncement.priority} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, priority: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                                <Button variant="ghost" onClick={() => setOpen(false)} className="font-black uppercase tracking-widest text-[10px]">Discard</Button>
                                <Button onClick={handleCreate} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-black uppercase tracking-widest text-[10px]">Initialize Broadcast</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                <div className="lg:col-span-8 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Retrieving broadcast history...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 p-12 text-center group">
                            <div className="p-8 bg-white dark:bg-slate-800 rounded-full shadow-xl mb-6 group-hover:scale-110 transition-transform">
                                <Bell className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Silence in the system</h3>
                            <p className="text-slate-500 font-medium max-w-sm mt-3">There are no active announcements. Dispatch a new one to keep your team informed.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {announcements.map((item) => (
                                <Card key={item.id} className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:ring-2 hover:ring-indigo-500/20 transition-all">
                                    <div className="p-8 flex items-start gap-6">
                                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{item.title}</h3>
                                                    {getPriorityBadge(item.priority)}
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                {item.content}
                                            </p>
                                            <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                    {format(new Date(item.createdAt), 'MMM d, p')}
                                                </span>
                                                {item.expiresAt && (
                                                    <span className="flex items-center gap-2 text-amber-500">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Expiry: {format(new Date(item.expiresAt), 'MMM d')}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-2 ml-auto">
                                                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                                                    System Broadcast
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-0 shadow-xl bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                            <Zap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-xl font-black uppercase tracking-tighter">Broadcast Insights</h4>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">Intelligence reach across the organizational nervous system.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Total Active</p>
                                    <p className="text-2xl font-black mt-1">{announcements.length}</p>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Terminal Reach</p>
                                    <p className="text-2xl font-black mt-1">100%</p>
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-bold text-indigo-100 italic leading-relaxed">
                                    "Announcements are prioritized by criticality and displayed on every personnel dashboard for maximum synchronization."
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group h-48 flex flex-col justify-end">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="w-24 h-24" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Network Health</p>
                        <h4 className="text-xl font-black italic uppercase leading-tight">All communication channels operating at 100% efficiency.</h4>
                    </div>
                </div>
            </div>
        </div>
    )
}
