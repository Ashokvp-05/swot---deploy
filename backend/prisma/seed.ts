import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare const process: any;

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Master Seed...');

    // 1. Subscription Plans
    const plans = [
        { name: 'Starter', price: 29.00, interval: 'MONTHLY' as any, maxUsers: 10, features: { attendance: true, leave: true, mobile: true } },
        { name: 'Professional', price: 99.00, interval: 'MONTHLY' as any, maxUsers: 100, features: { attendance: true, leave: true, mobile: true, payroll: true, reports: true } },
        { name: 'Enterprise', price: 499.00, interval: 'MONTHLY' as any, maxUsers: 1000, features: { all: true } },
    ];

    for (const p of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: p.name },
            update: p,
            create: p,
        });
    }

    const proPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Professional' } });

    // 2. Default Company
    const company = await prisma.company.upsert({
        where: { subdomain: 'default' },
        update: { planId: proPlan?.id },
        create: {
            name: 'Default Company',
            subdomain: 'default',
            domain: 'hrms.com',
            status: 'ACTIVE',
            planId: proPlan?.id,
        },
    });

    // 3. Roles
    async function ensureRole(name: string, permissions: any) {
        return await prisma.role.upsert({
            where: { name_companyId: { name, companyId: company.id } },
            update: { permissions },
            create: { name, companyId: company.id, permissions },
        });
    }

    const roles = {
        SUPER_ADMIN: await ensureRole('SUPER_ADMIN', { all: true }),
        HR_MANAGER: await ensureRole('HR_MANAGER', { 
            manage_employees: true, 
            manage_attendance: true, 
            approve_leave: true,
            manage_payroll: true,
            manage_performance: true,
            manage_documents: true
        }),
        EMPLOYEE: await ensureRole('EMPLOYEE', { self_service: true, clock_in_out: true }),
        AUDITOR: await ensureRole('AUDITOR', { view_audit_logs: true, view_compliance: true }),
        SUPPORT_ADMIN: await ensureRole('SUPPORT_ADMIN', { manage_tickets: true, view_issues: true }),
        MANAGER: await ensureRole('MANAGER', { manage_team: true, approve_leaves: true, view_reports: true }),
    };

    // 4. USERS (The only 6 allowed credentials)
    const userData = [
        { name: 'Viswa S', email: 'viswa.s@rudratic.com', password: 'Swot@12345', roleId: roles.SUPER_ADMIN.id },
        { name: 'Super Admin', email: 'admin@default.com', password: 'Admin@123', roleId: roles.SUPER_ADMIN.id },
        { name: 'HR Manager', email: 'hr@hrms.com', password: 'HR@123', roleId: roles.HR_MANAGER.id },
        { name: 'Manager', email: 'dev_lead@hrms.com', password: 'Manager@123', roleId: roles.MANAGER.id },
        { name: 'Employee', email: 'employee@hrms.com', password: 'Employee@123', roleId: roles.EMPLOYEE.id },
        { name: 'Auditor', email: 'auditor@hr-central.com', password: 'Audit@Secure2026', roleId: roles.AUDITOR.id },
        { name: 'Support Admin', email: 'support@hr-central.com', password: 'Support@Secure2026', roleId: roles.SUPPORT_ADMIN.id },
    ];

    console.log('--- SYNCING PERSONNEL REGISTRY ---');
    for (const u of userData) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        console.log(`- Upserting ${u.name} (${u.email})`);
        
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                password: hashedPassword,
                roleId: u.roleId,
                companyId: company.id,
                status: UserStatus.ACTIVE,
                name: u.name,
            },
            create: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                roleId: u.roleId,
                companyId: company.id,
                status: UserStatus.ACTIVE,
                emailVerified: true,
            },
        });
    }

    // 5. Departments
    console.log('--- SEEDING DEPARTMENTS ---');
    const departments = [
        'Technical Support',
        'Human Resources',
        'DevOps',
        'Internal Audit',
        'Finance',
        'Engineering',
    ];

    for (const name of departments) {
        await prisma.department.upsert({
            where: { name_companyId: { name, companyId: company.id } },
            update: {},
            create: { name, companyId: company.id },
        });
    }
    console.log(`✅ ${departments.length} departments seeded`);

    // 6. Designations (Job Titles)
    console.log('--- SEEDING JOB TITLES ---');
    const designations = [
        'Software Engineer',
        'Product Manager',
        'HR Specialist',
        'Sales Executive',
        'Support Engineer',
        'QA Analyst',
        'DevOps Engineer',
        'Team Lead',
    ];

    for (const name of designations) {
        await prisma.designation.upsert({
            where: { name_companyId: { name, companyId: company.id } },
            update: {},
            create: { name, companyId: company.id },
        });
    }
    console.log(`✅ ${designations.length} job titles seeded`);

    // 7. Leave Type Configs
    console.log('--- SEEDING LEAVE TYPES ---');
    const leaveTypes = [
        { name: 'Sick Leave', code: 'SICK', totalDays: 10 },
        { name: 'Casual Leave', code: 'CASUAL', totalDays: 10 },
        { name: 'Earned Leave', code: 'EARNED', totalDays: 15 },
    ];

    const leaveConfigs = [];
    for (const lt of leaveTypes) {
        const config = await prisma.leaveTypeConfig.upsert({
            where: { code_companyId: { code: lt.code, companyId: company.id } },
            update: { totalDays: lt.totalDays },
            create: { ...lt, companyId: company.id },
        });
        leaveConfigs.push(config);
    }
    console.log(`✅ ${leaveTypes.length} leave types seeded`);

    // 8. Initialize leave balances for ALL existing users (fixes empty leave tiles)
    console.log('--- INITIALIZING LEAVE BALANCES FOR ALL USERS ---');
    const allUsers = await prisma.user.findMany({ where: { companyId: company.id } });
    const currentYear = new Date().getFullYear();
    let balanceCount = 0;

    for (const user of allUsers) {
        for (const config of leaveConfigs) {
            await (prisma as any).leaveBalance.upsert({
                where: {
                    userId_leaveTypeId_year: {
                        userId: user.id,
                        leaveTypeId: config.id,
                        year: currentYear
                    }
                },
                update: {},
                create: {
                    userId: user.id,
                    companyId: company.id,
                    leaveTypeId: config.id,
                    total: config.totalDays,
                    used: 0,
                    pending: 0,
                    year: currentYear
                }
            });
            balanceCount++;
        }
    }
    console.log(`✅ ${balanceCount} leave balance records initialized for ${allUsers.length} users`);

    console.log('✨ Seed completed successfully. All data synchronized.');
}

main()
    .catch((e) => {
        console.error('❌ Seed Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

export {};
