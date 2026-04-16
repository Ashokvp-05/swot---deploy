import { Request, Response } from 'express';
import * as holidayService from '../services/holiday.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const sync = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized/No Company' });

        const year = req.body.year || new Date().getFullYear();
        const result = await holidayService.syncHolidays(year, user.companyId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const list = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const holidays = await holidayService.getHolidays(year, user.companyId);
        res.json(holidays);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, date, year, isFloater } = req.body;
        const holiday = await holidayService.createHoliday({
            name,
            date: new Date(date),
            year: year || new Date(date).getFullYear(),
            isFloater,
            companyId: user.companyId
        });
        res.status(201).json(holiday);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A holiday already exists on this date' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user?.companyId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        const result = await holidayService.deleteHoliday(id, user.companyId);
        if (!result) return res.status(404).json({ error: 'Holiday not found' });
        res.json({ message: 'Holiday deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
