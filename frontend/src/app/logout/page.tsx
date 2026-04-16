"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        const performLogout = async () => {
            // Sign out and clear session
            await signOut({ redirect: false })

            // Small delay to ensure session is cleared
            setTimeout(() => {
                router.push("/login")
            }, 500)
        }

        performLogout()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-lg">Logging out...</p>
            </div>
        </div>
    )
}
