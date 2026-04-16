"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import TimesheetTable from "@/components/dashboard/TimesheetTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoryPage() {
    const { data: session, status } = useSession()

    if (status === "loading") return <div>Loading...</div>

    if (status === "unauthenticated") {
        redirect("/login")
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* @ts-ignore */}
                    <TimesheetTable token={session?.user?.accessToken || "mock-token"} />
                </CardContent>
            </Card>
        </div>
    )
}
