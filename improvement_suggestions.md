# SWOT HRMS — Improvement & Refinement Suggestions

**Analyzed:** Full codebase (frontend + backend + docker)  
**Date:** May 1, 2026

---

## 🔴 Priority 1 — Critical Fixes (Do These First)

### 1. Attendance Chart Uses Fake Random Data
**File:** `frontend/src/components/admin/ExecutiveHub.tsx` — Line 92–96

The **Weekly Attendance Chart** on the admin dashboard generates random numbers using `Math.random()` every render — it does NOT use real attendance data from the database.

```ts
// ❌ Current (fake data)
present: Math.max(1, stats.totalEmployees - Math.floor(Math.random() * ...))
```

**Fix:** Connect the chart to the real `/api/time/reports` or `/api/reports/attendance` endpoint and show actual day-by-day attendance counts.

**Impact:** High — admins are making decisions based on fake charts.

---

### 2. Manager Performance Tab Shows "Module Under Construction"
**File:** `frontend/src/app/(dashboard)/manager/page.tsx` — Line 143–149

When an HR Manager clicks **Performance**, it shows a placeholder message instead of the actual PerformanceHub component.

**Fix:** Replace the placeholder with the existing `<PerformanceHub />` component (already used in the admin panel).

**Impact:** Medium — HR Managers cannot do performance reviews from their dashboard.

---

### 3. Duplicate Health Check Route
**File:** `backend/src/app.ts` — Line 131 and Line 208

There are **two identical `/health` route registrations** in `app.ts`. The second one (line 208) silently overrides the first.

**Fix:** Remove the duplicate at line 131, keep only the one inside the routes section at line 208.

---

## 🟡 Priority 2 — Quick Wins (High Value, Low Effort)

### 4. Add Employee Export to CSV / Excel from Admin Panel
The backend already has `GET /api/reports/export/excel` and `GET /api/reports/export/pdf`. But there is **no "Export" button** in the employee management UI (`UserManagementTable.tsx`).

**Fix:** Add an **Export CSV** and **Export PDF** button to the top of the employee list table. A single `<a href={API_BASE + '/reports/export/excel'}>` link with the auth token in the header is enough.

**Impact:** High value for HR teams who need to share employee data with management.

---

### 5. Add "Forgot Password" Email Flow (Currently Broken for Production)
The route `/forgot-password` exists on the frontend, but the backend's `email.service.ts` email templates use placeholder SMTP settings. If SMTP is not configured, the forgot password flow silently fails.

**Fix:** 
- Add a clear error toast on the frontend when the email fails to send
- Document the required SMTP env variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) in the README

---

### 6. Add Pagination to Employee List
The employee table in `UserManagementTable.tsx` fetches all employees at once with no pagination. As your company grows, this will slow down significantly.

**Fix:** Add `?page=1&limit=20` query params to `GET /api/admin/employees` and implement simple page controls in the UI. The backend already supports Express query params — it just needs the controller to be updated.

---

### 7. Show Real Notification Count on the Bell Icon
The notification bell in `TopHeader.tsx` likely shows a static badge. Connect it to `GET /api/notifications` so the badge shows the **actual unread count** for the logged-in user.

---

### 8. Payslip Download — Add PDF Download Button
The payslip view already renders all data (earnings, deductions, net pay). Add a **"Download PDF"** button that calls `GET /api/reports/export/pdf` or uses `window.print()` with a print-specific CSS stylesheet to generate a clean payslip PDF.

---

## 🟢 Priority 3 — Feature Enhancements

### 9. Employee Self-Service: Edit Profile Photo
Currently employees can view their profile but there's no photo upload capability. Adding a profile photo significantly improves the human feel of the HRMS.

**Fix:** Add an avatar upload field in the employee profile page that calls `PATCH /api/profile` with a base64-encoded image. Store the URL in the user record.

---

### 10. Leave Balance Reset (Yearly Automation)
The cron service (`cron.service.ts`) exists — use it to **auto-reset leave balances** at the start of each year (January 1st). Currently HR has to manually adjust each employee's leave balance.

**Fix:** Add a cron job in `cron.service.ts`:
```ts
// Run every Jan 1 at 00:01
cron.schedule('1 0 1 1 *', async () => {
  await prisma.leaveBalance.updateMany({
    data: { used: 0, pending: 0 }
  });
});
```

---

### 11. Add "Mark Holiday" Feature for Custom Company Holidays
Employees currently see a holiday calendar. But there's no UI for admins to add **custom company holidays** (like a company anniversary). The `holiday.service.ts` backend supports it.

**Fix:** Add a simple "Add Holiday" button in the admin → Settings or Attendance section.

---

### 12. Attendance Correction Request Approval Flow
The backend has `POST /api/attendance-v2/corrections` — employees can request attendance corrections. But there's **no admin UI** to approve or reject these correction requests.

