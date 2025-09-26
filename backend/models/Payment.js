import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    // Payment reference and tracking
    paymentId: {
        type: String,
        unique: true,
        required: true
    },

    // Related entities
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        index: true
    },

    membershipInstance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipInstance',
        index: true
    },

    // Payment details
    type: {
        type: String,
        enum: ['booking', 'membership', 'equipment', 'penalty', 'refund', 'credit'],
        required: true,
        index: true
    },

    method: {
        type: String,
        enum: ['wechat_pay', 'alipay', 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'member_credit', 'gift_card'],
        required: true,
        index: true
    },

    // Amount details
    amount: {
        original: {
            type: Number,
            required: true
        },
        final: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'CNY'
        },
        exchangeRate: {
            type: Number,
            default: 1
        }
    },

    // Payment breakdown
    breakdown: {
        baseAmount: Number,
        discountAmount: {
            type: Number,
            default: 0
        },
        taxAmount: {
            type: Number,
            default: 0
        },
        feeAmount: {
            type: Number,
            default: 0
        },
        tipAmount: {
            type: Number,
            default: 0
        }
    },

    // Payment status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'expired'],
        default: 'pending',
        index: true
    },

    // WeChat Pay specific fields
    wechatPay: {
        appid: String,
        mch_id: String,
        out_trade_no: String, // Our order number
        transaction_id: String, // WeChat transaction ID
        trade_type: {
            type: String,
            enum: ['JSAPI', 'NATIVE', 'APP', 'MWEB', 'MICROPAY']
        },
        prepay_id: String,
        code_url: String, // For NATIVE payments (QR code)
        openid: String, // User's WeChat openid
        unionid: String,
        attach: String, // Custom data
        fee_type: {
            type: String,
            default: 'CNY'
        },
        bank_type: String,
        settlement_total_fee: Number,
        cash_fee: Number,
        coupon_fee: Number,
        time_start: String,
        time_expire: String
    },

    // Alipay specific fields
    alipay: {
        app_id: String,
        out_trade_no: String,
        trade_no: String, // Alipay transaction number
        buyer_id: String,
        buyer_logon_id: String,
        seller_id: String,
        trade_status: String,
        receipt_amount: String,
        point_amount: String,
        invoice_amount: String
    },

    // Credit card fields (if applicable)
    creditCard: {
        last4: String,
        brand: String,
        expiryMonth: Number,
        expiryYear: Number,
        holderName: String,
        issuer: String,
        country: String
    },

    // Gateway and processing info
    gateway: {
        provider: String, // 'wechat', 'alipay', 'stripe', etc.
        providerId: String,
        providerFee: Number,
        providerResponse: mongoose.Schema.Types.Mixed,
        webhookReceived: {
            type: Boolean,
            default: false
        },
        webhookData: mongoose.Schema.Types.Mixed
    },

    // Timing information
    timing: {
        initiatedAt: {
            type: Date,
            default: Date.now
        },
        authorizedAt: Date,
        capturedAt: Date,
        completedAt: Date,
        failedAt: Date,
        cancelledAt: Date,
        refundedAt: Date,
        expiresAt: Date
    },

    // Refund information
    refund: {
        isRefunded: {
            type: Boolean,
            default: false
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        refundReason: String,
        refundRequestedAt: Date,
        refundCompletedAt: Date,
        refundTransactionId: String,
        refundedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        refundMethod: {
            type: String,
            enum: ['original', 'credit', 'cash', 'bank_transfer']
        }
    },

    // Dispute and chargeback info
    dispute: {
        hasDispute: {
            type: Boolean,
            default: false
        },
        disputeId: String,
        disputeReason: String,
        disputeStatus: String,
        disputeAmount: Number,
        disputeDate: Date,
        evidenceRequired: Boolean,
        evidenceSubmittedAt: Date
    },

    // Customer information at time of payment
    customer: {
        ipAddress: String,
        userAgent: String,
        deviceType: {
            type: String,
            enum: ['mobile', 'tablet', 'desktop', 'unknown']
        },
        location: {
            country: String,
            region: String,
            city: String
        }
    },

    // Security and fraud detection
    security: {
        riskScore: {
            type: Number,
            min: 0,
            max: 100
        },
        fraudFlags: [String],
        verificationChecks: {
            cvv: String,
            address: String,
            postal: String,
            phone: String
        },
        threeDSecure: {
            authenticated: Boolean,
            version: String,
            eci: String,
            cavv: String,
            xid: String
        }
    },

    // Receipt and notification
    receipt: {
        receiptNumber: String,
        receiptUrl: String,
        emailSent: {
            type: Boolean,
            default: false
        },
        emailSentAt: Date,
        wechatNotificationSent: {
            type: Boolean,
            default: false
        },
        smsNotificationSent: {
            type: Boolean,
            default: false
        }
    },

    // Metadata and custom fields
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile_app', 'wechat_mini', 'admin_panel']
        },
        campaignId: String,
        referralCode: String,
        promoCode: String,
        notes: String,
        tags: [String]
    },

    // Reconciliation
    reconciliation: {
        isReconciled: {
            type: Boolean,
            default: false
        },
        reconciledAt: Date,
        bankStatementId: String,
        settlementId: String,
        settlementDate: Date,
        settlementAmount: Number,
        fees: {
            processing: Number,
            interchange: Number,
            assessment: Number,
            other: Number
        }
    },

    // Admin and audit
    adminNotes: String,
    flags: [{
        type: String,
        description: String,
        flaggedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        flaggedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Parent payment for partial refunds
    parentPayment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },

    // Child payments for splits
    childPayments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],

    // Version for optimistic locking
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

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ membershipInstance: 1 });
paymentSchema.index({ status: 1, method: 1 });
paymentSchema.index({ type: 1, createdAt: -1 });
paymentSchema.index({ 'wechatPay.out_trade_no': 1 });
paymentSchema.index({ 'wechatPay.transaction_id': 1 });
paymentSchema.index({ 'alipay.out_trade_no': 1 });
paymentSchema.index({ 'alipay.trade_no': 1 });
paymentSchema.index({ 'timing.completedAt': -1 });
paymentSchema.index({ 'reconciliation.isReconciled': 1 });

