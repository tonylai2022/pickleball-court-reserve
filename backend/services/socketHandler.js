import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // userId -> socket mapping
        this.userRooms = new Map(); // userId -> Set of rooms

        this.setupMiddleware();
        this.setupHandlers();
    }

    setupMiddleware() {
        // Authentication middleware for socket connections
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;

                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');

                if (!user || !user.isActive) {
                    return next(new Error('User not found or inactive'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });
    }

    setupHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.user.name} connected (${socket.userId})`);

            // Store user connection
            this.connectedUsers.set(socket.userId, socket);
            this.userRooms.set(socket.userId, new Set());

            // Join user to their personal room for direct notifications
            socket.join(`user:${socket.userId}`);
            this.getUserRooms(socket.userId).add(`user:${socket.userId}`);

            // Handle booking-related events
            this.handleBookingEvents(socket);

            // Handle court-related events
            this.handleCourtEvents(socket);

            // Handle admin events (if admin)
            if (socket.user.role === 'admin' || socket.user.role === 'manager') {
                this.handleAdminEvents(socket);
            }

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User ${socket.user.name} disconnected (${socket.userId})`);
                this.handleDisconnect(socket);
            });
        });
    }

    handleBookingEvents(socket) {
        // Join booking notification room for real-time updates
        socket.on('join:bookings', () => {
            socket.join('bookings');
            this.getUserRooms(socket.userId).add('bookings');
        });

        // Leave booking notification room
        socket.on('leave:bookings', () => {
            socket.leave('bookings');
            this.getUserRooms(socket.userId).delete('bookings');
        });

        // Subscribe to specific court availability updates
        socket.on('subscribe:court', (data) => {
            const { courtId } = data;
            if (courtId) {
                const room = `court:${courtId}`;
                socket.join(room);
                this.getUserRooms(socket.userId).add(room);

                socket.emit('subscribed', {
                    type: 'court',
                    courtId,
                    message: 'Subscribed to court updates'
                });
            }
        });

        // Unsubscribe from court updates
        socket.on('unsubscribe:court', (data) => {
            const { courtId } = data;
            if (courtId) {
                const room = `court:${courtId}`;
                socket.leave(room);
                this.getUserRooms(socket.userId).delete(room);

                socket.emit('unsubscribed', {
                    type: 'court',
                    courtId,
                    message: 'Unsubscribed from court updates'
                });
            }
        });

        // Real-time booking status updates
        socket.on('booking:status', async (data) => {
            try {
                const { bookingId } = data;
                // This would typically fetch latest booking status from database
                // For demo purposes, we'll just acknowledge
                socket.emit('booking:status:response', {
                    bookingId,
                    status: 'confirmed',
                    timestamp: new Date()
                });
            } catch (error) {
                socket.emit('error', { message: 'Failed to get booking status' });
            }
        });
    }

    handleCourtEvents(socket) {
        // Subscribe to all court availability updates
        socket.on('subscribe:availability', () => {
            socket.join('availability');
            this.getUserRooms(socket.userId).add('availability');
        });

        // Unsubscribe from availability updates
        socket.on('unsubscribe:availability', () => {
            socket.leave('availability');
            this.getUserRooms(socket.userId).delete('availability');
        });
    }

    handleAdminEvents(socket) {
        // Join admin room for admin-specific notifications
        socket.join('admin');
        this.getUserRooms(socket.userId).add('admin');

        // Real-time dashboard updates
        socket.on('admin:dashboard', () => {
            socket.join('dashboard');
            this.getUserRooms(socket.userId).add('dashboard');
        });

        // Monitor specific metrics
        socket.on('admin:monitor', (data) => {
            const { metric } = data;
            const room = `monitor:${metric}`;
            socket.join(room);
            this.getUserRooms(socket.userId).add(room);
        });
    }

    handleDisconnect(socket) {
        // Clean up user connection data
        this.connectedUsers.delete(socket.userId);
        this.userRooms.delete(socket.userId);
    }

    getUserRooms(userId) {
        if (!this.userRooms.has(userId)) {
            this.userRooms.set(userId, new Set());
        }
        return this.userRooms.get(userId);
    }

    // Broadcast methods for different events

    // Notify about new booking
    notifyNewBooking(booking) {
        this.io.to('bookings').emit('booking:new', {
            type: 'booking:created',
            booking,
            timestamp: new Date()
        });

        // Notify specific court subscribers
        this.io.to(`court:${booking.court}`).emit('court:booking', {
            type: 'court:new_booking',
            courtId: booking.court,
            booking,
            timestamp: new Date()
        });

        // Notify admins
        this.io.to('admin').emit('admin:new_booking', {
            type: 'admin:booking_created',
            booking,
            timestamp: new Date()
        });
    }

    // Notify about booking status change
    notifyBookingUpdate(booking, oldStatus) {
        const user = this.connectedUsers.get(booking.user.toString());

        // Notify the booking owner
        this.io.to(`user:${booking.user}`).emit('booking:updated', {
            type: 'booking:status_changed',
            bookingId: booking._id,
            oldStatus,
            newStatus: booking.status,
            booking,
            timestamp: new Date()
        });

        // Notify court subscribers about availability change
        this.io.to(`court:${booking.court}`).emit('court:availability_changed', {
            type: 'court:booking_updated',
            courtId: booking.court,
            bookingId: booking._id,
            status: booking.status,
            timestamp: new Date()
        });

        // Notify availability subscribers
        this.io.to('availability').emit('availability:updated', {
            type: 'availability:changed',
            courtId: booking.court,
            date: booking.date,
            timestamp: new Date()
        });

        // Notify admins
        this.io.to('admin').emit('admin:booking_updated', {
            type: 'admin:booking_status_changed',
            bookingId: booking._id,
            oldStatus,
            newStatus: booking.status,
            booking,
            timestamp: new Date()
        });
    }

    // Notify about booking cancellation
    notifyBookingCancelled(booking) {
        // Notify the booking owner
        this.io.to(`user:${booking.user}`).emit('booking:cancelled', {
            type: 'booking:cancelled',
            booking,
            timestamp: new Date()
        });

        // Notify court subscribers about newly available slot
        this.io.to(`court:${booking.court}`).emit('court:slot_available', {
            type: 'court:slot_freed',
            courtId: booking.court,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timestamp: new Date()
        });

        // Notify availability subscribers
        this.io.to('availability').emit('availability:updated', {
            type: 'availability:slot_freed',
            courtId: booking.court,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timestamp: new Date()
        });
    }

    // Notify about payment status
    notifyPaymentUpdate(payment) {
        this.io.to(`user:${payment.user}`).emit('payment:updated', {
            type: 'payment:status_changed',
            paymentId: payment._id,
            bookingId: payment.booking,
            status: payment.status,
            amount: payment.amount,
            timestamp: new Date()
        });

        // Notify admins
        this.io.to('admin').emit('admin:payment_updated', {
            type: 'admin:payment_status_changed',
            paymentId: payment._id,
            bookingId: payment.booking,
            userId: payment.user,
            status: payment.status,
            amount: payment.amount,
            timestamp: new Date()
        });
    }

    // Notify about court status changes
    notifyCourtUpdate(court) {
        this.io.to(`court:${court._id}`).emit('court:updated', {
            type: 'court:status_changed',
            courtId: court._id,
            isActive: court.isActive,
            timestamp: new Date()
        });

        this.io.to('availability').emit('availability:court_updated', {
            type: 'availability:court_status_changed',
            courtId: court._id,
            isActive: court.isActive,
            timestamp: new Date()
        });
    }

    // Send direct notification to user
    notifyUser(userId, type, data) {
        this.io.to(`user:${userId}`).emit('notification', {
            type,
            data,
            timestamp: new Date()
        });
    }

    // Broadcast system maintenance message
    notifyMaintenance(message, startTime, endTime) {
        this.io.emit('system:maintenance', {
            type: 'system:maintenance',
            message,
            startTime,
            endTime,
            timestamp: new Date()
        });
    }

    // Send dashboard updates to admins
    updateDashboard(data) {
        this.io.to('dashboard').emit('dashboard:update', {
            type: 'dashboard:stats',
            data,
            timestamp: new Date()
        });
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    // Get user connection status
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }

    // Disconnect user (force disconnect)
    disconnectUser(userId) {
        const socket = this.connectedUsers.get(userId);
        if (socket) {
            socket.disconnect(true);
        }
    }

    // Broadcast to all connected users
    broadcast(event, data) {
        this.io.emit(event, {
            ...data,
            timestamp: new Date()
        });
    }
}

export default SocketHandler;