import { Router } from 'express';
import * as timeEntryController from '../controllers/timeEntry.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/active', timeEntryController.getActive);
router.get('/active-users', timeEntryController.getAllActiveUsers);
router.post('/clock-in', timeEntryController.clockIn);
router.post('/clock-out', timeEntryController.clockOut);
router.get('/history', timeEntryController.getHistory);
router.get('/summary', timeEntryController.getSummary);

// Reports - Admin only or Manager
import * as reportController from '../controllers/report.controller';
router.get('/reports', authenticate, reportController.getAttendanceReport);
router.get('/reports/excel', authenticate, reportController.exportExcel);
router.get('/reports/pdf', authenticate, reportController.exportPDF);

export default router;
