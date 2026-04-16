import { Router } from 'express';
import * as payslipController from '../controllers/payslip.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Employee actions
router.get('/my', payslipController.getMyPayslips);
router.get('/:id/download', payslipController.downloadPayslip);

// HR / Super Admin Management actions
const PAYROLL_ROLES = ['SUPER_ADMIN', 'HR_ADMIN', 'HR'];

router.get('/all', authorize(PAYROLL_ROLES), payslipController.getAllPayslips);
router.post('/upload', authorize(PAYROLL_ROLES), upload.single('file'), payslipController.uploadPayslip);
router.post('/generate', authorize(PAYROLL_ROLES), payslipController.generatePayslip);
router.patch('/:id/release', authorize(PAYROLL_ROLES), payslipController.releasePayslip);
router.post('/bulk-release', authorize(PAYROLL_ROLES), payslipController.bulkRelease);
router.delete('/:id', authorize(PAYROLL_ROLES), payslipController.deletePayslip);
router.put('/:id', authorize(PAYROLL_ROLES), payslipController.updatePayslip);

export default router;
