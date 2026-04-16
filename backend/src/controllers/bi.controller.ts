import { Request, Response } from 'express';
import * as biService from '../services/bi.service';

export const getExecutiveOverview = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const data = await biService.getExecutiveOverview(companyId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTrends = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const data = await biService.getPerformanceTrends(companyId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
