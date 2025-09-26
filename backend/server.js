import dotenv from 'dotenv';

// Simple dotenv config - let it find .env automatically
dotenv.config();

// Hardcode the MongoDB URI for demo purposes if not found in env
if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/pickleball-booking';
    console.log('📝 Using hardcoded MongoDB URI for demo');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import SocketHandler from './services/socketHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import courtRoutes from './routes/courts.js';
import paymentRoutes from './routes/payments.js';

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
    }
});

// Connect to MongoDB
connectDB();

// Initialize Socket Handler
const socketHandler = new SocketHandler(io);
app.socketHandler = socketHandler; // Make it accessible to routes

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Adjust as needed for your app
}));

app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);
app.use(compression());
app.use(morgan('combined'));

// Special middleware for WeChat payment notifications (raw XML)
app.use('/api/payments/wechat', express.text({ type: 'application/xml' }));

// JSON parsing for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        connectedUsers: socketHandler.getConnectedUsersCount()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/payments', paymentRoutes);

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Pickleball Court Booking API',
        version: '1.0.0',
        features: [
            'WeChat OAuth & Mini Program Login',
            'WeChat Pay Integration',
            'Real-time WebSocket Updates',
            'Court Booking Management',
            'Equipment Rental',
            'Payment Processing & Refunds'
        ],
        endpoints: {
            auth: '/api/auth',
            bookings: '/api/bookings',
            courts: '/api/courts',
            payments: '/api/payments'
        },
        websocket: {
            connected: socketHandler.getConnectedUsersCount(),
            events: [
                'booking:new',
                'booking:updated',
                'court:availability_changed',
                'payment:updated'
            ]
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 Socket.IO server running on port ${PORT}`);
    console.log(`� Pickleball Court Booking API ready!`);
    console.log(`📱 WeChat integration enabled`);
    console.log(`💰 WeChat Pay integration enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

export default app;