// Virtual for net amount (after refunds)
paymentSchema.virtual('netAmount').get(function () {
    return this.amount.final - this.refund.refundAmount;
});

// Virtual for payment age in days
paymentSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
paymentSchema.virtual('processingTime').get(function () {
    if (!this.timing.completedAt || !this.timing.initiatedAt) return null;
    return this.timing.completedAt - this.timing.initiatedAt; // milliseconds
});

// Pre-save middleware
paymentSchema.pre('save', function (next) {
    if (this.isNew && !this.paymentId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.paymentId = `PAY-${timestamp}-${random}`;
    }

    // Set final amount if not set
    if (!this.amount.final) {
        this.amount.final = this.amount.original - this.breakdown.discountAmount;
    }

    next();
});

// Method to update payment status
paymentSchema.methods.updateStatus = function (newStatus, additionalData = {}) {
    const oldStatus = this.status;
    this.status = newStatus;

    // Update timing based on status
    switch (newStatus) {
        case 'processing':
            if (!this.timing.authorizedAt) this.timing.authorizedAt = new Date();
            break;
        case 'completed':
            if (!this.timing.completedAt) this.timing.completedAt = new Date();
            if (!this.timing.capturedAt) this.timing.capturedAt = new Date();
            break;
        case 'failed':
            this.timing.failedAt = new Date();
            break;
        case 'cancelled':
            this.timing.cancelledAt = new Date();
            break;
        case 'refunded':
        case 'partially_refunded':
            if (!this.timing.refundedAt) this.timing.refundedAt = new Date();
            break;
    }

    // Merge additional data
    Object.assign(this, additionalData);

    return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function (amount, reason, refundedBy) {
    if (this.status !== 'completed') {
        throw new Error('Can only refund completed payments');
    }

    const maxRefundAmount = this.amount.final - this.refund.refundAmount;
    if (amount > maxRefundAmount) {
        throw new Error(`Refund amount cannot exceed ${maxRefundAmount}`);
    }

    this.refund.isRefunded = true;
    this.refund.refundAmount += amount;
    this.refund.refundReason = reason;
    this.refund.refundRequestedAt = new Date();
    this.refund.refundedBy = refundedBy;

    // Update status
    if (this.refund.refundAmount >= this.amount.final) {
        this.status = 'refunded';
    } else {
        this.status = 'partially_refunded';
    }

    return this.save();
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function () {
    if (this.status !== 'completed') return false;
    if (this.refund.refundAmount >= this.amount.final) return false;

    // Check if payment is too old (e.g., 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (this.timing.completedAt < sixMonthsAgo) return false;

    return true;
};

// Static method to find payments for reconciliation
paymentSchema.statics.findUnreconciled = function (startDate, endDate) {
    const query = {
        status: 'completed',
        'reconciliation.isReconciled': false
    };

    if (startDate || endDate) {
        query['timing.completedAt'] = {};
        if (startDate) query['timing.completedAt'].$gte = new Date(startDate);
        if (endDate) query['timing.completedAt'].$lte = new Date(endDate);
    }

    return this.find(query).sort({ 'timing.completedAt': 1 });
};

// Static method to get payment statistics
paymentSchema.statics.getStats = function (startDate, endDate, filters = {}) {
    const matchStage = { status: 'completed', ...filters };

    if (startDate || endDate) {
        matchStage['timing.completedAt'] = {};
        if (startDate) matchStage['timing.completedAt'].$gte = new Date(startDate);
        if (endDate) matchStage['timing.completedAt'].$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount.final' },
                averageAmount: { $avg: '$amount.final' },
                totalRefunded: { $sum: '$refund.refundAmount' },
                paymentsByMethod: {
                    $push: {
                        method: '$method',
                        amount: '$amount.final'
                    }
                }
            }
        },
        {
            $addFields: {
                netAmount: { $subtract: ['$totalAmount', '$totalRefunded'] }
            }
        }
    ]);
};

// Static method to find expired pending payments
paymentSchema.statics.findExpired = function () {
    return this.find({
        status: 'pending',
        'timing.expiresAt': { $lt: new Date() }
    });
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;