"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Monitor, Laptop, Smartphone, HardDrive, Plus, Loader2, User, CheckCircle2, AlertCircle, Search, Filter, Hash, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

const ASSET_ICONS: any = {
    "LAPTOP": Laptop,
    "MOBILE": Smartphone,
    "MONITOR": Monitor,
    "OTHER": HardDrive
}

export default function AssetManager({ token }: { token: string }) {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/lifecycle/assets`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setAssets(data)
        } catch (e) {
            toast.error("Inventory sync collision")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [token])

    const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.serialNumber?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-10">
            {/* HERO BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Resource <span className="text-emerald-600">Inventory</span></h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel infrastructure & asset audit</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Scan by Name/Serial..."
                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/5 pl-12 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest placeholder:text-slate-500"
                        />
                    </div>
                    <Button
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 text-[11px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-emerald-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Ingest Asset
                    </Button>
                </div>
            </div>

            {/* ASSET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-700">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500/30" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Auditing ledger hardware...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-white/5">
                        <HardDrive className="w-12 h-12 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No active hardware records</p>
                    </div>
                ) : filtered.map((asset) => {
                    const Icon = ASSET_ICONS[asset.type] || HardDrive
                    return (
                        <Card key={asset.id} className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:ring-2 hover:ring-emerald-500/20 transition-all">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${asset.status === 'AVAILABLE' ? 'border-emerald-500 text-emerald-500' :
                                            asset.status === 'ASSIGNED' ? 'border-indigo-500 text-indigo-500' :
                                                'border-amber-500 text-amber-500'
                                        }`}>
                                        {asset.status}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{asset.name}</h4>
                                    <p className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                        <Hash className="w-3 h-3" /> {asset.serialNumber || "NO_SERIAL"}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                    {asset.assignedTo ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-500 font-black italic">
                                                {asset.assignedTo.name.charAt(0)}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-700 dark:text-white uppercase line-clamp-1">{asset.assignedTo.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Unassigned Node</span>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-500">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
