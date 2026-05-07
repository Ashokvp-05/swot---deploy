"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Battery, BatteryCharging, Heart, Zap } from "lucide-react"

export function WellnessWidget({ score }: { score: number }) {
    // Score 0-100: 100 is best, 0 is burnout
    const getStatus = (s: number) => {
        if (s > 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500", icon: BatteryCharging }
        if (s > 50) return { label: "Good", color: "text-blue-500", bg: "bg-blue-500", icon: Battery }
        if (s > 30) return { label: "Tired", color: "text-amber-500", bg: "bg-amber-500", icon: Battery }
        return { label: "Burnout Risk", color: "text-rose-500", bg: "bg-rose-500", icon: Zap }
    }

    const status = getStatus(score)
    const Icon = status.icon

    return (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Wellness Shield
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <span className={`text-3xl font-bold ${status.color}`}>{score}%</span>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Energy Level: <span className={status.color}>{status.label}</span></p>
                    </div>
                    <div className={`p-3 rounded-full ${status.bg} bg-opacity-10 mb-1`}>
                        <Icon className={`w-6 h-6 ${status.color}`} />
                    </div>
                </div>
                <Progress value={score} className="h-2" indicatorClassName={status.bg} />
                <p className="text-[10px] text-muted-foreground mt-3 italic">
                    AI Analysis: {score > 80 ? "Great balance! Keep it up." : "High workload detected. Consider taking a break."}
                </p>
            </CardContent>
        </Card>
    )
}
