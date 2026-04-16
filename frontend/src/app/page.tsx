import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getDashboardByRole } from "@/lib/role-redirect"
import LandingPage from "@/components/landing/LandingPage"

/**
 * Root Page: 
 * - Redirects to the appropriate dashboard based on role if logged in.
 * - Otherwise renders a premium Landing Page.
 */
export default async function RootPage() {
    const session = await auth()

    if (session) {
        // Automatically route authenticated users to their respective command centers
        redirect(getDashboardByRole((session.user as any)?.role))
    }

    // Unauthenticated users see the high-fidelity landing page
    return <LandingPage />
}
