import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import * as engagementService from '../services/engagement.service';

export const handleProjectOp = {
    create: async (req: Request, res: Response) => {
        try {
            const { companyId } = (req as any).user;
            const project = await projectService.createProject(companyId, req.body);
            res.status(201).json(project);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    list: async (req: Request, res: Response) => {
        try {
            const { companyId } = (req as any).user;
            const projects = await projectService.getProjects(companyId);
            res.json(projects);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    }
};

export const handleTimesheet = {
    create: async (req: Request, res: Response) => {
        try {
            const { id: userId, companyId } = (req as any).user;
            const entry = await projectService.createTimesheet(userId, companyId, req.body);
            res.status(201).json(entry);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    mine: async (req: Request, res: Response) => {
        try {
            const { id: userId } = (req as any).user;
            const entries = await projectService.getMyTimesheets(userId);
            res.json(entries);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    }
};

export const handleEngagement = {
    createPoll: async (req: Request, res: Response) => {
        try {
            const { companyId } = (req as any).user;
            const poll = await engagementService.createPoll(companyId, req.body);
            res.status(201).json(poll);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    listActivePolls: async (req: Request, res: Response) => {
        try {
            const { companyId } = (req as any).user;
            const polls = await engagementService.getActivePolls(companyId);
            res.json(polls);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    vote: async (req: Request, res: Response) => {
        try {
            const { id: userId } = (req as any).user;
            const { pollId, optionId } = req.body;
            const response = await engagementService.vote(userId, pollId, optionId);
            res.json(response);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    }
};
