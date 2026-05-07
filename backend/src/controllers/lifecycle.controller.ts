import { Request, Response } from 'express';
import * as recruitmentService from '../services/recruitment.service';
import * as assetService from '../services/asset.service';
import * as onboardingService from '../services/onboarding.service';

// RECRUITMENT
export const createJob = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const job = await recruitmentService.createJobPosting(companyId, req.body);
        res.status(201).json(job);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getJobs = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const jobs = await recruitmentService.getJobPostings(companyId);
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const applyJob = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const applicant = await recruitmentService.createApplicant(jobId, req.body);
        res.status(201).json(applicant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getApplicants = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const applicants = await recruitmentService.getApplicants(jobId);
        res.json(applicants);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateApplicantStatus = async (req: Request, res: Response) => {
    try {
        const { applicantId } = req.params;
        const { status } = req.body;
        const applicant = await recruitmentService.updateApplicantStatus(applicantId, status);
        res.json(applicant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// ASSETS
export const createAsset = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const asset = await assetService.createAsset(companyId, req.body);
        res.status(201).json(asset);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAssets = async (req: Request, res: Response) => {
    try {
        const { companyId } = (req as any).user;
        const assets = await assetService.getAssets(companyId);
        res.json(assets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const assignAsset = async (req: Request, res: Response) => {
    try {
        const { assetId, userId } = req.body;
        const asset = await assetService.assignAsset(assetId, userId);
        res.json(asset);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// ONBOARDING
export const getMyOnboarding = async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as any).user;
        const tasks = await onboardingService.getMyOnboarding(userId);
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const completeTask = async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as any).user;
        const { taskId } = req.params;
        const task = await onboardingService.completeTask(taskId, userId);
        res.json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
