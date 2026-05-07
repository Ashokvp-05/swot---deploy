"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    BrainCircuit,
    Zap,
    Coffee,
    Timer,
    PlayCircle,
    PauseCircle,
    CheckCircle2,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function SmartFocusWidget() {
    const [isFocusing, setIsFocusing] = useState(false)
    const [focusTime, setFocusTime] = useState(0) // in seconds
    const [dailyGoal, setDailyGoal] = useState(65) // % completed (mock)
    const [suggestion, setSuggestion] = useState("Peak energy detected. Ideal time for complex tasks.")

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isFocusing) {
            interval = setInterval(() => {
                setFocusTime((prev) => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isFocusing])

    // Format seconds to MM:SS
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const toggleFocus = () => {
        setIsFocusing(!isFocusing)
        if (!isFocusing) {
            setSuggestion("Notifications silenced. Entering Deep Work protocol.")
        } else {
            setSuggestion("Session paused. Good job maintaining focus.")
        }
    }

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                        AI Coach
                    </CardTitle>
                </div>
                {isFocusing && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-[10px] font-bold">Focusing</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-5 pb-5 space-y-5">
                {/* AI INSIGHT BUBBLE */}
                <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-2xl flex gap-3 shadow-sm">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {suggestion}
                    </p>
                </div>

                {/* PROGRESS BAR */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold text-slate-500">Daily Goal</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{dailyGoal}%</span>
                    </div>
                    <Progress value={dailyGoal} className="h-2" />
                </div>

                {/* FOCUS TIMER ACTION */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 pr-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isFocusing ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                            <Timer className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Session</p>
                            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white leading-none">
                                {formatTimer(focusTime)}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="icon"
                        className={`rounded-xl w-10 h-10 shadow-sm transition-all ${isFocusing ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        onClick={toggleFocus}
                    >
                        {isFocusing ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="p-0 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                <Link href="/reports" className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors">
                    View Productivity Report
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </CardFooter>
        </Card>
    )
}
