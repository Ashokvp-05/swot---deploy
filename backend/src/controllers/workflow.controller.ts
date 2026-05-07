import { Request, Response } from 'express';
import * as workflowService from '../services/workflow.service';
import prisma from '../config/db';

export const createExpenseClaim = async (req: Request, res: Response) => {
    try {
        const { id: userId, companyId } = (req as any).user;
        const claim = await workflowService.createExpenseClaim(userId, companyId, req.body);
        res.status(201).json(claim);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createSalaryAdvance = async (req: Request, res: Response) => {
    try {
        const { id: userId, companyId } = (req as any).user;
        const advance = await workflowService.createSalaryAdvance(userId, companyId, req.body);
        res.status(201).json(advance);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyClaims = async (req: Request, res: Response) => {
    try {
        const { id: userId, companyId } = (req as any).user;
        const [expenses, advances] = await Promise.all([
            prisma.expenseClaim.findMany({ where: { userId, companyId }, orderBy: { createdAt: 'desc' } }),
            prisma.salaryAdvance.findMany({ where: { userId, companyId }, orderBy: { createdAt: 'desc' } })
        ]);
        res.json({ expenses, advances });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const { id: userId, companyId } = (req as any).user;
        const steps = await (prisma.approvalStep as any).findMany({
            where: {
                approverId: userId,
                status: 'PENDING',
                approver: { companyId }
            },
            include: {
                expenseClaim: { include: { user: true } },
                salaryAdvance: { include: { user: true } }
            }
        });
        res.json(steps);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const processStep = async (req: Request, res: Response) => {
    try {
        const { stepId, status, comments } = req.body;
        const { id: approverId, companyId } = (req as any).user;
        const result = await workflowService.processApproval(stepId, approverId, companyId, status, comments);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
