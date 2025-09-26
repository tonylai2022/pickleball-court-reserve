import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
    // Basic equipment information
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

    category: {
        type: String,
        enum: ['racket', 'ball', 'net', 'set', 'accessory'],
        required: true,
        index: true
    },

    subcategory: {
        type: String,
        enum: ['paddle', 'pickleball', 'net_system', 'equipment_set', 'bag', 'grip', 'string', 'shoe']
    },

    description: {
        type: String,
        maxlength: 1000
    },

    // Equipment specifications
    specifications: {
        brand: String,
        model: String,
        weight: Number, // grams
        material: String,
        color: String,
        size: String,
        dimensions: {
            length: Number, // cm
            width: Number,  // cm
            height: Number  // cm
        },
        suitableFor: [{
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'professional', 'kids', 'adults']
        }]
    },

    // Inventory management
    inventory: {
        totalQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        availableQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        reservedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        damagedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        inServiceQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        minimumStock: {
            type: Number,
            default: 5
        },
        reorderLevel: {
            type: Number,
            default: 10
        }
    },

    // Rental information
    rental: {
        isRentable: {
            type: Boolean,
            default: true
        },
        hourlyRate: {
            type: Number,
            required: true,
            min: 0
        },
        dailyRate: Number,
        weeklyRate: Number,
        deposit: {
            type: Number,
            default: 0
        },
        maxRentalDays: {
            type: Number,
            default: 7
        }
    },

    // Purchase information
    purchase: {
        isForSale: {
            type: Boolean,
            default: false
        },
        salePrice: Number,
        costPrice: Number,
        supplier: String,
        supplierCode: String,
        lastPurchaseDate: Date,
        lastPurchasePrice: Number,
        warranty: {
            duration: Number, // months
            terms: String
        }
    },

    // Condition and maintenance
    condition: {
        overall: {
            type: String,
            enum: ['excellent', 'very_good', 'good', 'fair', 'poor', 'damaged'],
            default: 'excellent'
        },
        lastInspection: Date,
        nextInspection: Date,
        maintenanceRequired: {
            type: Boolean,
            default: false
        },
        maintenanceNotes: String,
        retirementDate: Date
    },

    // Individual item tracking (for high-value items)
    items: [{
        serialNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        barcode: String,
        rfidTag: String,
        purchaseDate: Date,
        purchasePrice: Number,
        condition: {
            type: String,
            enum: ['excellent', 'very_good', 'good', 'fair', 'poor', 'damaged'],
            default: 'excellent'
        },
        location: String,
        lastUsed: Date,
        totalUsageHours: {
            type: Number,
            default: 0
        },
        rentalHistory: [{
            booking: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booking'
            },
            rentedAt: Date,
            returnedAt: Date,
            condition: String,
            notes: String
        }],
        maintenanceHistory: [{
            date: Date,
            type: {
                type: String,
                enum: ['cleaning', 'repair', 'replacement', 'inspection']
            },
            description: String,
            cost: Number,
            performedBy: String
        }],
        status: {
            type: String,
            enum: ['available', 'rented', 'maintenance', 'damaged', 'retired'],
            default: 'available'
        }
    }],

    // Usage statistics
    stats: {
        totalRentals: {
            type: Number,
            default: 0
        },
        totalRentalHours: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        averageRentalDuration: {
            type: Number,
            default: 0
        },
        utilizationRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },
        lastRentalDate: Date,
        popularityScore: {
            type: Number,
            default: 0
        }
    },

    // Media and documentation
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    documents: [{
        name: String,
        type: {
            type: String,
            enum: ['manual', 'warranty', 'certificate', 'inspection_report']
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Equipment set configuration (for bundled items)
    setConfiguration: {
        isSet: {
            type: Boolean,
            default: false
        },
        includedItems: [{
            equipment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Equipment'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }],
        setDiscount: {
            type: Number,
            default: 0
        }
    },

    // Booking and availability rules
    bookingRules: {
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        minimumRentalDuration: {
            type: Number,
            default: 60 // minutes
        },
        allowBackToBackRentals: {
            type: Boolean,
            default: true
        },
        cleaningTimeBetweenRentals: {
            type: Number,
            default: 15 // minutes
        }
    },

    // Status and availability
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued', 'maintenance'],
        default: 'active'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // Tags for categorization and search
    tags: [String],

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
equipmentSchema.index({ code: 1 });
equipmentSchema.index({ category: 1, subcategory: 1 });
equipmentSchema.index({ status: 1, isActive: 1 });
equipmentSchema.index({ 'specifications.brand': 1 });
equipmentSchema.index({ 'rental.isRentable': 1 });
equipmentSchema.index({ 'inventory.availableQuantity': 1 });
equipmentSchema.index({ tags: 1 });

// Text index for search
equipmentSchema.index({
    name: 'text',
    description: 'text',
    'specifications.brand': 'text',
    'specifications.model': 'text',
    tags: 'text'
});

// Virtual for stock status
equipmentSchema.virtual('stockStatus').get(function () {
    if (this.inventory.availableQuantity === 0) return 'out_of_stock';
    if (this.inventory.availableQuantity <= this.inventory.minimumStock) return 'low_stock';
    if (this.inventory.availableQuantity <= this.inventory.reorderLevel) return 'reorder_soon';
    return 'in_stock';
});

// Virtual for primary image
equipmentSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for set price (if it's a set)
equipmentSchema.virtual('setPrice').get(function () {
    if (!this.setConfiguration.isSet) return this.rental.hourlyRate;

    let totalPrice = 0;
    // In a real implementation, you'd populate and calculate the total
    // For now, return the base rate minus set discount
    return this.rental.hourlyRate * (1 - this.setConfiguration.setDiscount);
});

// Method to check availability for rental
equipmentSchema.methods.checkAvailability = function (startTime, endTime, quantity = 1) {
    if (!this.rental.isRentable || !this.isActive || this.status !== 'active') {
        return { available: false, reason: 'Equipment not available for rental' };
    }

    if (quantity > this.inventory.availableQuantity) {
        return {
            available: false,
            reason: `Only ${this.inventory.availableQuantity} units available, ${quantity} requested`
        };
    }

    // Check if advance booking limit is respected
    const now = new Date();
    const bookingStart = new Date(startTime);
    const daysDifference = (bookingStart - now) / (1000 * 60 * 60 * 24);

    if (daysDifference > this.bookingRules.advanceBookingDays) {
        return {
            available: false,
            reason: `Cannot book more than ${this.bookingRules.advanceBookingDays} days in advance`
        };
    }

    return { available: true, availableQuantity: this.inventory.availableQuantity };
};

// Method to reserve equipment
equipmentSchema.methods.reserve = function (quantity = 1) {
    if (quantity > this.inventory.availableQuantity) {
        throw new Error('Insufficient quantity available');
    }

    this.inventory.availableQuantity -= quantity;
    this.inventory.reservedQuantity += quantity;

    return this.save();
};

// Method to release reservation
equipmentSchema.methods.releaseReservation = function (quantity = 1) {
    if (quantity > this.inventory.reservedQuantity) {
        throw new Error('Cannot release more than reserved');
    }

    this.inventory.availableQuantity += quantity;
    this.inventory.reservedQuantity -= quantity;

    return this.save();
};

// Method to update condition after rental
equipmentSchema.methods.updateAfterRental = function (itemSerialNumber, newCondition, notes) {
    if (itemSerialNumber) {
        const item = this.items.id(itemSerialNumber);
        if (item) {
            item.condition = newCondition;
            item.lastUsed = new Date();
            item.totalUsageHours += 1; // This should be calculated based on actual rental duration
        }
    } else {
        // Update overall condition if no specific item
        this.condition.overall = newCondition;
        this.condition.lastInspection = new Date();
    }

    return this.save();
};

// Static method to find low stock items
equipmentSchema.statics.findLowStock = function () {
    return this.find({
        $expr: { $lte: ['$inventory.availableQuantity', '$inventory.minimumStock'] },
        status: 'active',
        isActive: true
    });
};

// Static method to find available equipment for time period
equipmentSchema.statics.findAvailableForPeriod = function (startTime, endTime, category = null, quantity = 1) {
    const query = {
        status: 'active',
        isActive: true,
        'rental.isRentable': true,
        'inventory.availableQuantity': { $gte: quantity }
    };

    if (category) {
        query.category = category;
    }

    return this.find(query);
};

// Static method to get equipment statistics
equipmentSchema.statics.getStats = function (category = null, startDate = null, endDate = null) {
    const matchStage = { status: 'active' };
    if (category) matchStage.category = category;

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                totalItems: { $sum: '$inventory.totalQuantity' },
                availableItems: { $sum: '$inventory.availableQuantity' },
                totalValue: { $sum: { $multiply: ['$purchase.costPrice', '$inventory.totalQuantity'] } },
                averageUtilization: { $avg: '$stats.utilizationRate' },
                totalRentals: { $sum: '$stats.totalRentals' },
                totalRevenue: { $sum: '$stats.totalRevenue' }
            }
        }
    ]);
};

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;