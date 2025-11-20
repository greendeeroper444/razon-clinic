const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
    {
        medicalRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicalRecord',
            required: true
        },
        patientName: {
            type: String,
        },
        itemName: {
            type: [String],
        },
        itemQuantity: {
            type: [Number]
        },
        itemPrices: {
            type: [Number],
            default: []
        },
        doctorFee: {
            type: Number,
            default: 0,
            min: 0
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Pending'],
            default: 'Unpaid'
        },
        medicalRecordDate: {
            type: Date,
            default: Date.now
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

billingSchema.index({ medicalRecordId: 1 });
billingSchema.index({ paymentStatus: 1 });
billingSchema.index({ patientName: 1 });
billingSchema.index({ createdAt: -1 });

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;