const express = require('express');
const router = express.Router();
const InventoryItemController = require('../controllers/inventoryItem.controller');
// const validator = require('../validators/InventoryItem.validator');
const { authenticate } = require('../middlewares/auth.middleware');

// Create a new InventoryItem
router.post(
    '/addInventoryItem', 
    authenticate, 
    // validator.validateInventoryItem, 
    InventoryItemController.addInventoryItem
);

// Get all InventoryItems (with optional query filters)
router.get(
    '/getInventoryItems', 
    authenticate, 
    InventoryItemController.getInventoryItem
);

// Get a specific InventoryItem by ID
router.get(
    '/getInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    InventoryItemController.getInventoryItemById
);

// Update an InventoryItem
router.put(
    '/updateInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItem, 
    InventoryItemController.updateInventoryItem
);

// Delete an InventoryItem
router.delete(
    '/deleteInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    InventoryItemController.deleteInventoryItem
);

// Additional utility endpoints

// Get low stock items
router.get(
    '/getLowStockItems', 
    authenticate, 
    InventoryItemController.getLowStockItems
);

// Get expired items
router.get(
    '/getExpiredItems', 
    authenticate, 
    InventoryItemController.getExpiredItems
);

// Get items expiring soon
router.get(
    '/getExpiringItems', 
    authenticate, 
    InventoryItemController.getExpiringItems
);

// Update stock (use or restock)
router.patch(
    '/updateStock/:inventoryItemId', 
    authenticate, 
    // validator.validateStockUpdate,
    InventoryItemController.updateStock
);

module.exports = router;