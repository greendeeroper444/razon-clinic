const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
    {
        inventoryItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: true
        },
        itemName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        transactionType: {
            type: String,
            enum: ['IN', 'OUT'],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        previousStock: {
            type: Number,
            required: true
        },
        newStock: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            enum: ['restock', 'consumption', 'adjustment', 'initial'],
            required: true
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
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

//index for faster queries
inventoryTransactionSchema.index({ inventoryItem: 1, createdAt: -1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction;