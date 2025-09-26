import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
    // Basic court information
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^[A-Z0-9]{2,10}$/, 'Court code must be 2-10 alphanumeric characters']
    },
    description: {
        type: String,
        maxlength: 500
    },

    // Court specifications
    specifications: {
        surface: {
            type: String,
            enum: ['indoor_hard', 'outdoor_hard', 'indoor_cushioned', 'outdoor_cushioned'],
            required: true
        },
        size: {
            length: {
                type: Number,
                default: 20 // meters
            },
            width: {
                type: Number,
                default: 10 // meters
            }
        },
        lighting: {
            type: String,
            enum: ['natural', 'led', 'fluorescent', 'mixed'],
            default: 'led'
        },
        ventilation: {
            type: String,
            enum: ['natural', 'mechanical', 'air_conditioned'],
            default: 'air_conditioned'
        },
        maxPlayers: {
            type: Number,
            default: 4,
            min: 2,
            max: 8
        }
    },

    // Pricing configuration
    pricing: {
        baseRate: {
            type: Number,
            required: true,
            min: 0
        },
        peakRate: {
            type: Number,
            min: 0
        },
        weekendRate: {
            type: Number,
            min: 0
        },
        memberDiscount: {
            type: Number,
            default: 0.1,
            min: 0,
            max: 0.5
        },
        currency: {
            type: String,
            default: 'CNY'
        }
    },

    // Operating hours
    operatingHours: {
        monday: {
            open: String, // "06:00"
            close: String, // "24:00"
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        tuesday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        wednesday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        thursday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        friday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        saturday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        },
        sunday: {
            open: String,
            close: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        }
    },

    // Peak hours configuration
    peakHours: [{
        start: String, // "18:00"
        end: String,   // "22:00"
        days: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        multiplier: {
            type: Number,
            default: 1.15,
            min: 1.0,
            max: 3.0
        }
    }],

    // Equipment and amenities
    equipment: {
        nets: {
            count: {
                type: Number,
                default: 1
            },
            type: String,
            condition: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor'],
                default: 'excellent'
            }
        },
        balls: {
            available: {
                type: Number,
                default: 20
            },
            brand: String,
            condition: {
                type: String,
                enum: ['new', 'good', 'used'],
                default: 'new'
            }
        },
        rackets: {
            available: {
                type: Number,
                default: 8
            },
            brands: [String],
            rentalRate: {
                type: Number,
                default: 20
            }
        }
    },

    // Amenities
    amenities: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        available: {
            type: Boolean,
            default: true
        },
        additionalCost: {
            type: Number,
            default: 0
        }
    }],

    // Location and access
    location: {
        building: String,
        floor: String,
        section: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        address: String,
        accessInstructions: String
    },

    // Booking rules
    bookingRules: {
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        minBookingDuration: {
            type: Number,
            default: 60 // minutes
        },
        maxBookingDuration: {
            type: Number,
            default: 180 // minutes
        },
        allowBackToBackBookings: {
            type: Boolean,
            default: true
        },
        requiresApproval: {
            type: Boolean,
            default: false
        },
        cancellationPolicy: {
            freeUntilHours: {
                type: Number,
                default: 24
            },
            penaltyRate: {
                type: Number,
                default: 0.5,
                min: 0,
                max: 1
            }
        }
    },

    // Maintenance and status
    maintenance: {
        lastInspection: Date,
        nextInspection: Date,
        maintenanceHistory: [{
            date: Date,
            type: {
                type: String,
                enum: ['cleaning', 'repair', 'upgrade', 'inspection']
            },
            description: String,
            cost: Number,
            performedBy: String,
            duration: Number // minutes
        }]
    },

    // Court status
    status: {
        type: String,
        enum: ['active', 'maintenance', 'closed', 'reserved'],
        default: 'active'
    },

    // Booking statistics
    stats: {
        totalBookings: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        averageUtilization: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },
        peakUtilizationHours: [{
            hour: Number,
            utilization: Number
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

    // Media
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
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

// Indexes
courtSchema.index({ code: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({ 'specifications.surface': 1 });
courtSchema.index({ 'pricing.baseRate': 1 });
courtSchema.index({ createdAt: -1 });

// Virtual for current availability
courtSchema.virtual('isAvailable').get(function () {
    return this.status === 'active';
});

// Virtual for primary image
courtSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Method to get pricing for specific datetime
courtSchema.methods.getPricing = function (datetime, userMembership = null) {
    const date = new Date(datetime);
    const hour = date.getHours();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const isWeekend = dayOfWeek === 'saturday' || dayOfWeek === 'sunday';

    let baseRate = this.pricing.baseRate;

    // Apply weekend pricing
    if (isWeekend && this.pricing.weekendRate) {
        baseRate = this.pricing.weekendRate;
    }

    // Apply peak hour pricing
    const peakHour = this.peakHours.find(peak =>
        peak.days.includes(dayOfWeek) &&
        hour >= parseInt(peak.start.split(':')[0]) &&
        hour < parseInt(peak.end.split(':')[0])
    );

    if (peakHour) {
        baseRate *= peakHour.multiplier;
    }

    // Apply member discount
    if (userMembership && userMembership.type !== 'none') {
        const discountRate = userMembership.discountRate || this.pricing.memberDiscount;
        baseRate *= (1 - discountRate);
    }

    return Math.round(baseRate * 100) / 100; // Round to 2 decimal places
};

// Method to check availability for time slot
courtSchema.methods.isAvailableAt = function (datetime) {
    const date = new Date(datetime);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const timeStr = date.toTimeString().substring(0, 5); // "HH:MM"

    const operatingHours = this.operatingHours[dayOfWeek];
    if (!operatingHours.isOpen) return false;

    return timeStr >= operatingHours.open && timeStr <= operatingHours.close;
};

// Static method to find available courts for time period
courtSchema.statics.findAvailable = function (startTime, endTime, excludeBookings = []) {
    return this.find({
        status: 'active'
    });
};

const Court = mongoose.model('Court', courtSchema);

export default Court;