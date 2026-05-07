import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getDashboardByRole } from "@/lib/role-redirect"

// Routes accessible without a session
const PUBLIC_ROUTES = [
    "/login",
    "/register",
    "/register-company",
    "/forgot-password",
    "/reset-password",
    "/auth-test",
    "/logout",
    "/clear-session",
    "/rbac-test",
]

// Auth pages — logged-in users should never see these
const AUTH_ROUTES = [
    "/login",
    "/register",
    "/register-company",
    "/forgot-password",
    "/reset-password",
]

export default auth((req: any) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const role = (req.auth?.user as any)?.role

    const isApiRoute = nextUrl.pathname.startsWith("/api")
    if (isApiRoute) return NextResponse.next()

    const isPublicRoute = PUBLIC_ROUTES.some(
        (r) => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + "/")
    )
    const isAuthRoute = AUTH_ROUTES.some(
        (r) => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + "/")
    )

    // 1. Logged-in user hitting an auth page (login, register, etc.) → role dashboard
    if (isLoggedIn && isAuthRoute) {
        const target = getDashboardByRole(role)
        return NextResponse.redirect(new URL(target, nextUrl))
    }

    // 2. Not logged in and trying to access a protected route → login with callbackUrl
    if (!isLoggedIn && !isPublicRoute) {
        const callbackUrl = nextUrl.pathname + nextUrl.search
        const loginUrl = new URL("/login", nextUrl)
        if (callbackUrl !== "/" && callbackUrl !== "/login") {
            loginUrl.searchParams.set("callbackUrl", callbackUrl)
        }
        return NextResponse.redirect(loginUrl)
    }

    // 3. Root "/" → role dashboard if logged in, otherwise login
    if (nextUrl.pathname === "/") {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(getDashboardByRole(role), nextUrl))
        }
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // 4. Enforce role-specific home for the generic /dashboard route
    if (nextUrl.pathname === "/dashboard") {
        const target = getDashboardByRole(role)
        if ((target as string) !== "/dashboard") {
            return NextResponse.redirect(new URL(target, nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
