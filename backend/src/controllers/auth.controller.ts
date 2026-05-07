import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
    try {
        const user = await authService.requestRegistration(req.body);
        res.status(201).json({ message: 'Registration successful', user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const registerCompany = async (req: Request, res: Response) => {
    try {
        const result = await authService.registerCompany(req.body);
        res.status(201).json({
            message: 'Company registration successful. You can now login.',
            ...result
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const user = await authService.verifyCredentials(req.body);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const verify2FALogin = async (req: Request, res: Response) => {
    try {
        const { userId, code } = req.body;
        const result = await authService.verify2FALogin(userId, code);
        res.status(200).json({ message: '2FA verification successful', ...result });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const setup2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await authService.setup2FA(userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const activate2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { code } = req.body;
        const result = await authService.activate2FA(userId, code);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const disable2FA = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await authService.disable2FA(userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const logoutOthers = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await authService.logoutOthers(userId);
        res.status(200).json({ message: 'All other devices logged out successfully. Future requests from those devices will require a fresh login.' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const result = await authService.verifyEmail(token);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
