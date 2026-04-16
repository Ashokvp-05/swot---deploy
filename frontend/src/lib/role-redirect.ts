/**
 * getDashboardByRole
 * Single source of truth for role → home page routing.
 * Used in: /dashboard/page.tsx, Navbar.tsx
 */
export const getDashboardByRole = (role?: string): string => {
    // Normalize role: trim, uppercase, and replace all separators with underscores
    const r = role?.trim().toUpperCase().replace(/[\s-]/g, '_') || "USER"

    switch (r) {
        // ── Platform Level ──────────────────────
        case "SUPER_ADMIN":
            return "/admin"

        // ── Support / Helpdesk ──────────────────
        case "SUPPORT_ADMIN":
        case "SUPPORT":
            return "/support"

        // ── Company Level (Points to the now-blank admin shard) ────────
        case "ADMIN":
        case "COMPANY_ADMIN":
        case "OPS_ADMIN":
        case "FINANCE_ADMIN":
        case "HR_ADMIN":
        case "VIEWER_ADMIN":
            return "/admin"

        // ── HR / Manager ────────────────────────
        case "HR":
        case "HR_MANAGER":
        case "MANAGER":
            return "/manager"

        // ── Auditor (read-only review role) ─────
        case "AUDITOR":
            return "/auditor"

        // ── Support / Helpdesk ──────────────────
        case "SUPPORT_ADMIN":
        case "SUPPORT":
            return "/support"

        // ── Payroll Operator ────────────────────
        case "PAYROLL_ADMIN":
        case "PAYROLL":
            return "/payroll"

        // ── Default: Employee Self-Service ───────
        default:
            return "/employee"
    }
}
