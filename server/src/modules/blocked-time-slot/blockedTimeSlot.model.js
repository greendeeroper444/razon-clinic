const mongoose = require('mongoose');

const blockedTimeSlotSchema = new mongoose.Schema(
    {
        startDate: {
            type: Date,
            required: true,
            index: true
        },
        endDate: {
            type: Date,
            required: true,
            index: true
        },
        startTime: {
            type: String,
            required: false,
            match: /^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/
        },
        endTime: {
            type: String,
            required: false,
            match: /^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/
        },
        
        reason: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
            enum: [
                'Doctor Unavailable',
                'Holiday',
                'Maintenance',
                'Emergency',
                'Meeting',
                'Training',
                'Other'
            ]
        },
        
        customReason: {
            type: String,
            trim: true,
            maxlength: 100
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

blockedTimeSlotSchema.index({ startDate: 1, endDate: 1 });
blockedTimeSlotSchema.index({ isActive: 1, startDate: 1 });

blockedTimeSlotSchema.pre('validate', function(next) {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        return next(new Error('End date must be after or equal to start date'));
    }
    
    if (this.startTime && this.endTime) {
        const start = this.startTime.split(':').map(Number);
        const end = this.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        
        if (startMinutes >= endMinutes) {
            return next(new Error('End time must be after start time'));
        }
    }
    
    next();
});

blockedTimeSlotSchema.methods.isDateTimeBlocked = function(date, time) {
    if (!this.isActive) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(this.endDate);
    end.setHours(0, 0, 0, 0);
    
    if (checkDate < start || checkDate > end) {
        return false;
    }
    
    const check = time.split(':').map(Number);
    const startTime = this.startTime.split(':').map(Number);
    const endTime = this.endTime.split(':').map(Number);
    
    const checkMinutes = check[0] * 60 + check[1];
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    return checkMinutes >= startMinutes && checkMinutes <= endMinutes;
};

// Static method to check if a specific date/time is blocked
blockedTimeSlotSchema.statics.isDateTimeBlocked = async function(date, time) {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const blockedSlots = await this.find({
        startDate: { $lte: checkDate },
        endDate: { $gte: checkDate },
        isActive: true
    });
    
    for (const slot of blockedSlots) {
        if (slot.isDateTimeBlocked(date, time)) {
            return {
                isBlocked: true,
                reason: slot.reason,
                customReason: slot.customReason
            };
        }
    }
    
    return { isBlocked: false };
};

// Get all blocked time slots for a specific date
blockedTimeSlotSchema.statics.getBlockedTimesForDate = async function(date) {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return await this.find({
        startDate: { $lte: checkDate },
        endDate: { $gte: checkDate },
        isActive: true
    }).sort({ startTime: 1 });
};

// Get all blocked time slots within a date range
blockedTimeSlotSchema.statics.getBlockedTimesForDateRange = async function(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return await this.find({
        isActive: true,
        $or: [
            //block starts within range
            { startDate: { $gte: start, $lte: end } },
            //block ends within range
            { endDate: { $gte: start, $lte: end } },
            //block spans entire range
            { startDate: { $lte: start }, endDate: { $gte: end } }
        ]
    }).sort({ startDate: 1, startTime: 1 });
};

const BlockedTimeSlot = mongoose.model('BlockedTimeSlot', blockedTimeSlotSchema);

module.exports = BlockedTimeSlot;