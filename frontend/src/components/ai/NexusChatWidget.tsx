"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send, X, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "ai"
    content: string
}

export function NexusChatWidget({ token }: { token: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "ai", content: "Hello! I'm Nexus, your HR Assistant. Ask me about your leave balance, attendance, or company policies! 🤖" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("http://localhost:4000/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg.content })
            })

            const data = await res.json()

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.reply || "I'm having trouble connecting to the mainframe."
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "Network error. Please try again."
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">

            {/* CHAT WINDOW */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="mb-4 w-[350px] md:w-[400px] h-[500px] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col font-sans"
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Nexus AI</h3>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-medium uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-black/20">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                        msg.role === "ai"
                                            ? "bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400"
                                            : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                    )}>
                                        {msg.role === "ai" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm border",
                                        msg.role === "ai"
                                            ? "bg-white border-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-tl-none"
                                            : "bg-indigo-600 border-indigo-500 text-white dark:bg-indigo-600 dark:border-indigo-500 rounded-tr-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Nexus..."
                                className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            )}

            {/* TOGGLE BUTTON */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-white border-2 border-white dark:border-slate-800 z-50"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    )
}
