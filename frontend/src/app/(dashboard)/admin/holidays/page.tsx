"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Calendar as CalendarIcon, Loader2, Sparkles, MapPin, Globe } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { API_BASE_URL } from "@/lib/config"

export default function HolidaysPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [holidays, setHolidays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newHoliday, setNewHoliday] = useState({ name: "", date: "", isFloater: false })

    useEffect(() => {
        if (token) fetchHolidays()
    }, [token])

    const fetchHolidays = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/holidays`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHolidays(Array.isArray(data) ? data : (data.holidays || []))
            }
        } catch (error) {
            console.error("Failed to fetch holidays")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!newHoliday.name || !newHoliday.date) return

        try {
            const res = await fetch(`${API_BASE_URL}/holidays`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newHoliday.name,
                    date: new Date(newHoliday.date).toISOString(),
                    year: new Date(newHoliday.date).getFullYear(),
                    isFloater: newHoliday.isFloater
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Holiday added successfully" })
                setNewHoliday({ name: "", date: "", isFloater: false })
                fetchHolidays()
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to add holiday", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/holidays/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setHolidays(prev => prev.filter(h => h.id !== id))
                toast({ title: "Deleted", description: "Holiday removed" })
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-10 animate-in fade-in duration-700">
            {/* Premium Multi-Layer Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Temporal Policy</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configure global rest cycles and administrative rest nodes.</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">{holidays.length} Active Records</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
                {/* Form Card */}
                <div className="md:col-span-4">
                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden sticky top-8">
                        <CardHeader className="bg-slate-900 p-8 text-white">
                            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Initialize <span className="text-indigo-400">Rest Node</span></CardTitle>
                            <CardDescription className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Global Temporal Configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Designation</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                                    placeholder="e.g. Independence Day"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date Designation</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                                    type="date"
                                    value={newHoliday.date}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all hover:ring-2 hover:ring-indigo-500/20">
                                <Checkbox
                                    id="floater"
                                    className="rounded-md border-2 border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    checked={newHoliday.isFloater}
                                    onCheckedChange={(c) => setNewHoliday({ ...newHoliday, isFloater: c as boolean })}
                                />
                                <label htmlFor="floater" className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                    Floating Rest Node <span className="text-[9px] font-bold opacity-60 ml-1">(Optional Attendance)</span>
                                </label>
                            </div>
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95" onClick={handleAdd}>
                                <Plus className="w-4 h-4 mr-2" /> Sync to Calendar
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* List Card */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex-1">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-black/10">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active <span className="text-indigo-600 italic">Rest Nodes</span></CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 italic">Temporal checkpoints for the current organizational cycle.</CardDescription>
                            </div>
                            <Globe className="w-6 h-6 text-indigo-500 opacity-20" />
                        </CardHeader>
                        <CardContent className="p-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Retrieving temporal data...</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {holidays.length === 0 ? (
                                        <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                                            <p className="text-slate-400 font-bold italic">No rest nodes detected in current cycle.</p>
                                        </div>
                                    ) :
                                        holidays.map((h) => (
                                            <div key={h.id} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black border border-slate-100 dark:border-slate-700 text-center min-w-[70px] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <span className="block text-[10px] font-black text-slate-400 group-hover:text-indigo-100 uppercase tracking-widest">{format(new Date(h.date), 'MMM')}</span>
                                                        <span className="block text-3xl font-black text-slate-900 group-hover:text-white tracking-tighter tabular-nums">{format(new Date(h.date), 'dd')}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{h.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <MapPin className="w-3 h-3" /> {format(new Date(h.date), 'EEEE, yyyy')}
                                                            </p>
                                                            {h.isFloater && <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md">Floater Node</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(h.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] flex items-center justify-between text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Policy Integrity</p>
                            <h4 className="text-xl font-black italic uppercase leading-tight mt-1">All temporal nodes synchronized across organizational terminals.</h4>
                        </div>
                        <div className="relative z-10 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Globe className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
