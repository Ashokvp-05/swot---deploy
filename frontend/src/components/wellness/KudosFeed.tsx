"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, ThumbsUp, Star, Award, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Kudos {
    id: string;
    from: string;
    message: string;
    category: string;
    time: string;
}

export function KudosFeed() {
    // Mock Data for now
    const [kudos, setKudos] = useState<Kudos[]>([
        { id: '1', from: 'Sarah', message: 'Thanks for helping with the deployment!', category: 'Team Player', time: '2h ago' },
        { id: '2', from: 'Mike', message: 'Great leadership on the Q3 plan.', category: 'Leadership', time: '4h ago' },
        { id: '3', from: 'System', message: 'Perfect attendance streak! 30 Days!', category: 'Achievement', time: '1d ago' },
    ])

    const getIcon = (cat: string) => {
        if (cat === 'Leadership') return <Star className="w-3 h-3 text-amber-500" />
        if (cat === 'Achievement') return <Trophy className="w-3 h-3 text-indigo-500" />
        return <ThumbsUp className="w-3 h-3 text-emerald-500" />
    }

    return (
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800 h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Wall of Fame
                </CardTitle>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Give Kudos
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-4">
                        <AnimatePresence>
                            {kudos.map((k) => (
                                <motion.div
                                    key={k.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50"
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">{k.from[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{k.from}</p>
                                            <span className="text-[10px] text-slate-400">{k.time}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">&quot;{k.message}&quot;</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <div className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1">
                                                {getIcon(k.category)}
                                                <span className="text-[10px] font-medium text-slate-500">{k.category}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-rose-50 hover:text-rose-500 text-slate-400">
                                                <Heart className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
