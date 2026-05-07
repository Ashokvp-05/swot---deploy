import { Router } from 'express';
import * as enterpriseController from '../controllers/enterprise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Phase 6: Project Orbit
router.post('/projects', enterpriseController.handleProjectOp.create);
router.get('/projects', enterpriseController.handleProjectOp.list);
router.post('/timesheets', enterpriseController.handleTimesheet.create);
router.get('/timesheets/me', enterpriseController.handleTimesheet.mine);

// Phase 7: Engagement Hub
router.post('/polls', enterpriseController.handleEngagement.createPoll);
router.get('/polls/active', enterpriseController.handleEngagement.listActivePolls);
router.post('/polls/vote', enterpriseController.handleEngagement.vote);

export default router;
