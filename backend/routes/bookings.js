import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import Booking from '../models/Booking.js';
import Court from '../models/Court.js';
import User from '../models/User.js';
import Equipment from '../models/Equipment.js';
import Payment from '../models/Payment.js';
import { AppError } from '../middleware/errorHandler.js';
import WeChatService from '../services/wechatService.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const createBookingValidation = [
    body('courtId').isMongoId().withMessage('Valid court ID required'),
    body('date').isISO8601().toDate().withMessage('Valid date required'),
    body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM format)'),
    body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM format)'),
    body('equipment.racquets').isInt({ min: 0, max: 8 }).withMessage('Racquets must be between 0 and 8'),
    body('equipment.balls').isInt({ min: 0, max: 10 }).withMessage('Balls must be between 0 and 10'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const updateBookingValidation = [
    param('id').isMongoId().withMessage('Valid booking ID required'),
    body('status').optional().isIn(['confirmed', 'cancelled', 'completed', 'no-show']).withMessage('Invalid status'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// Get all bookings (admin) or user's bookings
router.get('/', authenticate, validateRequest, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            courtId,
            date,
            startDate,
            endDate,
            userId
        } = req.query;

        let query = {};

        // Regular users can only see their own bookings
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            query.user = req.user.id;
        } else if (userId) {
            query.user = userId;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by court
        if (courtId) {
            query.court = courtId;
        }

        // Filter by date
        if (date) {
            const targetDate = new Date(date);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            query.date = {
                $gte: targetDate,
                $lt: nextDay
            };
        } else if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            populate: [
                { path: 'user', select: 'name phone wechatInfo.nickname' },
                { path: 'court', select: 'name location pricePerHour' },
                { path: 'payment', select: 'amount status method transactionId' }
            ],
            sort: { createdAt: -1 }
        };

        const result = await Booking.paginate(query, options);

        res.json({
            success: true,
            data: result.docs,
            pagination: {
                total: result.totalDocs,
                pages: result.totalPages,
                page: result.page,
                limit: result.limit,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get single booking
router.get('/:id', authenticate, validateRequest, async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name phone wechatInfo.nickname')
            .populate('court', 'name location pricePerHour facilities')
            .populate('payment', 'amount status method transactionId createdAt');

        if (!booking) {
            throw new AppError('Booking not found', 404);
        }

        // Check if user can access this booking
        if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
            booking.user._id.toString() !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
});

// Create new booking
router.post('/', authenticate, createBookingValidation, validateRequest, async (req, res, next) => {
    try {
        const {
            courtId,
            date,
            startTime,
            endTime,
            equipment = { racquets: 0, balls: 0 },
            notes
        } = req.body;

        // Validate booking date (not in the past, within 30 days)
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            throw new AppError('Cannot book for past dates', 400);
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        if (bookingDate > maxDate) {
            throw new AppError('Cannot book more than 30 days in advance', 400);
        }

        // Validate time range
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);

        if (start >= end) {
            throw new AppError('End time must be after start time', 400);
        }

        const durationHours = (end - start) / (1000 * 60 * 60);
        if (durationHours > 4) {
            throw new AppError('Maximum booking duration is 4 hours', 400);
        }

        // Check court availability
        const court = await Court.findById(courtId);
        if (!court || !court.isActive) {
            throw new AppError('Court not available', 400);
        }

        // Check if court is available at requested time
        const isAvailable = await court.checkAvailability(bookingDate, startTime, endTime);
        if (!isAvailable) {
            throw new AppError('Court is not available at the requested time', 409);
        }

        // Check equipment availability
        if (equipment.racquets > 0 || equipment.balls > 0) {
            const equipmentAvailable = await Equipment.checkAvailability(
                bookingDate,
                startTime,
                endTime,
                equipment.racquets,
                equipment.balls
            );

            if (!equipmentAvailable) {
                throw new AppError('Requested equipment not available', 409);
            }
        }

        // Calculate pricing
        const pricing = court.calculatePrice(startTime, endTime, equipment);
        const totalAmount = pricing.courtFee + pricing.equipmentFee;

        // Create booking
        const booking = new Booking({
            user: req.user.id,
            court: courtId,
            date: bookingDate,
            startTime,
            endTime,
            equipment,
            pricing: {
                courtFee: pricing.courtFee,
                equipmentFee: pricing.equipmentFee,
                totalAmount
            },
            notes,
            status: 'pending' // Will be confirmed after payment
        });

        await booking.save();

        // Create WeChat Pay order
        const orderData = {
            outTradeNo: `BOOKING_${booking._id}`,
            body: `Pickleball Court Booking - ${court.name}`,
            totalFee: Math.round(totalAmount * 100), // Convert to cents
            openid: req.user.wechatInfo?.openid,
            attach: JSON.stringify({
                bookingId: booking._id.toString(),
                type: 'booking'
            })
        };

        const paymentResult = await WeChatService.createUnifiedOrder(orderData);

        // Create payment record
        const payment = new Payment({
            booking: booking._id,
            user: req.user.id,
            amount: totalAmount,
            method: 'wechat',
            wechatOrderId: paymentResult.prepay_id,
            status: 'pending'
        });

        await payment.save();

        // Update booking with payment reference
        booking.payment = payment._id;
        await booking.save();

        // Return booking with payment parameters
        const populatedBooking = await Booking.findById(booking._id)
            .populate('court', 'name location')
            .populate('payment', 'amount status method');

        res.status(201).json({
            success: true,
            data: {
                booking: populatedBooking,
                paymentParams: paymentResult.paymentParams
            }
        });

    } catch (error) {
        next(error);
    }
});

// Update booking status
router.patch('/:id', authenticate, updateBookingValidation, validateRequest, async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            throw new AppError('Booking not found', 404);
        }

        // Check permissions
        const canUpdate = req.user.role === 'admin' ||
            req.user.role === 'manager' ||
            (booking.user.toString() === req.user.id && req.body.status === 'cancelled');

        if (!canUpdate) {
            throw new AppError('Access denied', 403);
        }

        // Handle cancellation
        if (req.body.status === 'cancelled') {
            if (booking.status === 'cancelled') {
                throw new AppError('Booking is already cancelled', 400);
            }

            if (booking.status === 'completed') {
                throw new AppError('Cannot cancel completed booking', 400);
            }

            // Check cancellation policy (e.g., must cancel at least 2 hours before)
            const bookingDateTime = new Date(booking.date);
            const [hours, minutes] = booking.startTime.split(':');
            bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

            const now = new Date();
            const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

            if (hoursUntilBooking < 2) {
                throw new AppError('Bookings must be cancelled at least 2 hours in advance', 400);
            }

            // Process refund if payment was completed
            if (booking.payment) {
                const payment = await Payment.findById(booking.payment);
                if (payment && payment.status === 'completed') {
                    // Calculate refund amount (could apply cancellation fee)
                    const refundAmount = payment.amount * 0.9; // 10% cancellation fee

                    try {
                        const refundResult = await WeChatService.refund({
                            outTradeNo: `BOOKING_${booking._id}`,
                            outRefundNo: `REFUND_${booking._id}_${Date.now()}`,
                            totalFee: Math.round(payment.amount * 100),
                            refundFee: Math.round(refundAmount * 100),
                            refundDesc: 'Booking cancellation'
                        });

                        // Update payment status
                        payment.status = 'refunded';
                        payment.refund = {
                            amount: refundAmount,
                            fee: payment.amount - refundAmount,
                            wechatRefundId: refundResult.refund_id,
                            processedAt: new Date()
                        };
                        await payment.save();
                    } catch (refundError) {
                        console.error('Refund failed:', refundError);
                        // Don't block cancellation if refund fails
                    }
                }
            }
        }

        // Update booking
        Object.assign(booking, req.body);
        booking.updatedAt = new Date();
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('user', 'name phone wechatInfo.nickname')
            .populate('court', 'name location')
            .populate('payment', 'amount status method');

        res.json({
            success: true,
            data: updatedBooking
        });

    } catch (error) {
        next(error);
    }
});

