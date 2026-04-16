import { Router } from 'express';
import * as lifecycleController from '../controllers/lifecycle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Recruitment
router.post('/jobs', lifecycleController.createJob);
router.get('/jobs', lifecycleController.getJobs);
router.get('/jobs/:jobId/applicants', lifecycleController.getApplicants);
router.put('/applicants/:applicantId/status', lifecycleController.updateApplicantStatus);
router.post('/jobs/:jobId/apply', lifecycleController.applyJob);

// Assets
router.post('/assets', lifecycleController.createAsset);
router.get('/assets', lifecycleController.getAssets);
router.post('/assets/assign', lifecycleController.assignAsset);

// Onboarding
router.get('/onboarding/me', lifecycleController.getMyOnboarding);
router.put('/onboarding/tasks/:taskId/complete', lifecycleController.completeTask);

export default router;
