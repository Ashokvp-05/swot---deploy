import { Request, Response } from 'express';
import * as organizationService from '../services/organization.service';

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const departments = await organizationService.getDepartments(companyId);
        res.status(200).json(departments);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const dept = await organizationService.createDepartment(companyId, req.body);
        res.status(201).json(dept);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const { id } = req.params;
        const dept = await organizationService.updateDepartment(id, companyId, req.body);
        res.status(200).json(dept);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const { id } = req.params;
        await organizationService.deleteDepartment(id, companyId);
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getDesignations = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const designations = await organizationService.getDesignations(companyId);
        res.status(200).json(designations);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createDesignation = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const desig = await organizationService.createDesignation(companyId, req.body);
        res.status(201).json(desig);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getBranches = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const branches = await organizationService.getBranches(companyId);
        res.status(200).json(branches);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createBranch = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const branch = await organizationService.createBranch(companyId, req.body);
        res.status(201).json(branch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getRoles = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const roles = await organizationService.getRoles(companyId);
        res.status(200).json(roles);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createRole = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const role = await organizationService.createRole(companyId, req.body);
        res.status(201).json(role);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const stats = await organizationService.getOrganizationStats(companyId);
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
