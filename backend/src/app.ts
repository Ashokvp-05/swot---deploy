import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';

dotenv.config();

const app = express();
app.set('etag', false); // Disable etag for simpler debugging

// Optimized Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const isLocalIP = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|\[::1\])(:\d+)?$/.test(origin);

        if (
            allowedOrigins.indexOf(origin) !== -1 ||
            isLocalIP ||
            origin.endsWith('.swotpam.com') ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.onrender.com')
        ) {
            callback(null, true);
        } else {
            console.warn('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression({
    level: 6, // Balance between compression ratio and speed
    threshold: 1024, // Only compress responses > 1KB
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cache control for static responses
app.use((req, res, next) => {
    // Set cache headers for specific routes
    if (req.path.startsWith('/api/holidays') || req.path.startsWith('/api/announcements')) {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    next();
});

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/', (req, res) => {
    res.json({ message: 'Rudratic HR System API is running', timestamp: new Date() });
});

app.get('/api', (req, res) => {
    res.json({
        status: 'Operational',
        version: '1.0.0-GA',
        latency: 'minimal',
        compression: 'enabled'
    });
});

// Routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import timeEntryRoutes from './routes/timeEntry.routes';
import notificationRoutes from './routes/notification.routes';
import holidayRoutes from './routes/holiday.routes';
import leaveRoutes from './routes/leave.routes';
import profileRoutes from './routes/profile.routes';
import reportRoutes from './routes/report.routes';
import announcementRoutes from './routes/announcement.routes';
import ticketRoutes from './routes/ticket.routes';
import calendarRoutes from './routes/calendar.routes';
import kudosRoutes from './routes/kudos.routes';
import performanceRoutes from './routes/performance.routes';
import aiRoutes from './routes/ai.routes';
import payslipRoutes from './routes/payslip.routes';
import payrollRoutes from './routes/payroll.routes';
import workflowRoutes from './routes/workflow.routes';
import dashboardRoutes from './routes/dashboard.routes';
import companyRoutes from './routes/company.routes';
import organizationRoutes from './routes/organization.routes';
import attendanceV2Routes from './routes/attendance-v2.routes';
import leaveV2Routes from './routes/leave-v2.routes';
import lifecycleRoutes from './routes/lifecycle.routes';
import biRoutes from './routes/bi.routes';
import enterpriseRoutes from './routes/enterprise.routes';
import documentRoutes from './routes/document.routes';
import { initCronJobs } from './services/cron.service';

// Initialize Scheduled Tasks
initCronJobs();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/time', timeEntryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/attendance-v2', attendanceV2Routes);
app.use('/api/leave-v2', leaveV2Routes);
app.use('/api/performance', performanceRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Global error handler - must be last
import { errorHandler } from './middleware/error.middleware';
app.use(errorHandler);

export default app;
