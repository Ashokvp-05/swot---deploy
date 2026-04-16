import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import cache from '../config/cache';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const companyId = user.companyId;
        const cacheKey = `announcements_${companyId}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                companyId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        cache.set(cacheKey, announcements, 3600); // 1 hour
        res.json(announcements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, type, priority, expiresAt, eventDate } = req.body;
        const user = (req as AuthRequest).user;

        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'INFO',
                priority: priority || 'NORMAL',
                createdBy: user.id,
                companyId: user.companyId,
                eventDate: eventDate ? new Date(eventDate) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        cache.del(`announcements_${user.companyId}`);

        res.status(201).json(announcement);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        await (prisma.announcement as any).delete({
            where: { id, companyId: user.companyId }
        });

        cache.del(`announcements_${user.companyId}`);
        res.json({ message: 'Announcement deleted' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
