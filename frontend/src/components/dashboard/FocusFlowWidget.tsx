"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, Focus } from "lucide-react"

export default function FocusFlowWidget() {
    const [seconds, setSeconds] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS')

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1)
            }, 1000)
        } else if (seconds === 0) {
            setIsActive(false)
            // Play notification sound here
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, seconds])

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setSeconds(mode === 'FOCUS' ? 25 * 60 : 5 * 60)
    }

    const switchMode = () => {
        const newMode = mode === 'FOCUS' ? 'BREAK' : 'FOCUS'
        setMode(newMode)
        setIsActive(false)
        setSeconds(newMode === 'FOCUS' ? 25 * 60 : 5 * 60)
    }

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60)
        const s = secs % 60
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <Card className="border-none shadow-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20" />

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {mode === 'FOCUS' ? <Focus className="w-4 h-4 text-indigo-300" /> : <Coffee className="w-4 h-4 text-orange-300" />}
                    {mode === 'FOCUS' ? 'Deep Work' : 'Recharge Break'}
                </CardTitle>
                <div onClick={switchMode} className="cursor-pointer text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors">
                    Switch to {mode === 'FOCUS' ? 'Break' : 'Focus'}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="text-5xl font-black tracking-tighter font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    {formatTime(seconds)}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleTimer}
                        className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all"
                    >
                        {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={resetTimer}
                        className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
