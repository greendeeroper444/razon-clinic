const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const inventoryItemController = require('./inventoryItem.controller');
const validator = require('./inventoryItem.validator');

router.post(
    '/addInventoryItem', 
    authenticate, 
    validator.validateInventoryItem, 
    inventoryItemController.addInventoryItem
);

router.get(
    '/getInventoryItems', 
    authenticate,
    validator.validateQueryParams,
    inventoryItemController.getInventoryItem
);

router.get(
    '/getInventoryItem/:inventoryItemId', 
    authenticate, 
    validator.validateInventoryItemId,
    inventoryItemController.getInventoryItemById
);

router.put(
    '/updateInventoryItem/:inventoryItemId', 
    authenticate, 
    validator.validateInventoryItemId,
    validator.validateInventoryItem, 
    inventoryItemController.updateInventoryItem
);

router.delete(
    '/deleteInventoryItem/:inventoryItemId', 
    authenticate, 
    validator.validateInventoryItemId,
    inventoryItemController.deleteInventoryItem
);

router.get(
    '/getLowStockItems', 
    authenticate,
    validator.validateLowStockQuery,
    inventoryItemController.getLowStockItems
);

router.get(
    '/getExpiredItems', 
    authenticate, 
    inventoryItemController.getExpiredItems
);

router.get(
    '/getExpiringItems', 
    authenticate,
    validator.validateExpiringQuery,
    inventoryItemController.getExpiringItems
);

router.patch(
    '/updateStock/:inventoryItemId', 
    authenticate, 
    validator.validateStockUpdate,
    inventoryItemController.updateStock
);

module.exports = router;