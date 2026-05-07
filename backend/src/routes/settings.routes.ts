import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/db';
import * as nodemailer from 'nodemailer';

const router = express.Router();

router.get('/email', authenticate, authorize(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID required' });

        const config = await prisma.systemConfig.findUnique({
            where: { key_companyId: { key: 'SMTP_SETTINGS', companyId } }
        });

        if (!config || !config.value) {
            return res.json({});
        }

        const value = config.value as any;
        
        // Don't send password back to the client for security
        res.json({
            server: value.server,
            port: value.port,
            username: value.username,
            senderEmail: value.senderEmail,
            enableTls: value.enableTls
        });
    } catch (error) {
        console.error('Error fetching email settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/email', authenticate, authorize(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID required' });

        const { server, port, username, password, senderEmail, enableTls } = req.body;

        if (!server || !port || !senderEmail) {
            return res.status(400).json({ error: 'Server, port, and senderEmail are required.' });
        }

        // If password is not provided, fetch existing password to avoid overwriting it with blank
        let finalPassword = password;
        if (!password) {
             const existing = await prisma.systemConfig.findUnique({
                 where: { key_companyId: { key: 'SMTP_SETTINGS', companyId } }
             });
             if (existing && (existing.value as any).password) {
                 finalPassword = (existing.value as any).password;
             }
        }

        const payload = { server, port, username, password: finalPassword, senderEmail, enableTls };

        const config = await prisma.systemConfig.upsert({
            where: { key_companyId: { key: 'SMTP_SETTINGS', companyId } },
            update: { value: payload },
            create: { key: 'SMTP_SETTINGS', companyId, value: payload }
        });

        res.json({ message: 'SMTP settings updated successfully' });
    } catch (error) {
        console.error('Error saving email settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

router.post('/test-smtp', authenticate, authorize(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { server, port, username, password, senderEmail, enableTls } = req.body;

        if (!server || !port) {
            return res.status(400).json({ error: 'Server and port are required to test connection.' });
        }

        let finalPassword = password;
        if (!password && req.user?.companyId) {
             const existing = await prisma.systemConfig.findUnique({
                 where: { key_companyId: { key: 'SMTP_SETTINGS', companyId: req.user.companyId } }
             });
             if (existing && (existing.value as any).password) {
                 finalPassword = (existing.value as any).password;
             }
        }

        const transporter = nodemailer.createTransport({
            host: server,
            port: Number(port),
            secure: enableTls === true,
            auth: username ? { user: username, pass: finalPassword } : undefined
        });

        await transporter.verify();

        res.json({ message: 'SMTP connection successful' });
    } catch (error: any) {
        console.error('SMTP test failed:', error);
        res.status(400).json({ error: 'SMTP connection failed: ' + error.message });
    }
});

export default router;
