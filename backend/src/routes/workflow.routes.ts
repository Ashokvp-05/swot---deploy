import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as workflowController from '../controllers/workflow.controller';

const router = Router();

router.use(authenticate as any);

// Employee actions
router.post('/expenses', workflowController.createExpenseClaim);
router.post('/advances', workflowController.createSalaryAdvance);
router.get('/my-claims', workflowController.getMyClaims);

// Approver actions
router.get('/pending', workflowController.getPendingApprovals);
router.post('/process', workflowController.processStep);

export default router;
