import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center flex-col gap-4 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-sm">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Nexus Intelligence</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Synchronizing Neural Workspace...</p>
            </div>
        </div>
    )
}
