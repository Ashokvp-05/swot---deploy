"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AuthTestPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8">
            <div className="max-w-2xl w-full space-y-6 bg-slate-900 p-8 rounded-lg">
                <h1 className="text-3xl font-bold">Authentication Test Page</h1>

                <div className="space-y-4">
                    <div>
                        <strong>Status:</strong> {status}
                    </div>

                    {session ? (
                        <>
                            <div className="bg-green-900/20 border border-green-500 p-4 rounded">
                                <h2 className="text-xl font-bold mb-2">✅ Authenticated</h2>
                                <div className="space-y-2">
                                    <p><strong>Name:</strong> {session.user?.name}</p>
                                    <p><strong>Email:</strong> {session.user?.email}</p>
                                    <p><strong>Role:</strong> {(session.user as any)?.role}</p>
                                    <p><strong>User ID:</strong> {(session.user as any)?.id}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    variant="destructive"
                                >
                                    Sign Out
                                </Button>
                                <Button onClick={() => router.push("/dashboard")}>
                                    Go to Dashboard
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-red-900/20 border border-red-500 p-4 rounded">
                                <h2 className="text-xl font-bold mb-2">❌ Not Authenticated</h2>
                                <p>You are not logged in.</p>
                            </div>

                            <div className="flex gap-4">
                                <Button onClick={() => router.push("/login")}>
                                    Go to Login
                                </Button>
                                <Button onClick={() => router.push("/register")} variant="outline">
                                    Go to Register
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
