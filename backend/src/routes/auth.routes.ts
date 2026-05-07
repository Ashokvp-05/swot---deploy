import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/register-company', authController.registerCompany);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/change-password', authenticate as any, authController.changePassword);

// 2FA Routes
router.post('/2fa/verify', authController.verify2FALogin);
router.post('/2fa/setup', authenticate as any, authController.setup2FA);
router.post('/2fa/activate', authenticate as any, authController.activate2FA);
router.post('/2fa/disable', authenticate as any, authController.disable2FA);
router.post('/logout-others', authenticate as any, authController.logoutOthers);

export default router;
