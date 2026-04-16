import { Router } from 'express';
import * as biController from '../controllers/bi.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Executive Analytics
router.get('/overview', biController.getExecutiveOverview);
router.get('/trends', biController.getTrends);

export default router;
