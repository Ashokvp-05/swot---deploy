/**
 * getDashboardByRole
 * Single source of truth for role → home page routing.
 * Used in: /dashboard/page.tsx, Navbar.tsx
 */
export const getDashboardByRole = (role?: string): string => {
    const r = role?.trim().toUpperCase().replace(/[\s-]/g, '_') || "USER"

    switch (r) {
        case "SUPER_ADMIN":
            return "/admin"

        case "ADMIN":
        case "COMPANY_ADMIN":
        case "OPS_ADMIN":
        case "FINANCE_ADMIN":
        case "HR_ADMIN":
        case "VIEWER_ADMIN":
            return "/admin"

        case "HR":
        case "HR_MANAGER":
        case "MANAGER":
            return "/manager"

        case "AUDITOR":
            return "/auditor"

        case "SUPPORT_ADMIN":
        case "SUPPORT":
            return "/support"

        case "PAYROLL_ADMIN":
        case "PAYROLL":
            return "/payroll"

        default:
            return "/employee"
    }
}
