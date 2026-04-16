"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Sparkles, Frown, Meh, Smile, Heart, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

const MOODS = [
    { label: "Stressed", icon: Frown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Okay", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Good", icon: Smile, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Great", icon: ThumbsUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Amazing", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
]

export default function MoodPulseWidget() {
    const [selectedMood, setSelectedMood] = useState<number | null>(null)

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24" />
            </div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Daily Pulse
                </CardTitle>
                <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center gap-2">
                    {MOODS.map((mood, idx) => {
                        const Icon = mood.icon
                        const isSelected = selectedMood === idx
                        return (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedMood(idx)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all w-full",
                                    isSelected ? `${mood.bg} ring-2 ring-primary/20 scale-110 shadow-lg` : "hover:bg-muted"
                                )}
                            >
                                <Icon className={cn("w-6 h-6", isSelected ? mood.color : "text-muted-foreground")} />
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>{mood.label}</span>
                            </motion.button>
                        )
                    })}
                </div>
                {selectedMood !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10"
                    >
                        Thanks for sharing! We'll optimize your day.
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
