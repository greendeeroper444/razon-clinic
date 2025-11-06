const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Vaccine', 'Medical Supply']
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantityInStock: {
            type: Number,
            required: true,
            min: 0
        },
        quantityUsed: {
            type: Number,
            default: 0,
            min: 0
        },
        expiryDate: {
            type: Date,
            required: true
        },
        isArchived: {
            type: Boolean,
            default: false
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

//virtual for remaining quantity
inventoryItemSchema.virtual('quantityRemaining').get(function() {
    return this.quantityInStock - this.quantityUsed;
});

//static to find soon-to-expire items
inventoryItemSchema.statics.findExpiringSoon = function(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.find({ expiryDate: { $lte: cutoff } });
};

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
