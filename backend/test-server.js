/*
 * Lightweight, robust test server used while core backend routes are being stabilized.
 * Provides simple endpoints and strong diagnostics so we can validate environment, port binding,
 * and network accessibility before debugging the full stack.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.BIND_HOST || '0.0.0.0';

// --- Diagnostics Helpers --------------------------------------------------
const startedAt = Date.now();
const bootEvents = [];
function logDiag(msg, extra = {}) {
    const entry = { t: new Date().toISOString(), msg, ...extra };
    bootEvents.push(entry);
    console.log(msg, Object.keys(extra).length ? extra : '');
}

// --- Middleware -----------------------------------------------------------
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use((req, _res, next) => { req._recvTs = Date.now(); next(); });

// --- Routes ---------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Test server OK',
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        env: process.env.NODE_ENV || 'unset',
        port: PORT,
        host: HOST,
        now: new Date().toISOString(),
        bootEvents
    });
});

app.get('/api/courts', (_req, res) => {
    res.json({
        success: true,
        courts: [
            { _id: 'c1', name: 'Court 1', pricePerHour: 120, status: 'active' },
            { _id: 'c2', name: 'Court 2', pricePerHour: 120, status: 'active' }
        ]
    });
});

app.get('/api/courts/:id/availability', (req, res) => {
    const { id } = req.params;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    res.json({
        success: true,
        courtId: id,
        date,
        availability: [
            { time: '09:00', available: true },
            { time: '10:00', available: false },
            { time: '11:00', available: true },
            { time: '14:00', available: true },
            { time: '15:00', available: false },
            { time: '16:00', available: true }
        ]
    });
});

app.post('/api/auth/login', (req, res) => {
    const { phone } = req.body || {};
    res.json({
        success: true,
        token: 'test-jwt-token',
        user: { id: 'user123', name: 'Test User', phone: phone || '13800138000' }
    });
});

app.post('/api/bookings', (req, res) => {
    res.json({
        success: true,
        booking: {
            id: 'b' + Date.now(),
            confirmationNumber: 'TRK' + Date.now(),
            payload: req.body
        },
        paymentParams: {
            prepayId: 'mock-prepay',
            timeStamp: Date.now().toString(),
            nonceStr: 'mocknonce',
            packageValue: 'mockpackage',
            signType: 'MD5',
            paySign: 'mock-sign'
        }
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found', path: req.originalUrl });
});

// Error handler
app.use((err, _req, res, _next) => {
    console.error('🔥 Internal error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Global crash guards
process.on('uncaughtException', (e) => {
    console.error('❌ Uncaught Exception:', e);
});
process.on('unhandledRejection', (r) => {
    console.error('❌ Unhandled Rejection:', r);
});

// Keep event loop alive even if nothing else pending (diagnostic heartbeat)
setInterval(() => {
    // lightweight heartbeat
}, 60_000).unref();

try {
    const server = app.listen(PORT, HOST, () => {
        logDiag(`🚀 Test server listening at http://${HOST}:${PORT}`, { env: process.env.NODE_ENV });
    });
    server.on('error', (err) => {
        console.error('❌ Server error event:', err);
    });
} catch (err) {
    console.error('❌ Failed to start server:', err);
}
