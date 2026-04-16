import prisma from '../config/db';
import { TimeEntryStatus, ClockType } from '@prisma/client';

export const getActiveEntry = async (userId: string, companyId: string) => {
    return prisma.timeEntry.findFirst({
        where: {
            userId,
            companyId,
            status: TimeEntryStatus.ACTIVE
        }
    });
};

export const clockIn = async (userId: string, companyId: string, type: ClockType, location?: any, isOnCall: boolean = false) => {
    // Check if already clocked in
    const active = await getActiveEntry(userId, companyId);
    if (active) {
        const duration = Math.floor((new Date().getTime() - active.clockIn.getTime()) / (1000 * 60));
        throw new Error(`Already clocked in ${duration} minutes ago. Please clock out first.`);
    }

    // Validate clock type
    if (!Object.values(ClockType).includes(type)) {
        throw new Error('Invalid clock type. Must be IN_OFFICE, REMOTE, or HYBRID');
    }

    return prisma.timeEntry.create({
        data: {
            userId,
            companyId,
            clockIn: new Date(),
            clockType: type,
            location: location || {},
            status: TimeEntryStatus.ACTIVE,
            isOnCall
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
};

export const clockOut = async (userId: string, companyId: string, customClockOut?: Date) => {
    const active = await getActiveEntry(userId, companyId);
    if (!active) {
        throw new Error('No active clock-in session found. Please clock in first.');
    }

    const clockOutTime = customClockOut || new Date();
    const diffInMs = clockOutTime.getTime() - active.clockIn.getTime();
    const hoursWorked = diffInMs / (1000 * 60 * 60);

    // Validate minimum time (reduced for development/testing flexibility)
    if (hoursWorked < 0.0014) { // Less than 5 seconds
        throw new Error('Please wait at least 5 seconds before clocking out');
    }

    // Check for excessive hours (>24 hours) - cap it if it's over 24
    let recordedHours = hoursWorked;
    if (hoursWorked > 24) {
        recordedHours = 24.00; // Cap at 24 hours for safety
        console.warn(`Unusual work duration detected: ${hoursWorked.toFixed(2)} hours for userId: ${userId}. Capping at 24.00 hours.`);
    }

    return prisma.timeEntry.update({
        where: { id: active.id },
        data: {
            clockOut: clockOutTime,
            hoursWorked: Number(recordedHours.toFixed(2)),
            status: TimeEntryStatus.COMPLETED
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
};

export const getHistory = async (userId: string, companyId: string, limit = 10, skip = 0, month?: number, year?: number) => {
    let where: any = { userId, companyId };

    if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        where.clockIn = {
            gte: startDate,
            lte: endDate
        };
    }

    return prisma.timeEntry.findMany({
        where,
        orderBy: { clockIn: 'desc' },
        take: limit,
        skip: skip
    });
};

export const getSummary = async (userId: string, companyId: string) => {
    // Basic Weekly Summary (last 7 days)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId,
            companyId,
            clockIn: {
                gte: startOfWeek
            },
            status: { in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.ACTIVE] }
        }
    });

    let totalHours = 0;
    let daysWorked = new Set();
    let overtimeHours = 0; // Simple threshold > 9 hours per day

    const dayMap: { [key: string]: number } = {};
    entries.forEach(entry => {
        const duration = entry.hoursWorked ? Number(entry.hoursWorked) : 0;
        totalHours += duration;

        const dayKey = entry.clockIn.toISOString().split('T')[0];
        daysWorked.add(dayKey);
        dayMap[dayKey] = (dayMap[dayKey] || 0) + duration;

        if (duration > 9) {
            overtimeHours += (duration - 9);
        }
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        chartData.push({
            date: dateKey,
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
            hours: Number((dayMap[dateKey] || 0).toFixed(1))
        });
    }

    return {
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        daysWorked: daysWorked.size,
        chartData
    };
};

export const getReport = async (companyId: string, startDate: Date, endDate: Date, userId?: string, departmentId?: string) => {
    return prisma.timeEntry.findMany({
        where: {
            companyId,
            userId: userId ? userId : undefined,
            user: departmentId ? { department: { name: departmentId } } : undefined,
            clockIn: {
                gte: startDate,
                lte: endDate
            },
            status: { in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.ACTIVE] }
        },
        include: {
            user: {
                select: { name: true, email: true, department: { select: { name: true } } }
            }
        },
        orderBy: { clockIn: 'desc' }
    });
};

export const getAllActiveUsers = async (companyId: string) => {
    return prisma.timeEntry.findMany({
        where: {
            companyId,
            status: TimeEntryStatus.ACTIVE
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            clockIn: 'desc'
        }
    });
};

export const getMonthlyWorkStats = async (userId: string, companyId: string, month: string, year: number) => {
    // Correctly parse month name to 0-indexed month
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);

    if (monthIndex === -1) throw new Error("Invalid month name");

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of month

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId,
            companyId,
            clockIn: {
                gte: startDate,
                lte: endDate
            },
            status: { in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.ACTIVE] }
        }
    });

    let totalHours = 0;
    const daysWorkedSet = new Set();

    entries.forEach(entry => {
        const duration = entry.hoursWorked ? Number(entry.hoursWorked) : 0;
        totalHours += duration;
        daysWorkedSet.add(entry.clockIn.toISOString().split('T')[0]);
    });

    // Calculate total days in month
    const totalDaysInMonth = endDate.getDate();

    // Calculate business days in month (Mon-Fri)
    let businessDays = 0;
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
        const day = tempDate.getDay();
        if (day !== 0 && day !== 6) businessDays++;
        tempDate.setDate(tempDate.getDate() + 1);
    }

    return {
        totalHours: totalHours.toFixed(2),
        daysWorked: daysWorkedSet.size,
        totalDays: totalDaysInMonth,
        businessDays: businessDays
    };
};
