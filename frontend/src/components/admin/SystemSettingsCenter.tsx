import { useState } from "react"
import { Building2, ShieldCheck, Calendar, Clock, Globe, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch as UISwitch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemSettingsCenter({ token }: { token: string }) {
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        setIsSaving(true)
        const toastId = toast.loading("Deploying new parameters...")
        setTimeout(() => {
            setIsSaving(false)
            toast.success("Settings updated successfully", { id: toastId })
        }, 1500)
    }

    return (
        <div className="bg-[#f0f2f8] h-full flex flex-col font-sans mb-12">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 border-none uppercase tracking-tighter italic leading-none font-brand">Configuration Hub</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 leading-none italic font-body">Manage global parameters from a single interface.</p>
                </div>
                <Button onClick={handleSave} className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] px-10 text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200">
                    {isSaving ? "Syncing..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 custom-scrollbar pb-10">

                {/* 1. Company Profile */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 className="w-5 h-5" /></div>
                        <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">1. Company Profile</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Company Name</label>
                            <Input className="h-14 bg-slate-50 border-none rounded-[16px] font-bold px-6 text-sm" defaultValue="Rudratic Enterprise" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Physical Address</label>
                            <Input className="h-14 bg-slate-50 border-none rounded-[16px] font-bold px-6 text-sm" defaultValue="Cyber Hub Sector 5" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Time Zone</label>
                                <select className="w-full h-14 bg-slate-50 border-none rounded-[16px] font-bold px-6 text-[12px] outline-none appearance-none">
                                    <option>UTC+05:30 (IST)</option>
                                    <option>UTC+00:00 (GMT)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Currency</label>
                                <select className="w-full h-14 bg-slate-50 border-none rounded-[16px] font-bold px-6 text-[12px] outline-none appearance-none">
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Roles & Permissions */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck className="w-5 h-5" /></div>
                            <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">2. Roles & Permissions</h4>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1" /> New Role</Button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "Super Admin", access: "Full System View/Edit", users: 2, color: "emerald" },
                            { name: "HR Manager", access: "Personnel & Payroll", users: 5, color: "indigo" },
                            { name: "Standard Employee", access: "Self-Service Only", users: 156, color: "slate" }
                        ].map((role, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-[20px] border border-slate-50">
                                <div>
                                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{role.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role.access}</p>
                                </div>
                                <div className="mt-3 sm:mt-0 flex gap-3 items-center">
                                    <Badge className="bg-white text-slate-600 border-slate-200 uppercase text-[9px] font-black shadow-none">{role.users} Nodes</Badge>
                                    <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase bg-slate-100 hover:bg-slate-200">Edit Access</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Leave Policy */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Calendar className="w-5 h-5" /></div>
                        <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">3. Leave Policy</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { type: "Sick Leave", count: 12 },
                            { type: "Casual Leave", count: 12 },
                            { type: "Paid Leave", count: 15 }
                        ].map((lv, i) => (
                            <div key={i} className="p-5 bg-slate-50 rounded-[24px] text-center border border-slate-100">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{lv.type}</span>
                                <Input type="number" defaultValue={lv.count} className="h-12 bg-white border-slate-200 rounded-xl text-center font-black text-indigo-600 mx-auto w-20 text-lg" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[20px] border border-slate-50">
                            <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Allow Carry Forward</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Move unutilized PL to next cycle</p>
                            </div>
                            <UISwitch checked={true} />
                        </div>
                    </div>
                </div>

                {/* 4. Attendance Rules */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-5 h-5" /></div>
                        <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">4. Attendance Rules</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Shift Start</label>
                            <Input type="time" className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4 text-sm" defaultValue="09:00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Shift End</label>
                            <Input type="time" className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4 text-sm" defaultValue="18:00" />
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-50 mt-4">
                        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[20px] border border-slate-50">
                            <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Late Mark Protocol</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Half-day deduction after 3 late logs</p>
                            </div>
                            <UISwitch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[20px] border border-slate-50">
                            <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Overtime Compensation</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Paid extra for work post 6:30 PM</p>
                            </div>
                            <UISwitch checked={false} />
                        </div>
                    </div>
                </div>

                {/* 5. Holiday Calendar */}
                <div className="xl:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl"><Globe className="w-5 h-5" /></div>
                            <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">5. Holiday Calendar</h4>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1" /> Add Holiday</Button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="md:w-1/3 space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 block mb-4">Weekly Offs</label>
                            <div className="flex flex-wrap gap-2">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                    <button key={idx} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-[12px] font-black border transition-all", idx >= 5 ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50")}>{day}</button>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-2/3 space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 block mb-4">Company Holidays (Upcoming)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { date: "15 Aug 2026", name: "Independence Day", day: "Saturday" },
                                    { date: "02 Oct 2026", name: "Gandhi Jayanti", day: "Friday" },
                                    { date: "12 Nov 2026", name: "Diwali", day: "Thursday" }
                                ].map((hol, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-[20px] border border-slate-100">
                                        <div className="space-y-1">
                                            <span className="block text-[13px] font-black text-slate-900 uppercase">{hol.name}</span>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hol.day}</span>
                                        </div>
                                        <Badge className="bg-white border-slate-200 text-slate-600 px-3 py-1.5 text-[9px] shadow-sm uppercase">{hol.date}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
