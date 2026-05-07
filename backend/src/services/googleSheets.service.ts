import prisma from '../config/db';

// Google Sheets integration requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env
// googleapis package has a known module resolution issue in some Node versions.
// This service gracefully falls back to a mock if credentials are not configured.

export const exportAttendanceToSheets = async (spreadsheetId: string) => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('[GOOGLE SHEETS] Missing credentials. Returning mock response.');
        return { message: 'Google Sheets export not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to .env to enable.' };
    }

    try {
        // Dynamic import to avoid module resolution crash at startup
        const { google } = await import('googleapis');

        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const attendance = await prisma.timeEntry.findMany({
            include: { user: true },
            orderBy: { clockIn: 'desc' }
        });

        const rows = [
            ['Name', 'Email', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Type'],
            ...attendance.map((entry: any) => [
                entry.user.name,
                entry.user.email,
                entry.clockIn.toLocaleDateString(),
                entry.clockIn.toLocaleTimeString(),
                entry.clockOut?.toLocaleTimeString() || 'ACTIVE',
                entry.hoursWorked?.toString() || '0',
                entry.clockType
            ])
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            requestBody: { values: rows },
        });

        return { success: true, rowsExported: attendance.length };
    } catch (error) {
        console.error('[GOOGLE SHEETS] Export failed:', error);
        return { message: 'Export failed. Check server logs for details.' };
    }
};
