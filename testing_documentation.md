# SWOT HRMS — Role-Based Testing Documentation

**Application URL:** https://hr.swotpam.com/  
**Document Version:** 1.0  
**Prepared For:** QA / Testing Team  
**Date:** May 1, 2026

---

> [!IMPORTANT]
> All test credentials below are for the **production environment** at `hr.swotpam.com`. Use them carefully. Any data created during testing will affect the live database.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Role Summary Matrix](#2-role-summary-matrix)
3. [Role 1 — Super Admin](#3-role-1--super-admin)
4. [Role 2 — HR Manager](#4-role-2--hr-manager)
5. [Role 3 — Manager](#5-role-3--manager)
6. [Role 4 — Employee](#6-role-4--employee)
7. [Cross-Role Access Control Tests](#7-cross-role-access-control-tests)
8. [Common Test Flows](#8-common-test-flows)

---

## 1. System Overview

SWOT HRMS is a multi-role Human Resource Management System. The application enforces **Role-Based Access Control (RBAC)** both on the frontend (UI visibility) and backend (API authorization). Each role has a distinct dashboard and a specific set of permitted actions.

### Architecture at a Glance

| Layer | Technology |
|---|---|
| Frontend | Next.js (deployed at `hr.swotpam.com`) |
| Backend API | Node.js / Express (`hr.swotpam.com/api`) |
| Database | PostgreSQL (internal) |
| Tunnel | Cloudflare Tunnel |
| Auth | JWT + NextAuth sessions |

---

## 2. Role Summary Matrix

| Feature | Super Admin | HR Manager | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| **Login URL** | `/login` | `/login` | `/login` | `/login` |
| **Dashboard Route** | `/admin` | `/manager` | `/admin` | `/employee` |
| **Add Employees** | ✅ | ✅ | ❌ | ❌ |
| **View All Employees** | ✅ | ✅ | ✅ (read) | ❌ |
| **Approve Leave** | ✅ | ✅ | ✅ | ❌ |
| **Apply for Leave** | ❌ | ❌ | ❌ | ✅ |
| **Payroll Management** | ✅ | ✅ | View Only | View Own |
| **View Own Payslips** | ❌ | ❌ | ❌ | ✅ |
| **Performance Reviews** | ✅ | ✅ | ✅ (submit) | ✅ (submit) |
| **Department Management** | ✅ | ✅ | View Only | ❌ |
| **Announcements (Create)** | ✅ | ✅ | ✅ | ❌ |
| **Documents (All)** | ✅ | ✅ | ❌ | Own Only |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ❌ | ❌ | ❌ |
| **Support Tickets** | ✅ (manage) | ✅ (manage) | Raise Only | Raise Only |
| **Clock In / Clock Out** | ❌ | ❌ | ❌ | ✅ |
| **Reports & Analytics** | ✅ | ✅ | ✅ | ❌ |
| **Broadcast/Announcements** | ✅ | ✅ | ✅ | ❌ |
| **Dept Reports** | ✅ | ❌ | ❌ | ❌ |
| **User Activation/Deactivation** | ✅ | ✅ | ❌ | ❌ |
| **Delete Employee** | ✅ | ❌ | ❌ | ❌ |
| **Reset Password (others)** | ✅ | ❌ | ❌ | ❌ |
| **System Lockdown** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Role 1 — Super Admin

### Credentials

| Field | Value |
|---|---|
| **Email** | `admin@default.com` |
| **Password** | `Admin@123` |
| **Role Code** | `SUPER_ADMIN` |
| **Dashboard** | `https://hr.swotpam.com/admin` |

### Description

The Super Admin is the **highest authority** in the system. This role bypasses company-level tenant guards and has unrestricted access to all backend API endpoints. The Super Admin account is not tied to any specific company and can manage the entire platform.

> [!NOTE]
> Super Admin bypasses the `tenantGuard` middleware — it can access data across all companies in the system.

### Accessible Modules (Sidebar Navigation)

| Module | Tab | Description |
|---|---|---|
| **Dashboard** | `dashboard` | Executive metrics — total employees, attendance overview, payroll summary, system health |
| **Manage Employees** | `employees` | View, edit, activate/deactivate all employees |
| **Attendance** | `attendance` | View real-time attendance across all users |
| **Leaves** | `leave` | View & approve/reject all leave requests; present/absent employee list |
| **Employee Info** | `employee-details` | Secure detailed record view of individual employees |
| **Reports** | `reports` | Company-wide analytics and reports |
| **Help / Support** | `support` | View and manage all support tickets |
| **Announcements** | `broadcasts` | Create and delete company-wide announcements |
| **Department Reports** | `dept-reports` | Detailed reports segmented by department |

> [!NOTE]
> Super Admin does **NOT** see: `Add Employees (Onboarding)`, `Payroll`, `Departments`, `Performance`, `Documents`, or `Settings` tabs. These are excluded intentionally — payroll and sensitive HR operations are delegated to HR Manager.

### What Super Admin CAN Do (Permitted Actions)

#### User Management
- ✅ View the full employee list across the company
- ✅ Activate or deactivate any user account (`PATCH /api/admin/users/:id/status`)
- ✅ Delete any employee record (`DELETE /api/admin/users/:id`)
- ✅ Reset another user's password (`PATCH /api/admin/users/:id/reset-password`)
- ✅ View pending/unverified user registrations
- ✅ Approve or reject pending users

#### Attendance
- ✅ View real-time attendance — who is present vs. absent today
- ✅ View historical attendance records

#### Leave Management
- ✅ View all leave requests (all employees)
- ✅ Approve leave requests
- ✅ Reject leave requests

#### Announcements
- ✅ Create new company-wide announcements/broadcasts
- ✅ Delete existing announcements

#### Reports
- ✅ View overall company metrics
- ✅ Access department-level reports

#### Support
- ✅ View all tickets raised by employees
- ✅ Manage and update ticket status

#### Audit & Security
- ✅ System lockdown: when activated, all non-super-admin users are denied API access (`503 System In Lockdown`)
- ✅ Access to audit logs (security events)

### What Super Admin CANNOT Do

- ❌ Cannot clock in/clock out (no time-tracking for admin)
- ❌ Cannot apply for personal leave
- ❌ Cannot view personal payslips (no salary record linked)
- ❌ Cannot manage payroll batches (delegated to HR Manager)
- ❌ Cannot access Onboarding/Add Employee form (excluded from nav)

### Test Scenarios for Super Admin

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| SA-01 | Login with valid credentials | Go to `/login`, enter `admin@default.com` / `Admin@123`, click Login | Redirected to `/admin?tab=dashboard` |
| SA-02 | Dashboard loads executive metrics | After login, observe the dashboard | Should display employee count, attendance summary, system vitals |
| SA-03 | View employee list | Click **Manage Employees** in sidebar | Table of all employees with status, department, role |
| SA-04 | Activate/Deactivate a user | In employee list, find a user, toggle their status | User status updates to ACTIVE / INACTIVE |
| SA-05 | View Attendance | Click **Attendance** tab | Real-time attendance records shown |
| SA-06 | View Present/Absent | Click **Leaves** then expand dropdown | Two sub-tabs: "Present" and "Absent" with employee counts |
| SA-07 | Approve a leave request | Go to **Leaves** tab, find pending request, click Approve | Leave status changes to APPROVED |
| SA-08 | Create an announcement | Go to **Announcements**, fill form, submit | Announcement appears in broadcast list; employees see it in their dashboard |
| SA-09 | View Department Reports | Click **Department Reports** | Report breakdown by department is visible |
| SA-10 | View Support Tickets | Click **Help** | All tickets from all employees visible; can update status |
| SA-11 | Try accessing `/employee` route | Manually type `hr.swotpam.com/employee` in URL | Should be redirected to `/admin` (admin roles are routed to admin panel) |

---

## 4. Role 2 — HR Manager

### Credentials

| Field | Value |
|---|---|
| **Email** | `hr@hrms.com` |
| **Password** | `HR@123` |
| **Role Code** | `HR_MANAGER` |
| **Dashboard** | `https://hr.swotpam.com/manager` |

### Description

The HR Manager is the **primary HR operations role**. This role has the broadest functional access after Super Admin. HR Managers handle the full employee lifecycle — onboarding, payroll, leave, attendance, performance, and document management. They are **company-scoped** (can only see data for their own company).

### Accessible Modules (Sidebar Navigation)

| Module | Tab | Description |
|---|---|---|
| **Dashboard** | `dashboard` | HR operational overview: headcount, pending tasks, recent activity |
| **Employee Management** | `employees` | Full CRUD on employees within their company |
| **Onboarding** | `onboarding` | Register new employees into the system |
| **Attendance** | `attendance` | View and manage company-wide attendance |
| **Leaves** | `leaves` | View and approve/reject leave requests |
| **Payroll** | `payroll` | Full payroll management — create batches, generate payslips |
| **Departments** | `departments` | Create and manage departments, designations, branches |
| **Announcements** | `announcements` | Create and manage company announcements |
| **Documents** | `documents` | View all employee documents; upload/delete |
| **Reports** | `reports` | Analytics and workforce reports |
| **Support Desk** | `support` | Manage employee support tickets |
| **Settings** | `settings` | Company-level system settings |
| **Performance** | `performance` | View and manage employee performance reviews |

### What HR Manager CAN Do (Permitted Actions)

#### Employee Management
- ✅ View all employees in the company
- ✅ Create new employee records (Onboarding)
- ✅ Edit employee profiles (name, department, designation, etc.)
- ✅ Update employee salary configuration (`/api/admin/users/:id/salary-config`)
- ✅ Activate or deactivate employees (`/api/admin/users/:id/status`)
- ✅ Update employee leave balances

#### Payroll
- ✅ View payroll statistics and summaries
- ✅ View all payroll batches
- ✅ **Create new payroll batches** (`POST /api/payroll/batches`)
- ✅ **Generate payslips** for a batch (`POST /api/payroll/batches/:id/generate`)
- ✅ **Change batch status** (Draft → Processing → Paid)
- ✅ View and update employee salary configs, bank details, tax details

#### Attendance
- ✅ View all attendance records
- ✅ Monitor present/absent employees

#### Leave Management
- ✅ View all leave requests
- ✅ Approve leave requests
- ✅ Reject leave requests

#### Documents
- ✅ View **all employee documents** in the company (`GET /api/documents`)
- ✅ Upload new documents
- ✅ Delete any employee's document

#### Performance
- ✅ Create KPIs (`POST /api/performance/kpi`)
- ✅ View all performance reviews
- ✅ Update review status (DRAFT → SUBMITTED → FINALIZED)
- ✅ View team/department performance

#### Announcements
- ✅ Create announcements
- ✅ Delete announcements

#### Reports
- ✅ Access company-wide HR reports and analytics

#### Support
- ✅ View and manage all support tickets

#### Settings
- ✅ Access and modify company-level system settings

### What HR Manager CANNOT Do

- ❌ Cannot delete employee records (only Super Admin and Company Admin can)
- ❌ Cannot reset another user's password (Super Admin only)
- ❌ Cannot view data outside their company (company-scoped)
- ❌ Cannot access system audit logs
- ❌ Cannot activate system lockdown
- ❌ Cannot view Department Reports (Super Admin exclusive tab)

### Test Scenarios for HR Manager

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| HR-01 | Login with valid credentials | Go to `/login`, enter `hr@hrms.com` / `HR@123` | Redirected to `/manager?tab=dashboard` |
| HR-02 | Dashboard loads | Observe dashboard after login | HR operational metrics displayed |
| HR-03 | Add a new employee | Click **Onboarding**, fill in employee details, submit | New employee created; appears in employee list |
| HR-04 | Edit an employee | Go to **Employee Management**, select a user, edit a field | Changes saved successfully |
| HR-05 | Create payroll batch | Go to **Payroll**, click "New Batch", select month/year | Batch created in DRAFT status |
| HR-06 | Generate payslips | In Payroll, open a DRAFT batch, click "Generate Payslips" | Payslips generated for all employees in batch |
| HR-07 | Update batch status | Change batch status to PROCESSING then PAID | Status updated, payslips marked as issued |
| HR-08 | Approve a leave | Go to **Leaves**, find PENDING request, approve it | Status changes to APPROVED |
| HR-09 | View all documents | Go to **Documents** | All employee documents visible in list |
| HR-10 | Create announcement | Go to **Announcements**, create a new one | Announcement visible to all employees |
| HR-11 | Finalize a performance review | Go to **Performance**, find SUBMITTED review, finalize | Review status changes to FINALIZED |
| HR-12 | Configure company settings | Go to **Settings** | System settings page loads and is editable |

---

## 5. Role 3 — Manager

### Credentials

| Field | Value |
|---|---|
| **Email** | `dev_lead@hrms.com` |
| **Password** | `Manager@123` |
| **Role Code** | `MANAGER` |
| **Dashboard** | `https://hr.swotpam.com/admin` (with limited tabs) |

### Description

The Manager role is for **team leads and department managers**. They can oversee their team's attendance and leave, but have read-only or limited write access compared to HR Manager. They access the admin panel but only see tabs relevant to their operational needs.

> [!NOTE]
> Managers land on `/admin` dashboard (same as Super Admin and HR Admin) but their sidebar only shows tabs permitted for their role. The UI dynamically filters navigation based on the role.

### Accessible Modules (Sidebar Navigation)

| Module | Tab | Available To Manager |
|---|---|---|
| **Dashboard** | `dashboard` | ✅ Executive summary |
| **Manage Employees** | `employees` | ✅ View all employees (limited edit) |
| **Attendance** | `attendance` | ✅ View attendance |
| **Leaves** | `leave` | ✅ View & approve/reject |
| **Employee Info** | `employee-details` | ✅ Read-only employee records |
| **Reports** | `reports` | ✅ Workforce reports |
| **Task Dashboard** | External link | ✅ Links to `task.swotpam.com` |

> [!NOTE]
> Managers do **NOT** see: Onboarding (Add Employees), Payroll (full management), Departments, Documents (all), Settings, Announcements center, or Dept Reports tabs.

### What Manager CAN Do (Permitted Actions)

#### Employee Oversight
- ✅ View the full employee list (`GET /api/admin/employees`)
- ✅ View detailed employee info (read-only)
- ✅ Edit basic employee details (`PATCH /api/admin/employees/:id` — limited fields)

#### Attendance
- ✅ View company-wide attendance records
- ✅ Monitor present/absent status

#### Leave Management
- ✅ View all leave requests
- ✅ **Approve** leave requests
- ✅ **Reject** leave requests

#### Payroll (View Only)
- ✅ View payroll batch summaries
- ✅ View salary configurations
- ✅ View bank and tax details
- ❌ Cannot create batches, generate payslips, or change batch status

#### Performance
- ✅ Submit performance reviews for team members (`POST /api/performance/review`)
- ✅ View own performance reviews
- ❌ Cannot create KPIs or finalize reviews (HR-only)

#### Announcements
- ✅ Create announcements (`POST /api/announcements`)
- ✅ Delete announcements

#### Reports
- ✅ View company-wide workforce reports and analytics

#### Support Tickets
- ✅ Raise a support ticket (like any user)
- ✅ View own tickets
- ❌ Cannot manage/assign other employees' tickets

### What Manager CANNOT Do

- ❌ Cannot add new employees (Onboarding tab excluded)
- ❌ Cannot manage payroll (create batches, generate payslips)
- ❌ Cannot view all documents (document view restricted to SUPER_ADMIN and HR_MANAGER)
- ❌ Cannot access system settings
- ❌ Cannot delete employees
- ❌ Cannot reset passwords
- ❌ Cannot view audit logs or security dashboard
- ❌ Cannot activate system lockdown

### Test Scenarios for Manager

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| MG-01 | Login with valid credentials | Go to `/login`, enter `dev_lead@hrms.com` / `Manager@123` | Redirected to `/admin?tab=dashboard` |
| MG-02 | Verify sidebar is role-filtered | Observe sidebar after login | Should NOT see: Onboarding, Payroll, Departments, Settings, Documents, Announcements |
| MG-03 | View employee list | Click **Manage Employees** | Employee list visible with read access |
| MG-04 | View attendance | Click **Attendance** tab | Attendance records visible |
| MG-05 | Approve a leave | Click **Leaves**, find PENDING, approve | Status changes to APPROVED |
| MG-06 | Access Reports | Click **Reports** | Report analytics page loads |
| MG-07 | Submit a performance review | Via API or if UI available, submit review | Review created in DRAFT status |
| MG-08 | Try to access Payroll directly | Manually navigate to `/admin?tab=payroll` | Tab should not be rendered (UI protection) |
| MG-09 | Try to create employee via API | `POST /api/admin/employees` with Manager token | `403 Access denied: Insufficient permissions` |
| MG-10 | Open Task Dashboard | Click **Task Dashboard** link | Opens `task.swotpam.com` in new context |

---

## 6. Role 4 — Employee

### Credentials

| Field | Value |
|---|---|
| **Email** | `employee@hrms.com` |
| **Password** | `Employee@123` |
| **Role Code** | `EMPLOYEE` |
| **Dashboard** | `https://hr.swotpam.com/employee` |

### Description

The Employee role is the **standard end-user role**. Employees interact with their own personal HR data: clock in/out, apply for leave, view payslips, manage their documents, and submit support tickets. They have **no access** to any other employee's data.

### Accessible Modules (Employee Dashboard)

| Widget / Module | Description |
|---|---|
| **Clock In / Clock Out** | Mark daily attendance; start/stop timer |
| **Leave Requests** | Apply for leave; view own leave history and balances |
| **Payslips** | View own monthly payslips |
| **Documents** | Upload and view own documents (ID proof, contracts, etc.) |
| **Announcements** | Read company announcements (read-only) |
| **Support Tickets** | Raise new support tickets; view own tickets and add comments |
| **Performance Reviews** | Submit own self-assessment; view own review history |
| **Kudos** | Send/receive kudos to/from colleagues |
| **Team Calendar** | View shared team calendar and upcoming events |
| **Holiday Calendar** | View company holidays |
| **Attendance History** | View own attendance logs |
| **Mood / Wellness Pulse** | Submit daily wellness check-in |
| **Profile** | View and edit own personal profile |
| **Notifications** | Receive system notifications |

### What Employee CAN Do (Permitted Actions)

#### Attendance (Time Tracking)
- ✅ Clock In (`POST /api/attendance/clock-in`)
- ✅ Clock Out (`POST /api/attendance/clock-out`)
- ✅ View own attendance history
- ✅ View monthly attendance summary

#### Leave Management
- ✅ Apply for leave (`POST /api/leave/request`)
- ✅ View own leave requests (`GET /api/leave/my-requests`)
- ✅ View own leave balance (`GET /api/leave/balance`) — shows Casual, Sick, Earned leave remaining

#### Payslips
- ✅ View own payslips (`GET /api/payroll/my-payslips`)
- ✅ Download payslip PDF

#### Documents
- ✅ Upload own documents (`POST /api/documents`)
- ✅ View own documents (`GET /api/documents/my`)
- ✅ Delete own documents (`DELETE /api/documents/:id`)
- ❌ Cannot view other employees' documents

#### Performance
- ✅ Submit own performance review/self-assessment (`POST /api/performance/review`)
- ✅ View own reviews (`GET /api/performance/my-reviews`)
- ❌ Cannot view other employees' reviews

#### Support Tickets
- ✅ Create a new ticket (`POST /api/tickets`)
- ✅ View own tickets (`GET /api/tickets`)
- ✅ Add comments to own ticket (`POST /api/tickets/:id/comments`)
- ❌ Cannot assign or update ticket status

#### Announcements
- ✅ Read all announcements
- ❌ Cannot create or delete announcements

#### Kudos
- ✅ Send kudos to a colleague
- ✅ View received kudos

### What Employee CANNOT Do

- ❌ Cannot access `/admin` or `/manager` dashboards (redirected to `/employee`)
- ❌ Cannot view other employees' data (leave, payslips, attendance, documents)
- ❌ Cannot approve/reject leave requests
- ❌ Cannot manage payroll
- ❌ Cannot add or edit other users
- ❌ Cannot create announcements
- ❌ Cannot access system settings or audit logs
- ❌ Cannot delete anyone else's documents

### Test Scenarios for Employee

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| EMP-01 | Login with valid credentials | Go to `/login`, enter `employee@hrms.com` / `Employee@123` | Redirected to `/employee` dashboard |
| EMP-02 | Clock In | Click **Clock In** button on the dashboard widget | Timer starts; clock-in recorded with timestamp |
| EMP-03 | Clock Out | After clocking in, click **Clock Out** | Session ended; total hours logged for the day |
| EMP-04 | Apply for Leave | Go to Leave section, select type, dates, submit | Leave request created with PENDING status |
| EMP-05 | View Leave Balance | Open leave section | Shows remaining Casual / Sick / Earned leave days |
| EMP-06 | View own payslip | Go to Payslips section | Own payslips listed; click to view detailed breakdown |
| EMP-07 | Upload a document | Go to Documents, click Upload, select a file | Document appears in own document list |
| EMP-08 | Submit a support ticket | Click the floating "Help" button or go to Support | Ticket created; visible in own ticket list |
| EMP-09 | View announcements | Check announcements widget | Company announcements displayed read-only |
| EMP-10 | Send kudos | Go to Kudos section, select a colleague, send | Kudos sent; recipient receives notification |
| EMP-11 | Try to access Admin page | Manually type `hr.swotpam.com/admin` | Redirected to `/employee` (access denied) |
| EMP-12 | Try to access another employee's data via API | Call `GET /api/documents` with Employee token | `403 Forbidden` returned |
| EMP-13 | Submit performance self-review | Go to Performance section, fill form, submit | Review submitted in DRAFT status |
| EMP-14 | View attendance history | Go to Attendance History tab | Own daily logs shown in calendar/table view |

---

## 7. Cross-Role Access Control Tests

These tests verify that the RBAC boundaries are correctly enforced. The **expected result for all tests in this section is a `403 Forbidden` or redirect**.

| # | Test | Tested As | Action | Expected Response |
|---|---|---|---|---|
| RBAC-01 | Employee tries to view all employees | Employee | `GET /api/admin/employees` | `403 Forbidden` |
| RBAC-02 | Employee tries to approve leave | Employee | `PUT /api/leave/:id/approve` | `403 Forbidden` |
| RBAC-03 | Employee tries to create payroll batch | Employee | `POST /api/payroll/batches` | `403 Forbidden` |
| RBAC-04 | Employee tries to access admin UI | Employee | Navigate to `/admin` | Redirected to `/employee` |
| RBAC-05 | Manager tries to create a new employee | Manager | `POST /api/admin/employees` | `403 Forbidden` |
| RBAC-06 | Manager tries to delete an employee | Manager | `DELETE /api/admin/users/:id` | `403 Forbidden` |
| RBAC-07 | Manager tries to view all documents | Manager | `GET /api/documents` | `403 Forbidden` |
| RBAC-08 | Manager tries to reset a password | Manager | `PATCH /api/admin/users/:id/reset-password` | `403 Forbidden` |
| RBAC-09 | HR Manager tries to access another company's data | HR Manager | Add `x-company-id: other_company_id` header | `403 Company mismatch` |
| RBAC-10 | Expired/invalid token access | Any role | Use an old or invalid JWT | `401 Invalid token` or `401 Session expired` |

---

## 8. Common Test Flows

### Flow A: Full Employee Lifecycle (HR Manager → Employee)

```
1. Login as HR Manager (hr@hrms.com)
2. Go to Onboarding → Add a new employee with a test email
3. Note the new employee's ID
4. Login as Super Admin (admin@default.com)
5. Go to Manage Employees → find the new user → Activate their account
6. Login as the new employee (if you set a password during onboarding)
7. Verify the employee can clock in and view their empty payslip list
8. Login as HR Manager → Go to Payroll → Create a batch → Generate payslips
9. Login as employee → Verify payslip now appears in Payslips section
10. Login as employee → Apply for 1 day leave
11. Login as Manager (dev_lead@hrms.com) → Go to Leaves → Approve the request
12. Login as employee → Verify leave status is now APPROVED
```

### Flow B: Leave Request Cycle

```
1. Login as Employee (employee@hrms.com)
2. Apply for 2 days Casual Leave
3. Login as HR Manager (hr@hrms.com)
4. Go to Leaves → Find the PENDING request → Reject it with a reason
5. Login as Employee → Verify leave shows as REJECTED
6. Apply again as employee
7. Login as Manager (dev_lead@hrms.com) → Approve the leave
8. Login as Employee → Confirm APPROVED status and reduced leave balance
```

### Flow C: Payroll Processing

```
1. Login as HR Manager
2. Go to Payroll → Create New Batch (select current month)
3. Click Generate Payslips for the batch
4. Change batch status to PROCESSING
5. Change batch status to PAID
6. Login as Employee → Go to Payslips → Verify payslip is visible with correct amounts
```

### Flow D: Support Ticket Flow

```
1. Login as Employee
2. Click the floating Help button (bottom of screen)
3. Create a new support ticket: Category = "IT Issue", describe the problem
4. Login as Super Admin or HR Manager
5. Go to Help / Support tab
6. Find the ticket → Add a comment → Change status to "In Progress"
7. Login as Employee → Verify the status update and admin comment are visible
```

---

> [!TIP]
> When testing, use your browser's Developer Tools (F12) → **Network tab** to verify actual API calls and their HTTP status codes. This confirms backend RBAC is working independently from the UI.

> [!WARNING]
> Do not delete any real employee records during testing unless using a dedicated test account. Changes made on `hr.swotpam.com` are **live production data**.

---

*End of Document — SWOT HRMS Testing Guide v1.0*
