import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import PageTransition from "@/components/layout/PageTransition"

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
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
            {/* 🛡️ THE PROFESSIONAL GLOBAL NAVBAR (One True Nav) */}
            <Navbar 
                role={session.user?.role} 
                token={token} 
                companyName={session.user?.companyName || undefined}
            />

            {/* 🏗️ MAIN CONTENT STAGE */}
            <main className="flex-1 w-full bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden p-0">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>

            {/* MOBILE BOTTOM NAVBAR (Optional, can be removed if handled by Sheet Nav) */}
            {/* We keep it as a 'Quick Access' bar for mobile UX excellence */}
            <div className="md:hidden h-20" /> {/* Spacer */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl px-6 flex items-center justify-around z-40">
                {/* 
                   Using simplified links for mobile quick actions. 
                   Full nav is available via the Top Left hamburger in <Navbar />
                */}
            </nav>
        </div>
    )
}
