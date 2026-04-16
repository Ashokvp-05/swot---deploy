
import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCalendarData = async (req: Request, res: Response) => {
    try {
        const { start, end } = req.query;

        // Default to current month if not provided
        const startDate = start ? new Date(start as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = end ? new Date(end as string) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        // 1. Fetch Approved Leaves
        const leaves = await prisma.leaveRequest.findMany({
            where: {
                status: 'APPROVED',
                OR: [
                    { startDate: { gte: startDate, lte: endDate } },
                    { endDate: { gte: startDate, lte: endDate } },
                    { AND: [{ startDate: { lte: startDate } }, { endDate: { gte: endDate } }] }
                ]
            },
            include: { user: { select: { name: true } } }
        });

        // 2. Fetch Holidays
        const holidays = await prisma.holiday.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            }
        });

        // 3. Fetch Company Events (Announcements with eventDate)
        const events = await prisma.announcement.findMany({
            where: {
                eventDate: { gte: startDate, lte: endDate }
            }
        });

        // Map to a unified event format for the frontend calendar
        const calendarEvents = [
            ...leaves.map(l => ({
                id: `leave-${l.id}`,
                title: `${l.user.name} (On Leave)`,
                start: l.startDate,
                end: l.endDate,
                type: 'LEAVE',
                color: 'blue'
            })),
            ...holidays.map(h => ({
                id: `holiday-${h.id}`,
                title: h.name,
                start: h.date,
                end: h.date,
                type: 'HOLIDAY',
                color: 'red'
            })),
            ...events.map(e => ({
                id: `event-${e.id}`,
                title: e.title,
                start: e.eventDate,
                end: e.eventDate,
                type: 'EVENT',
                color: 'purple'
            }))
        ];

        res.json(calendarEvents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
