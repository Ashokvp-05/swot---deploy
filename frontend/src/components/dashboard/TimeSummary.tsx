"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Activity, CalendarDays, Clock } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function TimeSummary({ token }: { token: string }) {
    const [summary, setSummary] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/time/summary`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setSummary(data)
                }
            } catch (err) {
                console.error("Failed to fetch summary")
            } finally {
                setLoading(false)
            }
        }
        fetchSummary()
    }, [token])

    if (loading) return <Loader2 className="animate-spin" />
    if (!summary) return null

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle>Date Range: Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                        <h3 className="text-2xl font-bold">{summary.totalHours}h</h3>
                    </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                        <CalendarDays className="h-6 w-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Days Worked</p>
                        <h3 className="text-2xl font-bold">{summary.daysWorked}</h3>
                    </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="p-3 bg-red-100 rounded-full dark:bg-red-900">
                        <Activity className="h-6 w-6 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Overtime</p>
                        <h3 className="text-2xl font-bold">{summary.overtimeHours}h</h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
