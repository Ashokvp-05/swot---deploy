import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Reports access (Admin, Manager, Employee allowed - scoped by controller)
const REPORT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN', 'EMPLOYEE'];

router.get('/attendance', authorize(REPORT_ROLES), reportController.getAttendanceReport);
router.get('/export/excel', authorize(REPORT_ROLES), reportController.exportExcel);
router.get('/export/pdf', authorize(REPORT_ROLES), reportController.exportPDF);
router.get('/export/strategic-monthly', authorize(['ADMIN', 'SUPER_ADMIN']), reportController.exportStrategicMonthly);

export default router;
