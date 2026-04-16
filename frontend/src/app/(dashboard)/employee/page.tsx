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
        const res = await fetch(`${API_BASE_URL}/dashboard/employee`, {
            headers: { Authorization: `Bearer ${token}` },
            next: { revalidate: 60 }
        })
        if (res.ok) data = await res.json()
    } catch (e) {
        console.error("Dashboard fetch error:", e)
    }

    return (
        <EmployeeDashboardClient
            user={user}
            token={token}
            initialData={data}
        />
    )
}