// Get available time slots for a court on a specific date
router.get('/availability/:courtId', validateRequest, async (req, res, next) => {
    try {
        const { courtId } = req.params;
        const { date } = req.query;

        if (!date) {
            throw new AppError('Date parameter is required', 400);
        }

        const court = await Court.findById(courtId);
        if (!court || !court.isActive) {
            throw new AppError('Court not found or inactive', 404);
        }

        const targetDate = new Date(date);
        const availableSlots = await court.getAvailableTimeSlots(targetDate);

        res.json({
            success: true,
            data: {
                court: {
                    id: court._id,
                    name: court.name,
                    location: court.location
                },
                date: targetDate,
                availableSlots
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get booking statistics (admin/manager only)
router.get('/stats/summary', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
    try {
        const { startDate, endDate, courtId } = req.query;

        let matchQuery = {};

        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) matchQuery.date.$gte = new Date(startDate);
            if (endDate) matchQuery.date.$lte = new Date(endDate);
        }

        if (courtId) {
            matchQuery.court = courtId;
        }

        const stats = await Booking.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalAmount' },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    averageBookingValue: { $avg: '$pricing.totalAmount' }
                }
            }
        ]);

        const courtStats = await Booking.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$court',
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$pricing.totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'courts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courtInfo'
                }
            },
            {
                $unwind: '$courtInfo'
            },
            {
                $project: {
                    courtName: '$courtInfo.name',
                    bookings: 1,
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: stats[0] || {
                    totalBookings: 0,
                    totalRevenue: 0,
                    confirmedBookings: 0,
                    cancelledBookings: 0,
                    completedBookings: 0,
                    averageBookingValue: 0
                },
                courtStats
            }
        });

    } catch (error) {
        next(error);
    }
});

export default router;