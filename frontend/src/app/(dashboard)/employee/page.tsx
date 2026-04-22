import { auth } from "@/auth"
import { API_BASE_URL } from "@/lib/config"
import { redirect } from "next/navigation"
import EmployeeDashboardClient from "@/components/dashboard/EmployeeDashboardClient"

export default async function EmployeeDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const token = (session.user as any)?.accessToken || ""
    const user = session.user

    // Fetch Stats and Active Attendance
    let data: any = { summary: { totalHours: "0.00", daysWorked: 0 }, leaveBalances: [], latestPayslip: null, calendar: [], activeEntry: null }
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch(`${API_BASE_URL}/dashboard/employee`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept-Encoding': 'identity',
                'Accept': 'application/json',
            },
            cache: 'no-store',
            signal: controller.signal,
        })
        clearTimeout(timeout)
        if (res.ok) data = await res.json()
    } catch (e: any) {
        // Silently fall back to defaults — client will re-fetch
        if (e?.name !== 'AbortError') {
            console.warn("Dashboard SSR fetch skipped, client will hydrate:", e?.message || e)
        }
    }

    return (
        <EmployeeDashboardClient
            user={user}
            token={token}
            initialData={data}
        />
    )
}
