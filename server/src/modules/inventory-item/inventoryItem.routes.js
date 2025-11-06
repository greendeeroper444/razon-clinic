const express = require('express');
const router = express.Router();
// const validator = require('../validators/InventoryItem.validator');
const { authenticate } = require('@middlewares/auth.middleware');
const inventoryItemController = require('./inventoryItem.controller');



router.post(
    '/addInventoryItem', 
    authenticate, 
    // validator.validateInventoryItem, 
    inventoryItemController.addInventoryItem
);


router.get(
    '/getInventoryItems', 
    authenticate, 
    inventoryItemController.getInventoryItem
);


router.get(
    '/getInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    inventoryItemController.getInventoryItemById
);


router.put(
    '/updateInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItem, 
    inventoryItemController.updateInventoryItem
);


router.delete(
    '/deleteInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    inventoryItemController.deleteInventoryItem
);



router.get(
    '/getLowStockItems', 
    authenticate, 
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
    inventoryItemController.getExpiringItems
);



router.patch(
    '/updateStock/:inventoryItemId', 
    authenticate, 
    // validator.validateStockUpdate,
    inventoryItemController.updateStock
);

module.exports = router;