const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false 
        },
        otp: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true,
            enum: ['verification', 'password_reset', 'login', 'registration'],
            default: 'verification'
        },
        contactNumber: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 5 * 60 * 1000) //5 minutes from now
        },
        isUsed: {
            type: Boolean,
            default: false
        },
        usedAt: {
            type: Date,
            default: null
        },
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 3
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    {
        timestamps: true
    }
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ contactNumber: 1, purpose: 1 });

OTPSchema.methods.isValid = function() {
    return !this.isUsed && this.expiresAt > new Date() && this.attempts < this.maxAttempts;
};

OTPSchema.methods.incrementAttempts = async function() {
    this.attempts += 1;
    await this.save();
    return this.attempts;
};

OTPSchema.methods.markAsUsed = async function() {
    this.isUsed = true;
    this.usedAt = new Date();
    await this.save();
};

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;