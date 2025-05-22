const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reportType: {
            type: String,
            enum: ['Invoice', 'InventoryReport'],
            required: true
        },
        dateGenerated: {
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

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
