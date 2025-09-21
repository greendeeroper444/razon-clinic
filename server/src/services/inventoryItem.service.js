const InventoryItem = require("../models/inventoryItem.model");
const mongoose = require('mongoose');

class InventoryItemService {
    
    async createInventoryItem(inventoryItemData) {
        try {
            const inventoryItem = new InventoryItem(inventoryItemData);
            return await inventoryItem.save();
        } catch (error) {
            throw error;
        }
    }

    async getInventoryItems(queryParams) {
        try {
            const { 
                page, 
                limit, 
                category,
                itemName, 
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = queryParams;

            //build filter object
            const filter = {};
            if (category) {
                filter.category = category;
            }
            if (itemName) {
                filter.itemName = { $regex: itemName, $options: 'i' };
            }

            //calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            //build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            //execute query with pagination and sorting
            const inventoryItems = await InventoryItem.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            //get total count for pagination
            const totalItems = await InventoryItem.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / parseInt(limit));

            return {
                inventoryItems,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getInventoryItemById(inventoryItemId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }

            const inventoryItem = await InventoryItem.findById(inventoryItemId);
            
            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            return inventoryItem;
        } catch (error) {
            throw error;
        }
    }

    async updateInventoryItem(inventoryItemId, updateData) {
        try {
            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }

            //remove protected fields
            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const inventoryItem = await InventoryItem.findByIdAndUpdate(
                inventoryItemId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            return inventoryItem;
        } catch (error) {
            throw error;
        }
    }

    async deleteInventoryItem(inventoryItemId) {
        try {
            if (!inventoryItemId || inventoryItemId === 'undefined') {
                throw new Error('Invalid inventory item ID');
            }

            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }
            
            const inventoryItem = await InventoryItem.findByIdAndDelete(inventoryItemId);
            
            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            return inventoryItem;
        } catch (error) {
            throw error;
        }
    }

    async getLowStockItems(threshold = 10) {
        try {
            const lowStockItems = await InventoryItem.find({
                quantityInStock: { $lt: parseInt(threshold) }
            }).sort({ quantityInStock: 1 });

            return lowStockItems;
        } catch (error) {
            throw error;
        }
    }

    async getExpiredItems() {
        try {
            const currentDate = new Date();
            
            const expiredItems = await InventoryItem.find({
                expiryDate: { $lt: currentDate }
            }).sort({ expiryDate: 1 });

            return expiredItems;
        } catch (error) {
            throw error;
        }
    }

    async getExpiringItems(days = 30) {
        try {
            const currentDate = new Date();
            const futureDate = new Date();
            futureDate.setDate(currentDate.getDate() + parseInt(days));

            const expiringItems = await InventoryItem.find({
                expiryDate: { 
                    $gte: currentDate, 
                    $lte: futureDate 
                }
            }).sort({ expiryDate: 1 });

            return expiringItems;
        } catch (error) {
            throw error;
        }
    }

    async updateStock(inventoryItemId, quantityUsed, operation = 'use') {
        try {
            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }

            const inventoryItem = await InventoryItem.findById(inventoryItemId);

            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            if (operation === 'use') {
                if (inventoryItem.quantityInStock < quantityUsed) {
                    throw new Error('Insufficient stock available');
                }

                inventoryItem.quantityInStock -= quantityUsed;
                inventoryItem.quantityUsed += quantityUsed;
            } else if (operation === 'restock') {
                inventoryItem.quantityInStock += quantityUsed;
            } else {
                throw new Error('Invalid operation. Use "use" or "restock"');
            }

            return await inventoryItem.save();
        } catch (error) {
            throw error;
        }
    }

    async validateInventoryItemData(data) {
        const { itemName, category, price, quantityInStock } = data;
        
        if (!itemName || !category || price === undefined || quantityInStock === undefined) {
            throw new Error('Missing required fields: itemName, category, price, quantityInStock');
        }

        if (price < 0) {
            throw new Error('Price cannot be negative');
        }

        if (quantityInStock < 0) {
            throw new Error('Quantity in stock cannot be negative');
        }
    }

    async getInventoryStats() {
        try {
            const totalItems = await InventoryItem.countDocuments();
            const lowStockItems = await this.getLowStockItems();
            const expiredItems = await this.getExpiredItems();
            const expiringItems = await this.getExpiringItems();

            const totalValue = await InventoryItem.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$price', '$quantityInStock'] } }
                    }
                }
            ]);

            return {
                totalItems,
                lowStockCount: lowStockItems.length,
                expiredCount: expiredItems.length,
                expiringCount: expiringItems.length,
                totalInventoryValue: totalValue[0]?.total || 0
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InventoryItemService();