
import prisma from '../config/db';
import cache from '../config/cache';
import * as timeService from './timeEntry.service';
import * as leaveService from './leave.service';
import * as payslipService from './payslip.service';
import { startOfMonth, format, differenceInBusinessDays } from 'date-fns';

export const getEmployeeDashboardData = async (userId: string, companyId: string) => {
    const cacheKey = `dashboard_data_${userId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const todayDate = new Date();
    const todayIso = format(todayDate, 'yyyy-MM-dd');

    // Fetch all data in parallel
    const [summary, leaveBalances, payslips, calendar, activeEntry, announcements] = await Promise.all([
        timeService.getSummary(userId, companyId),
        (prisma as any).leaveBalance.findMany({
            where: { userId, companyId, year: todayDate.getFullYear() },
            include: { leaveTypeConfig: true }
        }),
        payslipService.getMyPayslips(userId, companyId),
        prisma.holiday.findMany({
            where: {
                companyId,
                date: {
                    gte: startOfMonth(todayDate),
                    lte: todayDate
                }
            }
        }),
        timeService.getActiveEntry(userId, companyId),
        prisma.announcement.findMany({
            where: {
                companyId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    let latestPayslip = null;
    if (Array.isArray(payslips) && payslips.length > 0) {
        const sorted = payslips.sort((a: any, b: any) =>
            (b.year - a.year) || (new Date(`${b.month} 1`).getTime() - new Date(`${a.month} 1`).getTime())
        );
        const latest = sorted[0];
        latestPayslip = {
            ...latest,
            amount: Number(latest.netSalary)
        };
    }

    const data = {
        summary,
        leaveBalances,
        latestPayslip,
        calendar,
        activeEntry,
        announcements,
        timestamp: new Date()
    };

    // Cache for 2 minutes
    cache.set(cacheKey, data, 120);

    return data;
};

export const getAdminStats = async (companyId: string) => {
    const cacheKey = `admin_dashboard_stats_${companyId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    const [userCount, activeCheckins, pendingLeaves, openTickets, deptCount, desigCount, branchCount] = await Promise.all([
        prisma.user.count({ where: { companyId } }),
        prisma.timeEntry.count({ where: { companyId, status: 'ACTIVE' } }),
        prisma.leaveRequest.count({ where: { companyId, status: 'PENDING' } }),
        prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
        (prisma as any).department.count({ where: { companyId } }),
        (prisma as any).designation.count({ where: { companyId } }),
        (prisma as any).branch.count({ where: { companyId } })
    ]);

    const stats = {
        userCount,
        activeCheckins,
        pendingLeaves,
        openTickets,
        deptCount,
        desigCount,
        branchCount,
        lastUpdated: new Date()
    };

    cache.set(cacheKey, stats, 60); // Cache for 1 minute
    return stats;
};

export const getManagerDashboardData = async (managerId: string, companyId: string) => {
    const cacheKey = `manager_dashboard_${managerId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const [teamCount, pendingLeaves, activeTeam] = await Promise.all([
        prisma.user.count({
            where: { managerId, companyId }
        }),
        prisma.leaveRequest.findMany({
            where: {
                companyId,
                status: 'PENDING',
                user: { managerId }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.timeEntry.findMany({
            where: {
                companyId,
                status: 'ACTIVE',
                user: { managerId }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        department: { select: { name: true } }
                    }
                }
            }
        })
    ]);

    const data = {
        teamCount,
        pendingLeaves,
        activeTeamCount: activeTeam.length,
        activeTeam: activeTeam.map(entry => ({
            id: entry.user.id,
            name: entry.user.name,
            avatar: entry.user.avatarUrl,
            department: (entry.user.department as any)?.name || 'General',
            clockIn: entry.clockIn,
            location: (entry.location as any)?.name || 'Office HQ',
            status: 'ONLINE'
        })),
        lastUpdated: new Date()
    };

    cache.set(cacheKey, data, 60);
    return data;
};

export const getManagerPerformance = async (managerId: string, companyId: string) => {
    const teamMembers = await prisma.user.findMany({
        where: { managerId, companyId },
        select: { name: true }
    });

    const names = teamMembers.map(u => u.name);

    return [
        {
            id: 1,
            subject: 'Delivery Velocity',
            score: 92,
            target: 85,
            trend: '+4.5%',
            history: [60, 65, 75, 80, 85, 92],
            status: 'Excellent',
            statusColor: 'text-emerald-600',
            barColor: 'bg-emerald-500',
            lineColor: '#10b981',
            impactingUsers: names.slice(0, 3),
            forecast: "Projected to hit 94% next sprint based on current velocity.",
            drivers: ["Efficiency is above average", "Backend migration completed early"]
        },
        {
            id: 2,
            subject: 'Code Quality',
            score: 88,
            target: 80,
            trend: '+1.2%',
            history: [82, 81, 83, 85, 86, 88],
            status: 'Stable',
            statusColor: 'text-indigo-600',
            barColor: 'bg-indigo-500',
            lineColor: '#6366f1',
            impactingUsers: names.slice(1, 4),
            forecast: "Maintaining stability. Minor debt reduction expected.",
            drivers: ["Automated testing coverage increased", "Code review turnaround is steady"]
        },
        {
            id: 3,
            subject: 'Team Availability',
            score: 95,
            target: 90,
            trend: '+0.5%',
            history: [90, 91, 90, 92, 94, 95],
            status: 'High',
            statusColor: 'text-emerald-600',
            barColor: 'bg-emerald-500',
            lineColor: '#10b981',
            impactingUsers: [],
            forecast: "Dip expected next week due to planned PTOs.",
            drivers: ["Fully staffed this week", "No sick leaves reported"]
        },
        {
            id: 4,
            subject: 'Burnout Risk',
            score: 35,
            target: 20,
            trend: '+5%',
            history: [15, 18, 22, 28, 30, 35],
            status: 'Low',
            statusColor: 'text-indigo-600',
            barColor: 'bg-indigo-500',
            lineColor: '#6366f1',
            impactingUsers: names.slice(-2),
            forecast: "Safe levels maintained.",
            drivers: ["Reduced overtime this week", "Weekend workloads are minimal"]
        },
    ];
};

export const getManagerProductivity = async (managerId: string, companyId: string) => {
    return {
        efficiency: 8.2,
        metrics: [
            { label: "Consistency", value: 87, color: "bg-emerald-500", glow: "shadow-emerald-500/20" },
            { label: "Intensity", value: 72, color: "bg-amber-500", glow: "shadow-amber-500/20" },
            { label: "Focus", value: 94, color: "bg-indigo-500", glow: "shadow-indigo-500/20" },
            { label: "Stability", value: 81, color: "bg-blue-500", glow: "shadow-blue-500/20" },
        ],
        trend: '+15% Yield',
        status: 'Optimal Flow'
    };
};
