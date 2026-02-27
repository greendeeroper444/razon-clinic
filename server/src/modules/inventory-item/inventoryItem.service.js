const InventoryItem = require("./inventoryItem.model");
const InventoryTransactionService = require("@modules/inventory-transaction/inventoryTransaction.service");
const mongoose = require('mongoose');

class InventoryItemService {
    
    async createInventoryItem(inventoryItemData) {
        try {
            const inventoryItem = new InventoryItem(inventoryItemData);
            const saved = await inventoryItem.save();

            //log initial stock as an IN transaction
            if (saved.quantityInStock > 0) {
                await InventoryTransactionService.logTransaction({
                    inventoryItemId: saved._id,
                    itemName: saved.itemName,
                    category: saved.category,
                    transactionType: 'IN',
                    quantity: saved.quantityInStock,
                    previousStock: 0,
                    newStock: saved.quantityInStock,
                    reason: 'initial',
                    notes: 'Initial stock on item creation'
                });
            }

            return saved;
        } catch (error) {
            throw error;
        }
    }

    async getInventoryItems(queryParams) {
        try {
            const {
                search,
                page, 
                limit, 
                category,
                itemName,
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = queryParams;

            const filter = {};
            if (search) {
                filter.$or = [
                    { itemName: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ];
            }
            if (category) {
                filter.category = category;
            }
            if (itemName) {
                filter.itemName = { $regex: itemName, $options: 'i' };
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await InventoryItem.countDocuments(filter);
            const searchTerm = search || itemName || null;

            let inventoryItems;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page);
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                inventoryItems = await InventoryItem.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage);

                const startIndex = totalItems > 0 ? skip + 1 : 0;
                const endIndex = Math.min(skip + itemsPerPage, totalItems);

                pagination = {
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1,
                    startIndex,
                    endIndex,
                    isUnlimited: false,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    previousPage: currentPage > 1 ? currentPage - 1 : null,
                    remainingItems: Math.max(0, totalItems - endIndex),
                    searchTerm
                };
            } else {
                inventoryItems = await InventoryItem.find(filter).sort(sort);

                pagination = {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems,
                    itemsPerPage: totalItems,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startIndex: totalItems > 0 ? 1 : 0,
                    endIndex: totalItems,
                    isUnlimited: true,
                    nextPage: null,
                    previousPage: null,
                    remainingItems: 0,
                    searchTerm
                };
            }

            return { inventoryItems, pagination };
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

            //capture previous stock before updating
            const previousItem = await InventoryItem.findById(inventoryItemId);
            if (!previousItem) throw new Error('Inventory item not found');

            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const inventoryItem = await InventoryItem.findByIdAndUpdate(
                inventoryItemId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            // Log stock change if quantityInStock changed via direct edit
            const prevStock = previousItem.quantityInStock;
            const newStock = inventoryItem.quantityInStock;

            if (prevStock !== newStock) {
                const diff = newStock - prevStock;
                await InventoryTransactionService.logTransaction({
                    inventoryItemId: inventoryItem._id,
                    itemName: inventoryItem.itemName,
                    category: inventoryItem.category,
                    transactionType: diff > 0 ? 'IN' : 'OUT',
                    quantity: Math.abs(diff),
                    previousStock: prevStock,
                    newStock,
                    reason: 'adjustment',
                    notes: 'Stock adjusted via item edit'
                });
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

    async getLowStockItems(threshold = 50) {
        try {
            const lowStockItems = await InventoryItem.find({
                isArchived: false,
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
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + parseInt(days));

            const items = await InventoryItem.find({ isArchived: false });
            const expiringItems = items.filter(item => item.expiryDate <= thirtyDaysFromNow);

            return expiringItems;
        } catch (error) {
            throw error;
        }
    }

    async updateStock(inventoryItemId, quantityUsed, operation = 'use', notes = '') {
        try {
            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }

            const inventoryItem = await InventoryItem.findById(inventoryItemId);

            if (!inventoryItem) {
                throw new Error('Inventory item not found');
            }

            const previousStock = inventoryItem.quantityInStock;

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

            const saved = await inventoryItem.save();

            //log the transaction
            await InventoryTransactionService.logTransaction({
                inventoryItemId: saved._id,
                itemName: saved.itemName,
                category: saved.category,
                transactionType: operation === 'restock' ? 'IN' : 'OUT',
                quantity: parseInt(quantityUsed),
                previousStock,
                newStock: saved.quantityInStock,
                reason: operation === 'restock' ? 'restock' : 'consumption',
                notes: notes || (operation === 'restock' ? 'Stock restocked' : 'Stock consumed')
            });

            return saved;
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