import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import prisma from '../config/db';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server) {
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
        console.log('[WS] Client connected');

        // Send initial snapshot immediately on connect
        try {
            const stats = await getLiveStats();
            ws.send(JSON.stringify({ type: 'DASHBOARD_STATS', payload: stats }));
        } catch (err) {
            console.error('[WS] Initial send failed:', err);
        }

        ws.on('message', (msg: Buffer) => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.type === 'PING') {
                    ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
                }
            } catch {}
        });

        ws.on('close', () => console.log('[WS] Client disconnected'));
        ws.on('error', (err) => console.error('[WS] Error:', err));
    });

    // Broadcast live stats every 10 seconds
    setInterval(async () => {
        if (!wss || wss.clients.size === 0) return;
        try {
            const stats = await getLiveStats();
            const msg = JSON.stringify({ type: 'DASHBOARD_STATS', payload: stats });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg);
                }
            });
        } catch (err) {
            console.error('[WS] Broadcast failed:', err);
        }
    }, 10_000);

    console.log('[WS] WebSocket server initialized on path /ws');
    return wss;
}

export function broadcast(type: string, payload: any) {
    if (!wss) return;
    const msg = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

async function getLiveStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 86_400_000);

    const [
        totalEmployees,
        clockedInToday,
        pendingLeaves,
        approvedLeaves,
        leavesToday,
    ] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.timeEntry.count({
            where: {
                clockIn: { gte: todayStart, lt: todayEnd },
                clockOut: null,
            },
        }).catch(() => 0),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }).catch(() => 0),
        prisma.leaveRequest.count({ where: { status: 'APPROVED' } }).catch(() => 0),
        prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: { lte: todayEnd },
                endDate:   { gte: todayStart },
            },
        }).catch(() => 0),
    ]);

    return {
        totalEmployees,
        activeToday: clockedInToday,
        pendingApprovals: pendingLeaves,
        leaveApproved: approvedLeaves,
        leaveToday: leavesToday,
        timestamp: now.toISOString(),
    };
}
