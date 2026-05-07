"use client"

import { useSession } from "next-auth/react"
import { useRole } from "@/hooks/useRole"
import { RoleGate, AdminOnly, ManagerOnly } from "@/components/auth/RoleGate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, User, CheckCircle2, XCircle } from "lucide-react"

export default function RBACTestPage() {
    const { data: session } = useSession()
    const { role, isAdmin, isManager, isEmployee } = useRole()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Role-Based Access Control Test
                    </h1>
                    <p className="text-slate-400">
                        Testing RBAC implementation with different user roles
                    </p>
                </div>

                {/* Current User Info */}
                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Current User Information</CardTitle>
                        <CardDescription>Your session and role details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-400">Name</p>
                                <p className="text-white font-semibold">{session?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Email</p>
                                <p className="text-white font-semibold">{session?.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Role</p>
                                <Badge className={
                                    role === "ADMIN" ? "bg-red-500" :
                                        role === "MANAGER" ? "bg-blue-500" :
                                            "bg-green-500"
                                }>
                                    {role}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">User ID</p>
                                <p className="text-white font-mono text-xs">{(session?.user as any)?.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Checks */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-400" />
                                Admin Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isAdmin ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>You are an Admin</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-400">
                                    <XCircle className="w-5 h-5" />
                                    <span>Not an Admin</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                Manager Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isManager ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Manager Access</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-400">
                                    <XCircle className="w-5 h-5" />
                                    <span>No Manager Access</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-green-400" />
                                Employee Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEmployee ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Employee Role</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <XCircle className="w-5 h-5" />
                                    <span>Higher Role</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Role-Based Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Role-Based Content Visibility</h2>

                    {/* Admin Only Content */}
                    <AdminOnly fallback={
                        <Card className="bg-red-900/20 border-red-500/30">
                            <CardContent className="pt-6">
                                <p className="text-red-400">🔒 Admin Console - Access Denied</p>
                            </CardContent>
                        </Card>
                    }>
                        <Card className="bg-red-900/20 border-red-500/30">
                            <CardHeader>
                                <CardTitle className="text-red-400">🔓 Admin Console</CardTitle>
                                <CardDescription>Only visible to ADMIN users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-white">
                                    <li>✅ User Management</li>
                                    <li>✅ Role Assignment</li>
                                    <li>✅ System Settings</li>
                                    <li>✅ Security Logs</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </AdminOnly>

                    {/* Manager Content */}
                    <ManagerOnly fallback={
                        <Card className="bg-blue-900/20 border-blue-500/30">
                            <CardContent className="pt-6">
                                <p className="text-blue-400">🔒 Team Management - Access Denied</p>
                            </CardContent>
                        </Card>
                    }>
                        <Card className="bg-blue-900/20 border-blue-500/30">
                            <CardHeader>
                                <CardTitle className="text-blue-400">🔓 Team Management</CardTitle>
                                <CardDescription>Visible to ADMIN and MANAGER</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-white">
                                    <li>✅ View Team Members</li>
                                    <li>✅ Approve Leave Requests</li>
                                    <li>✅ Performance Reviews</li>
                                    <li>✅ Team Reports</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </ManagerOnly>

                    {/* All Users Content */}
                    <RoleGate allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
                        <Card className="bg-green-900/20 border-green-500/30">
                            <CardHeader>
                                <CardTitle className="text-green-400">🔓 Employee Features</CardTitle>
                                <CardDescription>Visible to all authenticated users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-white">
                                    <li>✅ My Profile</li>
                                    <li>✅ My Attendance</li>
                                    <li>✅ Leave Requests</li>
                                    <li>✅ Submit Tickets</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </RoleGate>
                </div>

                {/* Test Instructions */}
                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Testing Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-300">
                        <div>
                            <h3 className="font-semibold text-white mb-2">Test Different Roles:</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Logout from current account</li>
                                <li>Login with different role credentials:</li>
                            </ol>
                            <div className="mt-3 space-y-2 text-sm font-mono bg-slate-950/50 p-4 rounded">
                                <p className="text-red-400">ADMIN: admin@rudratic.com / Rudratic@Admin#2026</p>
                                <p className="text-blue-400">MANAGER: manager@rudratic.com / Rudratic@Mgr#2026</p>
                                <p className="text-green-400">EMPLOYEE: employee@rudratic.com / Rudratic@User#2026</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">Expected Behavior:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>ADMIN sees all three sections (Admin Console, Team Management, Employee Features)</li>
                                <li>MANAGER sees Team Management and Employee Features (Admin Console denied)</li>
                                <li>EMPLOYEE sees only Employee Features (other sections denied)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
