import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const createCourtValidation = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('location').trim().isLength({ min: 5, max: 200 }).withMessage('Location must be 5-200 characters'),
    body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
    body('operatingHours.open').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid opening time required'),
    body('operatingHours.close').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid closing time required'),
    body('facilities').optional().isArray().withMessage('Facilities must be an array'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
];

const updateCourtValidation = [
    param('id').isMongoId().withMessage('Valid court ID required'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('location').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Location must be 5-200 characters'),
    body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
    body('operatingHours.open').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid opening time required'),
    body('operatingHours.close').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid closing time required'),
    body('facilities').optional().isArray().withMessage('Facilities must be an array'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
];

// Get all courts
router.get('/', validateRequest, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            active,
            location,
            minPrice,
            maxPrice
        } = req.query;

        let query = {};

        // Filter by active status
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        // Filter by location (case-insensitive partial match)
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = parseFloat(minPrice);
            if (maxPrice) query.pricePerHour.$lte = parseFloat(maxPrice);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            select: '-__v'
        };

        const result = await Court.paginate(query, options);

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

// Get single court
router.get('/:id', validateRequest, async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id);

        if (!court) {
            throw new AppError('Court not found', 404);
        }

        // Get upcoming bookings for this court (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingBookings = await Booking.find({
            court: court._id,
            date: { $gte: today, $lte: nextWeek },
            status: { $in: ['confirmed', 'pending'] }
        }).select('date startTime endTime status');

        res.json({
            success: true,
            data: {
                court,
                upcomingBookings
            }
        });

    } catch (error) {
        next(error);
    }
});

// Create new court (admin/manager only)
router.post('/', authenticate, authorize('admin', 'manager'), createCourtValidation, validateRequest, async (req, res, next) => {
    try {
        const {
            name,
            location,
            description,
            pricePerHour,
            operatingHours,
            facilities = [],
            images = []
        } = req.body;

        // Validate operating hours
        const openTime = new Date(`1970-01-01T${operatingHours.open}:00`);
        const closeTime = new Date(`1970-01-01T${operatingHours.close}:00`);

        if (openTime >= closeTime) {
            throw new AppError('Closing time must be after opening time', 400);
        }

        const court = new Court({
            name,
            location,
            description,
            pricePerHour,
            operatingHours,
            facilities,
            images,
            isActive: true,
            createdBy: req.user.id
        });

        await court.save();

        res.status(201).json({
            success: true,
            data: court
        });

    } catch (error) {
        next(error);
    }
});

// Update court (admin/manager only)
router.patch('/:id', authenticate, authorize('admin', 'manager'), updateCourtValidation, validateRequest, async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id);

        if (!court) {
            throw new AppError('Court not found', 404);
        }

        // Validate operating hours if provided
        if (req.body.operatingHours) {
            const { open, close } = req.body.operatingHours;
            if (open && close) {
                const openTime = new Date(`1970-01-01T${open}:00`);
                const closeTime = new Date(`1970-01-01T${close}:00`);

                if (openTime >= closeTime) {
                    throw new AppError('Closing time must be after opening time', 400);
                }
            }
        }

        // Update court
        Object.assign(court, req.body);
        court.updatedAt = new Date();
        await court.save();

        res.json({
            success: true,
            data: court
        });

    } catch (error) {
        next(error);
    }
});

// Delete court (admin only)
router.delete('/:id', authenticate, authorize('admin'), validateRequest, async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id);

        if (!court) {
            throw new AppError('Court not found', 404);
        }

        // Check if court has future bookings
        const futureBookings = await Booking.countDocuments({
            court: court._id,
            date: { $gte: new Date() },
            status: { $in: ['confirmed', 'pending'] }
        });

        if (futureBookings > 0) {
            throw new AppError('Cannot delete court with future bookings', 400);
        }

        await Court.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Court deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Get court availability for a specific date
router.get('/:id/availability', validateRequest, async (req, res, next) => {
    try {
        const { date } = req.query;

        if (!date) {
            throw new AppError('Date parameter is required', 400);
        }

        const court = await Court.findById(req.params.id);

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
                    location: court.location,
                    pricePerHour: court.pricePerHour,
                    operatingHours: court.operatingHours
                },
                date: targetDate,
                availableSlots
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get court statistics (admin/manager only)
router.get('/:id/stats', authenticate, authorize('admin', 'manager'), validateRequest, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const court = await Court.findById(req.params.id);

        if (!court) {
            throw new AppError('Court not found', 404);
        }

        let matchQuery = { court: court._id };

        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) matchQuery.date.$gte = new Date(startDate);
            if (endDate) matchQuery.date.$lte = new Date(endDate);
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

        // Get monthly stats
        const monthlyStats = await Booking.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$pricing.totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                court: {
                    id: court._id,
                    name: court.name,
                    location: court.location
                },
                summary: stats[0] || {
                    totalBookings: 0,
                    totalRevenue: 0,
                    confirmedBookings: 0,
                    cancelledBookings: 0,
                    completedBookings: 0,
                    averageBookingValue: 0
                },
                monthlyStats
            }
        });

    } catch (error) {
        next(error);
    }
});

// Bulk update court status (admin only)
router.patch('/bulk/status', authenticate, authorize('admin'), validateRequest, async (req, res, next) => {
    try {
        const { courtIds, isActive } = req.body;

        if (!Array.isArray(courtIds) || courtIds.length === 0) {
            throw new AppError('Court IDs array is required', 400);
        }

        if (typeof isActive !== 'boolean') {
            throw new AppError('isActive must be a boolean', 400);
        }

        const result = await Court.updateMany(
            { _id: { $in: courtIds } },
            { isActive, updatedAt: new Date() }
        );

        res.json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                message: `${result.modifiedCount} courts updated successfully`
            }
        });

    } catch (error) {
        next(error);
    }
});

export default router;