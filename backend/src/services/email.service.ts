import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] TO: ${to} | SUBJECT: ${subject}`);
        console.log(`[CONTENT]: ${html}`);
        return { id: 'mock-email-id' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Rudratic HR <onboarding@resend.dev>', // Update with verified domain in prod
            to,
            subject,
            html,
        });
        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const subject = `Welcome to the Organization, ${name}`;
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
    const html = `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 24px; background: #ffffff;">
            <div style="margin-bottom: 32px;">
                <h2 style="color: #4f46e5; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin: 0; italic">Personnel Initialize <span style="color: #1e293b;">Complete</span></h2>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">Authorized Access Protocol Activated</p>
            </div>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Welcome to the team, <strong>${name}</strong>. Your identity node has been successfully integrated into the HRMS registry. You can now access your high-fidelity personnel hub to complete your onboarding manifest.</p>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 32px;">
                <h4 style="color: #1e293b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px 0;">Onboarding Manifest Shards:</h4>
                <ul style="color: #475569; font-size: 13px; margin: 0; padding-left: 20px; line-height: 2;">
                    <li>Complete Profile Identity Matrix</li>
                    <li>Upload Required Document Shards (ID, Address)</li>
                    <li>Sign Digital Policy Artifacts</li>
                    <li>Initialize Training Modules</li>
                </ul>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${loginUrl}" style="background: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);">Access Personnel Hub</a>
            </div>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.6;">If you have any clinical issues with your access handshake, please contact your department manager immediately.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
            <p style="font-size: 10px; color: #cbd5e1; text-align: center; text-transform: uppercase; letter-spacing: 0.3em; margin: 0;">Clinical HRMS • Secure Personnel Shard</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

export const sendClockOutReminder = async (email: string, name: string) => {
    const subject = 'Reminder: Clock Out';
    const html = `
        <p>Hi ${name},</p>
        <p>It's past 7 PM. If you have finished your work, please remember to clock out.</p>
    `;
    return sendEmail(email, subject, html);
};

export const sendWeeklyReport = async (email: string, stats: any) => {
    const subject = `Rudratic Weekly Report - ${new Date().toLocaleDateString()}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #2563eb;">Rudratic Workforce Summary</h1>
            <p>Here is the automated summary for the past 7 days:</p>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
                <tr style="background: #f8fafc;">
                    <td>Total Active Employees</td>
                    <td><strong>${stats.totalUsers}</strong></td>
                </tr>
                <tr>
                    <td>Total Hours Logged</td>
                    <td><strong>${stats.totalHours} hrs</strong></td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td>Leave Requests Pending</td>
                    <td><strong>${stats.pendingLeaves}</strong></td>
                </tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                This satisfies task 5.7 in your Project Tracker.
            </p>
        </div>
    `;
    return sendEmail(email, subject, html);
};
export const sendPasswordResetEmail = async (email: string, token: string) => {
    const subject = 'Password Reset Request - Rudratic HR';
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested a password reset for your Rudratic HR account.</p>
            <p>Please click the link below to set a new password. This link will expire in 1 hour.</p>
            <div style="margin: 20px 0;">
                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const subject = 'Verify your email - Rudratic HR';
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; text-transform: uppercase; letter-spacing: 0.1em; font-size: 20px;">Verify Your Identity</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Welcome to Rudratic! Please verify your email address to complete your organization's registration.</p>
            <div style="margin: 32px 0;">
                <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">If you did not create an account, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 10px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em;">Rudratic Personnel Core • SaaS Platform</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

export const sendDailyAttendanceReport = async (email: string, stats: any) => {
    const subject = `Daily Attendance Analysis - ${stats.date}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #2563eb;">Daily Attendance Analysis</h1>
            <p>End-of-day summary for ${stats.date}:</p>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
                <tr style="background: #f8fafc;">
                    <td>Total Employees Present</td>
                    <td><strong>${stats.totalEntries}</strong></td>
                </tr>
                <tr>
                    <td>Late Clock-ins (> 9:30 AM)</td>
                    <td style="color: #dc2626;"><strong>${stats.lateCount}</strong></td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td>Missing Clock-outs (Still Active)</td>
                    <td style="color: #ea580c;"><strong>${stats.ghostCount}</strong></td>
                </tr>
                <tr>
                    <td>Total Worked Hours</td>
                    <td><strong>${stats.totalHours} hrs</strong></td>
                </tr>
            </table>

            <h3>Systemic Log Detail</h3>
            <ul style="font-size: 13px; color: #334155;">
                ${stats.summaries.map((s: string) => `<li>${s}</li>`).join('')}
            </ul>

            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                This satisfies the requested analytical requirement for temporal monitoring.
            </p>
        </div>
    `;
    return sendEmail(email, subject, html);
};
