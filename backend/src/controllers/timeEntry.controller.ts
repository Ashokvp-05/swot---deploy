import { Request, Response } from 'express';
import * as timeEntryService from '../services/timeEntry.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClockType } from '@prisma/client';

export const getActive = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await timeEntryService.getActiveEntry(user.id, user.companyId);
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clockIn = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const { type, location, isOnCall } = req.body;

        const entry = await timeEntryService.clockIn(user.id, user.companyId, type, location, isOnCall);
        res.json(entry);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const clockOut = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await timeEntryService.clockOut(user.id, user.companyId);
        res.json(entry);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const limit = parseInt(req.query.limit as string) || 10;
        const skip = parseInt(req.query.skip as string) || 0;
        const month = req.query.month ? parseInt(req.query.month as string) : undefined;
        const year = req.query.year ? parseInt(req.query.year as string) : undefined;

        const history = await timeEntryService.getHistory(user.id, user.companyId, limit, skip, month, year);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import cache from '../config/cache';

export const getSummary = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.id || !user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const cacheKey = `summary_${user.id}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const summary = await timeEntryService.getSummary(user.id, user.companyId);
        cache.set(cacheKey, summary, 300); // Cache for 5 mins
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllActiveUsers = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const activeUsers = await timeEntryService.getAllActiveUsers(user.companyId);
        res.json(activeUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
