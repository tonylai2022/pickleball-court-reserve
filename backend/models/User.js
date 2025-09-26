import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    // Basic user information
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allow null values but maintain uniqueness when present
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^1[3-9]\d{9}$/, 'Please enter a valid Chinese phone number']
    },
    password: {
        type: String,
        minlength: 6,
        select: false // Don't include password in queries by default
    },

    // WeChat integration
    wechatInfo: {
        openid: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        unionid: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        nickname: String,
        avatarUrl: String,
        gender: {
            type: Number,
            enum: [0, 1, 2], // 0: unknown, 1: male, 2: female
            default: 0
        },
        city: String,
        province: String,
        country: String,
        language: {
            type: String,
            default: 'zh_CN'
        }
    },

    // User profile
    profile: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        avatar: String,
        bio: {
            type: String,
            maxlength: 500
        },
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'professional'],
            default: 'beginner'
        },
        preferredPlayTime: [{
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'weekend']
        }],
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        }
    },

    // Membership information
    membership: {
        type: {
            type: String,
            enum: ['none', 'basic', 'premium', 'vip'],
            default: 'none'
        },
        startDate: Date,
        endDate: Date,
        autoRenew: {
            type: Boolean,
            default: false
        },
        discountRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 0.5
        },
        benefits: [{
            name: String,
            description: String,
            active: {
                type: Boolean,
                default: true
            }
        }]
    },

    // Booking preferences
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            wechat: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        defaultCourtType: String,
        favoritePartners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        blacklistedPartners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },

    // Statistics
    stats: {
        totalBookings: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        totalPlayTime: {
            type: Number,
            default: 0
        },
        favoriteTimeSlots: [{
            hour: Number,
            count: Number
        }],
        lastBookingDate: Date,
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        ratingCount: {
            type: Number,
            default: 0
        }
    },

    // Account settings
    settings: {
        language: {
            type: String,
            enum: ['zh_CN', 'zh_TW', 'en_US'],
            default: 'zh_CN'
        },
        timezone: {
            type: String,
            default: 'Asia/Shanghai'
        },
        currency: {
            type: String,
            default: 'CNY'
        }
    },

    // Security and verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isWechatVerified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },

    // Account status
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned', 'inactive'],
        default: 'active'
    },
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0
    },

    // Admin fields
    role: {
        type: String,
        enum: ['user', 'staff', 'admin', 'super_admin'],
        default: 'user'
    },
    permissions: [{
        type: String
    }],

    // Audit fields
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
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ 'wechatInfo.openid': 1 });
userSchema.index({ 'wechatInfo.unionid': 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'membership.type': 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.lastName}${this.profile.firstName}`;
    }
    return this.wechatInfo.nickname || this.username;
});

// Virtual for membership status
userSchema.virtual('isMember').get(function () {
    if (!this.membership || this.membership.type === 'none') return false;

    const now = new Date();
    return this.membership.endDate ? this.membership.endDate > now : false;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    if (this.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLoginInfo = function () {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
    if (this.role === 'super_admin') return true;
    return this.permissions.includes(permission);
};

// Static method to find by WeChat openid
userSchema.statics.findByWechatOpenid = function (openid) {
    return this.findOne({ 'wechatInfo.openid': openid });
};

// Static method to find by WeChat unionid
userSchema.statics.findByWechatUnionid = function (unionid) {
    return this.findOne({ 'wechatInfo.unionid': unionid });
};

const User = mongoose.model('User', userSchema);

export default User;