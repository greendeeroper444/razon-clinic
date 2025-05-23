const InventoryItem = require("../../models/inventoryItem.model");
const mongoose = require('mongoose')
class InventoryItemController {

    async addInventoryItem(req, res, next) {
        try {
            const { 
                itemName, 
                category, 
                quantityInStock, 
                quantityUsed = 0, 
                expiryDate 
            } = req.body;

            const inventoryItemData = {
                itemName,
                category,
                quantityInStock,
                quantityUsed,
                expiryDate
            };

            const inventoryItem = new InventoryItem(inventoryItemData);
            await inventoryItem.save();

            return res.status(201).json({
                success: true,
                message: 'Inventory item created successfully',
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryItem(req, res, next) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                itemName, 
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = req.query;

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

            return res.status(200).json({
                success: true,
                message: 'Inventory items retrieved successfully',
                data: {
                    inventoryItems,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: parseInt(page) < totalPages,
                        hasPrevPage: parseInt(page) > 1
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryItemById(req, res, next) {
        try {
            const { inventoryItemId } = req.params;

            const inventoryItem = await InventoryItem.findById(inventoryItemId);

            if (!inventoryItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Inventory item retrieved successfully',
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }

    async updateInventoryItem(req, res, next) {
        try {
            const { inventoryItemId } = req.params;
            const updateData = req.body;

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
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Inventory item updated successfully',
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteInventoryItem(req, res, next) {
        try {
            const { inventoryItemId } = req.params;
        
            if (!inventoryItemId || inventoryItemId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid inventory item ID'
                });
            }
            

            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid inventory item ID format'
                });
            }
            
            const inventoryItem = await InventoryItem.findByIdAndDelete(inventoryItemId);
            
            if (!inventoryItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Inventory item deleted successfully',
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }


    async getLowStockItems(req, res, next) {
        try {
            const { threshold = 10 } = req.query;

            const lowStockItems = await InventoryItem.find({
                quantityInStock: { $lt: parseInt(threshold) }
            }).sort({ quantityInStock: 1 });

            return res.status(200).json({
                success: true,
                message: 'Low stock items retrieved successfully',
                data: lowStockItems
            });
        } catch (error) {
            next(error);
        }
    }

    async getExpiredItems(req, res, next) {
        try {
            const currentDate = new Date();
            
            const expiredItems = await InventoryItem.find({
                expiryDate: { $lt: currentDate }
            }).sort({ expiryDate: 1 });

            return res.status(200).json({
                success: true,
                message: 'Expired items retrieved successfully',
                data: expiredItems
            });
        } catch (error) {
            next(error);
        }
    }

    async getExpiringItems(req, res, next) {
        try {
            const { days = 30 } = req.query;
            const currentDate = new Date();
            const futureDate = new Date();
            futureDate.setDate(currentDate.getDate() + parseInt(days));

            const expiringItems = await InventoryItem.find({
                expiryDate: { 
                    $gte: currentDate, 
                    $lte: futureDate 
                }
            }).sort({ expiryDate: 1 });

            return res.status(200).json({
                success: true,
                message: `Items expiring within ${days} days retrieved successfully`,
                data: expiringItems
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStock(req, res, next) {
        try {
            const { inventoryItemId } = req.params;
            const { quantityUsed, operation = 'use' } = req.body;

            const inventoryItem = await InventoryItem.findById(inventoryItemId);

            if (!inventoryItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            if (operation === 'use') {
                //check if there's enough stock
                if (inventoryItem.quantityInStock < quantityUsed) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock available'
                    });
                }

                inventoryItem.quantityInStock -= quantityUsed;
                inventoryItem.quantityUsed += quantityUsed;
            } else if (operation === 'restock') {
                inventoryItem.quantityInStock += quantityUsed;
            }

            await inventoryItem.save();

            return res.status(200).json({
                success: true,
                message: `Stock ${operation === 'use' ? 'updated' : 'restocked'} successfully`,
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryItemController();