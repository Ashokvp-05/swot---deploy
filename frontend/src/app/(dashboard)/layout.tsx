import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import PageTransition from "@/components/layout/PageTransition"
import TopHeader from "@/components/layout/TopHeader"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const token = (session.user as any)?.accessToken || ""

    return (
        <div className="flex min-h-screen font-body bg-[#f0f2f8]">
            {/* 🛡️ THE PROFESSIONAL GLOBAL SIDEBAR */}
            <Navbar 
                role={session.user?.role} 
                token={token} 
                companyName={session.user?.companyName || undefined}
            />

            {/* 🏗️ MAIN CONTENT STAGE */}
            <main className="flex-1 w-full min-w-0 bg-[#f8fafc] h-screen overflow-y-auto">
                <TopHeader 
                    token={token} 
                    breadcrumb={{ 
                        parent: !["ADMIN", "COMPANY_ADMIN", "SUPER_ADMIN", "HR_ADMIN"].includes((session.user?.role || "").toUpperCase()) 
                            ? "Employee" 
                            : "Admin", 
                        page: "Dashboard" 
                    }} 
                />
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
        </div>
    )
}
