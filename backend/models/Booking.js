import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    // Booking reference
    bookingNumber: {
        type: String,
        unique: true,
        required: true,
        uppercase: true
    },

    // User and court references
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true,
        index: true
    },

    // Booking time details
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
        type: Date,
        required: true,
        index: true
    },
    duration: {
        type: Number, // minutes
        required: true
    },

    // Booking details
    players: {
        count: {
            type: Number,
            default: 2,
            min: 1,
            max: 8
        },
        guests: [{
            name: String,
            phone: String,
            skillLevel: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced', 'professional']
            }
        }],
        invitedUsers: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending'
            },
            invitedAt: {
                type: Date,
                default: Date.now
            },
            respondedAt: Date
        }]
    },

    // Equipment rentals
    equipment: {
        rackets: {
            quantity: {
                type: Number,
                default: 0
            },
            rate: Number,
            total: {
                type: Number,
                default: 0
            }
        },
        balls: {
            quantity: {
                type: Number,
                default: 0
            },
            rate: Number,
            total: {
                type: Number,
                default: 0
            }
        },
        equipmentSet: {
            selected: {
                type: Boolean,
                default: false
            },
            rate: {
                type: Number,
                default: 60
            },
            total: {
                type: Number,
                default: 0
            }
        }
    },

    // Pricing breakdown
    pricing: {
        courtFee: {
            baseRate: Number,
            duration: Number, // minutes
            subtotal: Number
        },
        equipmentFee: {
            type: Number,
            default: 0
        },
        subtotal: Number,
        discount: {
            amount: {
                type: Number,
                default: 0
            },
            type: {
                type: String,
                enum: ['membership', 'promo', 'bulk', 'special']
            },
            code: String,
            rate: Number
        },
        tax: {
            amount: {
                type: Number,
                default: 0
            },
            rate: {
                type: Number,
                default: 0
            }
        },
        total: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'CNY'
        }
    },

    // Payment information
    payment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending',
            index: true
        },
        method: {
            type: String,
            enum: ['wechat_pay', 'alipay', 'credit_card', 'cash', 'member_credit', 'free'],
            required: true
        },
        transactionId: String,
        wechatOrderId: String,
        paidAt: Date,
        refundedAt: Date,
        refundAmount: Number,
        refundReason: String
    },

    // Booking status and lifecycle
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'],
        default: 'pending',
        index: true
    },

    // Important timestamps
    confirmedAt: Date,
    checkedInAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    // Cancellation details
    cancellation: {
        reason: String,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        refundEligible: {
            type: Boolean,
            default: false
        },
        refundAmount: Number,
        penaltyAmount: Number
    },

    // Special requirements and notes
    specialRequests: [{
        type: {
            type: String,
            enum: ['equipment', 'accessibility', 'temperature', 'lighting', 'other']
        },
        description: String,
        fulfilled: {
            type: Boolean,
            default: false
        }
    }],

    internalNotes: {
        type: String,
        maxlength: 1000
    },
    customerNotes: {
        type: String,
        maxlength: 500
    },

    // Recurring booking information
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        parentBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        frequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly']
        },
        endDate: Date,
        nextBookingDate: Date
    },

    // Check-in/Check-out
    checkIn: {
        time: Date,
        method: {
            type: String,
            enum: ['qr_code', 'staff', 'self_service', 'mobile_app']
        },
        location: String,
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    checkOut: {
        time: Date,
        method: {
            type: String,
            enum: ['automatic', 'staff', 'self_service', 'mobile_app']
        },
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Feedback and rating
    feedback: {
        rating: {
            overall: {
                type: Number,
                min: 1,
                max: 5
            },
            court: {
                type: Number,
                min: 1,
                max: 5
            },
            equipment: {
                type: Number,
                min: 1,
                max: 5
            },
            service: {
                type: Number,
                min: 1,
                max: 5
            }
        },
        comment: {
            type: String,
            maxlength: 1000
        },
        submittedAt: Date,
        wouldRecommend: Boolean
    },

    // Promotion and marketing
    promoCode: {
        code: String,
        discount: Number,
        appliedAt: Date
    },

    referralCode: String,
    source: {
        type: String,
        enum: ['web', 'mobile_app', 'wechat_mini', 'phone', 'walk_in', 'staff'],
        default: 'web'
    },

    // Weather and external factors (for outdoor courts)
    weatherInfo: {
        condition: String,
        temperature: Number,
        humidity: Number,
        windSpeed: Number,
        recordedAt: Date
    },

    // Admin and audit fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Version control for concurrent updates
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Compound indexes for performance
bookingSchema.index({ user: 1, startTime: -1 });
bookingSchema.index({ court: 1, startTime: 1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Text index for search
bookingSchema.index({
    bookingNumber: 'text',
    customerNotes: 'text',
    internalNotes: 'text'
});

// Virtual for booking duration in hours
bookingSchema.virtual('durationHours').get(function () {
    return this.duration / 60;
});

// Virtual for days until booking
bookingSchema.virtual('daysUntilBooking').get(function () {
    const now = new Date();
    const bookingDate = new Date(this.startTime);
    const diffTime = bookingDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for booking time slot display
bookingSchema.virtual('timeSlot').get(function () {
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    return `${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
});

// Virtual for total players including guests
bookingSchema.virtual('totalPlayers').get(function () {
    return this.players.count + (this.players.guests ? this.players.guests.length : 0);
});

// Pre-save middleware to generate booking number
bookingSchema.pre('save', async function (next) {
    if (this.isNew && !this.bookingNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingNumber = `TRK-${timestamp}-${random}`;
    }

    // Calculate total equipment cost
    if (this.equipment.equipmentSet.selected) {
        this.equipment.equipmentSet.total = this.equipment.equipmentSet.rate;
    } else {
        this.equipment.rackets.total = this.equipment.rackets.quantity * (this.equipment.rackets.rate || 0);
        this.equipment.balls.total = this.equipment.balls.quantity * (this.equipment.balls.rate || 0);
    }

    // Update pricing
    this.pricing.equipmentFee = this.equipment.equipmentSet.total +
        this.equipment.rackets.total +
        this.equipment.balls.total;

    next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
    if (this.status === 'cancelled' || this.status === 'completed') return false;

    const now = new Date();
    const startTime = new Date(this.startTime);
    const hoursUntilBooking = (startTime - now) / (1000 * 60 * 60);

    return hoursUntilBooking >= 24; // Can cancel up to 24 hours before
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function () {
    if (!this.canBeCancelled()) return 0;

    const now = new Date();
    const startTime = new Date(this.startTime);
    const hoursUntilBooking = (startTime - now) / (1000 * 60 * 60);

    if (hoursUntilBooking >= 24) {
        return this.pricing.total; // Full refund
    } else if (hoursUntilBooking >= 12) {
        return this.pricing.total * 0.5; // 50% refund
    } else {
        return 0; // No refund
    }
};

// Method to update status with timestamp
bookingSchema.methods.updateStatus = function (newStatus, userId = null) {
    this.status = newStatus;
    this.updatedBy = userId;

    switch (newStatus) {
        case 'confirmed':
            this.confirmedAt = new Date();
            break;
        case 'checked_in':
            this.checkedInAt = new Date();
            break;
        case 'completed':
            this.completedAt = new Date();
            break;
        case 'cancelled':
            this.cancelledAt = new Date();
            break;
    }

    return this.save();
};

// Static method to find overlapping bookings
bookingSchema.statics.findOverlapping = function (courtId, startTime, endTime, excludeId = null) {
    const query = {
        court: courtId,
        status: { $in: ['pending', 'confirmed', 'checked_in'] },
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return this.find(query);
};

// Static method to generate booking statistics
bookingSchema.statics.getStats = function (courtId = null, startDate = null, endDate = null) {
    const matchStage = { status: { $ne: 'cancelled' } };

    if (courtId) matchStage.court = mongoose.Types.ObjectId(courtId);
    if (startDate) matchStage.startTime = { $gte: new Date(startDate) };
    if (endDate) {
        if (matchStage.startTime) {
            matchStage.startTime.$lte = new Date(endDate);
        } else {
            matchStage.startTime = { $lte: new Date(endDate) };
        }
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.total' },
                avgBookingValue: { $avg: '$pricing.total' },
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;