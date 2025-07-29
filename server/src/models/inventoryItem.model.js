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
            required: true,
            min: 0
        },
        expiryDate: {
            type: Date,
            required: true
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

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
