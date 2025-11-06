const InventoryItemService = require("./inventoryItem.service");

class InventoryItemController {

    async addInventoryItem(req, res, next) {
        try {
            const { 
                itemName, 
                category, 
                price,
                quantityInStock, 
                quantityUsed = 0, 
                expiryDate 
            } = req.body;

            const inventoryItemData = {
                itemName,
                category,
                price,
                quantityInStock,
                quantityUsed,
                expiryDate
            };

            //validate data
            await InventoryItemService.validateInventoryItemData(inventoryItemData);

            //create inventory item
            const inventoryItem = await InventoryItemService.createInventoryItem(inventoryItemData);

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
            const result = await InventoryItemService.getInventoryItems(req.query);

            return res.status(200).json({
                success: true,
                message: 'Inventory items retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryItemById(req, res, next) {
        try {
            const { inventoryItemId } = req.params;
            const inventoryItem = await InventoryItemService.getInventoryItemById(inventoryItemId);

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

            const inventoryItem = await InventoryItemService.updateInventoryItem(inventoryItemId, updateData);

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
            const inventoryItem = await InventoryItemService.deleteInventoryItem(inventoryItemId);

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
            const { threshold } = req.query;
            const lowStockItems = await InventoryItemService.getLowStockItems(threshold);

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
            const expiredItems = await InventoryItemService.getExpiredItems();

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
            const { days } = req.query;
            const expiringItems = await InventoryItemService.getExpiringItems(days);

            return res.status(200).json({
                success: true,
                message: `Items expiring within ${days || 30} days retrieved successfully`,
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

            const inventoryItem = await InventoryItemService.updateStock(inventoryItemId, quantityUsed, operation);

            return res.status(200).json({
                success: true,
                message: `Stock ${operation === 'use' ? 'updated' : 'restocked'} successfully`,
                data: inventoryItem
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryStats(req, res, next) {
        try {
            const stats = await InventoryItemService.getInventoryStats();

            return res.status(200).json({
                success: true,
                message: 'Inventory statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryItemController();