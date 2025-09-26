import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
    // Membership plan details
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        maxlength: 1000
    },

    // Membership type and tier
    type: {
        type: String,
        enum: ['basic', 'premium', 'vip', 'corporate'],
        required: true
    },
    tier: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    // Pricing structure
    pricing: {
        monthly: {
            price: Number,
            currency: {
                type: String,
                default: 'CNY'
            }
        },
        quarterly: {
            price: Number,
            discount: {
                type: Number,
                default: 0
            }
        },
        annual: {
            price: Number,
            discount: {
                type: Number,
                default: 0
            }
        },
        lifetime: {
            price: Number,
            available: {
                type: Boolean,
                default: false
            }
        }
    },

    // Benefits and features
    benefits: {
        discountRate: {
            type: Number,
            required: true,
            min: 0,
            max: 0.5
        },
        priorityBooking: {
            type: Boolean,
            default: false
        },
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        freeBookingsPerMonth: {
            type: Number,
            default: 0
        },
        freeEquipmentRentals: {
            type: Number,
            default: 0
        },
        guestPasses: {
            count: {
                type: Number,
                default: 0
            },
            discountRate: {
                type: Number,
                default: 0
            }
        },
        accessToEvents: {
            type: Boolean,
            default: false
        },
        personalTraining: {
            sessions: {
                type: Number,
                default: 0
            },
            discountRate: {
                type: Number,
                default: 0
            }
        },
        loungeAccess: {
            type: Boolean,
            default: false
        },
        parkingIncluded: {
            type: Boolean,
            default: false
        }
    },

    // Restrictions and limits
    restrictions: {
        peakHourAccess: {
            type: Boolean,
            default: true
        },
        weekendAccess: {
            type: Boolean,
            default: true
        },
        maxBookingsPerDay: {
            type: Number,
            default: 3
        },
        maxBookingsPerWeek: {
            type: Number,
            default: 10
        },
        cancellationPolicy: {
            freeUntilHours: {
                type: Number,
                default: 24
            },
            penaltyRate: {
                type: Number,
                default: 0
            }
        }
    },

    // Membership status and availability
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
    },

    isPubliclyAvailable: {
        type: Boolean,
        default: true
    },

    maxMembers: {
        type: Number,
        default: null // unlimited if null
    },

    currentMembers: {
        type: Number,
        default: 0
    },

    // Promotional details
    promotion: {
        isPromotional: {
            type: Boolean,
            default: false
        },
        originalPrice: Number,
        promotionEndDate: Date,
        promotionDescription: String
    },

    // Terms and conditions
    terms: {
        minimumCommitment: {
            months: {
                type: Number,
                default: 1
            }
        },
        autoRenewal: {
            enabled: {
                type: Boolean,
                default: true
            },
            noticePeriod: {
                type: Number,
                default: 30 // days
            }
        },
        freezePolicy: {
            allowFreeze: {
                type: Boolean,
                default: false
            },
            maxFreezeDays: {
                type: Number,
                default: 0
            },
            freezeFee: {
                type: Number,
                default: 0
            }
        },
        transferPolicy: {
            allowTransfer: {
                type: Boolean,
                default: false
            },
            transferFee: {
                type: Number,
                default: 0
            }
        }
    },

    // Analytics and tracking
    analytics: {
        totalSignups: {
            type: Number,
            default: 0
        },
        activeMembers: {
            type: Number,
            default: 0
        },
        churnRate: {
            type: Number,
            default: 0
        },
        averageLifetime: {
            type: Number,
            default: 0 // months
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        }
    },

    // Admin fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Individual membership instance schema
const membershipInstanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    membershipPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Membership',
        required: true
    },

    membershipNumber: {
        type: String,
        unique: true,
        required: true
    },

    // Membership period
    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    // Billing information
    billing: {
        cycle: {
            type: String,
            enum: ['monthly', 'quarterly', 'annual', 'lifetime'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        nextBillingDate: Date,
        autoRenewal: {
            type: Boolean,
            default: true
        },
        paymentMethod: {
            type: String,
            enum: ['wechat_pay', 'alipay', 'credit_card', 'bank_transfer']
        }
    },

    // Status tracking
    status: {
        type: String,
        enum: ['active', 'suspended', 'expired', 'cancelled', 'frozen'],
        default: 'active',
        index: true
    },

    // Usage tracking
    usage: {
        bookingsThisMonth: {
            type: Number,
            default: 0
        },
        freeBookingsUsed: {
            type: Number,
            default: 0
        },
        equipmentRentalsUsed: {
            type: Number,
            default: 0
        },
        guestPassesUsed: {
            type: Number,
            default: 0
        },
        personalTrainingUsed: {
            type: Number,
            default: 0
        },
        totalSavings: {
            type: Number,
            default: 0
        }
    },

    // Freeze/suspension details
    freezeInfo: {
        isFrozen: {
            type: Boolean,
            default: false
        },
        frozenFrom: Date,
        frozenUntil: Date,
        reason: String,
        daysUsed: {
            type: Number,
            default: 0
        }
    },

    // Cancellation details
    cancellation: {
        requestDate: Date,
        effectiveDate: Date,
        reason: String,
        refundAmount: {
            type: Number,
            default: 0
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Payment history reference
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],

    // Admin fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for membership plans
membershipSchema.index({ code: 1 });
membershipSchema.index({ type: 1, tier: 1 });
membershipSchema.index({ status: 1 });

// Indexes for membership instances
membershipInstanceSchema.index({ user: 1 });
membershipInstanceSchema.index({ membershipPlan: 1 });
membershipInstanceSchema.index({ status: 1 });
membershipInstanceSchema.index({ startDate: 1, endDate: 1 });
membershipInstanceSchema.index({ 'billing.nextBillingDate': 1 });

// Virtual for membership plan availability
membershipSchema.virtual('isAvailable').get(function () {
    return this.status === 'active' && this.isPubliclyAvailable &&
        (this.maxMembers === null || this.currentMembers < this.maxMembers);
});

// Virtual for days remaining in membership
membershipInstanceSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for membership progress
membershipInstanceSchema.virtual('utilizationRate').get(function () {
    if (!this.membershipPlan) return 0;

    const maxBookings = this.membershipPlan.restrictions.maxBookingsPerMonth || 30;
    return this.usage.bookingsThisMonth / maxBookings;
});

// Method to check if membership is currently valid
membershipInstanceSchema.methods.isValid = function () {
    const now = new Date();
    return this.status === 'active' &&
        this.startDate <= now &&
        this.endDate > now &&
        !this.freezeInfo.isFrozen;
};

// Method to calculate remaining benefits
membershipInstanceSchema.methods.getRemainingBenefits = function () {
    if (!this.membershipPlan) return {};

    const benefits = this.membershipPlan.benefits;

    return {
        freeBookings: Math.max(0, benefits.freeBookingsPerMonth - this.usage.freeBookingsUsed),
        equipmentRentals: Math.max(0, benefits.freeEquipmentRentals - this.usage.equipmentRentalsUsed),
        guestPasses: Math.max(0, benefits.guestPasses.count - this.usage.guestPassesUsed),
        personalTraining: Math.max(0, benefits.personalTraining.sessions - this.usage.personalTrainingUsed)
    };
};

// Method to freeze membership
membershipInstanceSchema.methods.freeze = function (days, reason = '') {
    if (!this.membershipPlan.terms.freezePolicy.allowFreeze) {
        throw new Error('Freeze not allowed for this membership plan');
    }

    const maxDays = this.membershipPlan.terms.freezePolicy.maxFreezeDays;
    if (this.freezeInfo.daysUsed + days > maxDays) {
        throw new Error(`Cannot freeze for ${days} days. Maximum allowed: ${maxDays - this.freezeInfo.daysUsed}`);
    }

    this.status = 'frozen';
    this.freezeInfo.isFrozen = true;
    this.freezeInfo.frozenFrom = new Date();
    this.freezeInfo.frozenUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    this.freezeInfo.reason = reason;
    this.freezeInfo.daysUsed += days;

    // Extend membership end date
    this.endDate = new Date(this.endDate.getTime() + days * 24 * 60 * 60 * 1000);

    return this.save();
};

// Pre-save middleware for membership instances
membershipInstanceSchema.pre('save', function (next) {
    if (this.isNew && !this.membershipNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        this.membershipNumber = `MB-${this.membershipPlan.code}-${timestamp}${random}`;
    }
    next();
});

// Static method to find expiring memberships
membershipInstanceSchema.statics.findExpiring = function (days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        status: 'active',
        endDate: { $lte: futureDate, $gte: new Date() }
    }).populate('user membershipPlan');
};

// Static method to calculate membership metrics
membershipSchema.statics.getMetrics = function () {
    return this.aggregate([
        { $match: { status: 'active' } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$analytics.totalRevenue' },
                avgPrice: { $avg: '$pricing.monthly.price' }
            }
        }
    ]);
};

const Membership = mongoose.model('Membership', membershipSchema);
const MembershipInstance = mongoose.model('MembershipInstance', membershipInstanceSchema);

export { Membership, MembershipInstance };
export default Membership;