**Fix:** Add a "Correction Requests" sub-tab inside the Attendance Control Center for HR/Admins to review and approve.

---

### 13. Real-Time Notifications via WebSocket
The WebSocket infrastructure (`useWebSocket.ts` + `websocket.service.ts`) is fully built. But notifications like "Leave Approved", "Payslip Generated", "New Announcement" are not pushed in real-time — users only see them when they refresh.

**Fix:** When key events happen on the backend (leave approval, payslip generation), emit a WebSocket event to the user's session. The frontend hook is already ready to receive and display toasts.

---

### 14. Recruitment Pipeline — Make It Usable
The lifecycle routes (`/api/lifecycle/jobs`, `/api/lifecycle/applicants`) and `RecruitmentHub.tsx` component exist but the **Recruitment tab is not in the admin sidebar navigation**. It's invisible to users.

**Fix:** Add a **Recruitment** nav item to the admin sidebar for HR/Admin roles and wire it to the existing `RecruitmentHub` component.

---

### 15. Audit Log for HR Manager
Currently the **Security Audit Logs** tab is only reachable when logged in as Super Admin. HR Managers cannot see a log of who approved/rejected leaves, who was added, etc.

**Fix:** Add a filtered audit log view in the HR Manager dashboard that shows only company-scoped events (not system-wide ones).

---

## 🔵 Priority 4 — Future Roadmap (Strategic)

### 16. Mobile App / PWA Support
The dashboard is not mobile-optimized. Consider adding **PWA (Progressive Web App)** support to `next.config.ts` so employees can add it to their phone home screen and use it like a native app. Key features for mobile: clock-in, leave apply, payslip view.

### 17. AI Assistant Enhancement
The AI chat endpoint (`POST /api/ai/chat`) exists. Expand it to answer HR-specific questions like:
- "How many leave days do I have left?"
- "Show me my last 3 payslips"
- "Who is on leave this week?"

This makes the AI genuinely useful instead of a generic chat widget.

### 18. Two-Factor Authentication (2FA) for All Roles
The `2fa.service.ts` exists and the frontend already handles the `REQUIRES_2FA` signal from the login API. But 2FA is not enforced for any role. Make it **mandatory for Super Admin** and optional for others.

### 19. Google Sheets Sync — Automate It
The `googleSheets.service.ts` and `POST /api/admin/sync/sheets` exist but the sync is manual. Set up a **daily cron job** to automatically push employee and attendance data to Google Sheets so management can track data without logging into the HRMS.

### 20. Rate Limiting on Auth Endpoints
Currently `POST /api/auth/login` has no rate limit. A brute-force attack could guess passwords. Add `express-rate-limit` to the auth routes:
```ts
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/auth/login', loginLimiter);
```

---

## Summary Table

| # | Suggestion | Priority | Effort | Impact |
|---|---|:---:|:---:|:---:|
| 1 | Fix fake random chart data | 🔴 Critical | Low | High |
| 2 | Fix performance tab placeholder | 🔴 Critical | Low | Medium |
| 3 | Remove duplicate health route | 🔴 Critical | Low | Low |
| 4 | Employee export CSV/PDF button | 🟡 Quick Win | Low | High |
| 5 | Fix forgot password flow | 🟡 Quick Win | Low | Medium |
| 6 | Add pagination to employee list | 🟡 Quick Win | Medium | High |
| 7 | Real notification count on bell | 🟡 Quick Win | Low | Medium |
| 8 | Payslip PDF download button | 🟡 Quick Win | Low | High |
| 9 | Employee profile photo upload | 🟢 Enhancement | Medium | Medium |
| 10 | Auto yearly leave balance reset | 🟢 Enhancement | Low | High |
| 11 | Custom holiday management UI | 🟢 Enhancement | Low | Medium |
| 12 | Attendance correction approval | 🟢 Enhancement | Medium | High |
| 13 | Real-time push notifications | 🟢 Enhancement | Medium | High |
| 14 | Recruitment pipeline in sidebar | 🟢 Enhancement | Low | High |
| 15 | Audit log for HR Manager | 🟢 Enhancement | Medium | Medium |
| 16 | PWA / Mobile support | 🔵 Roadmap | High | High |
| 17 | AI assistant enhancement | 🔵 Roadmap | High | High |
| 18 | Enforce 2FA for Super Admin | 🔵 Roadmap | Medium | High |
| 19 | Google Sheets auto-sync cron | 🔵 Roadmap | Low | Medium |
| 20 | Rate limiting on login API | 🔵 Roadmap | Low | High |

---

> **Recommendation:** Start with items 1, 2, 4, and 14 — they take less than an hour each and have high visibility impact. Let me know which ones you'd like me to implement!
