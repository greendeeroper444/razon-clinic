const express = require('express');
const router = express.Router();
const InventoryItemController = require('../controllers/inventoryItem.controller');
// const validator = require('../validators/InventoryItem.validator');
const { authenticate } = require('../middlewares/auth.middleware');



router.post(
    '/addInventoryItem', 
    authenticate, 
    // validator.validateInventoryItem, 
    InventoryItemController.addInventoryItem
);


router.get(
    '/getInventoryItems', 
    authenticate, 
    InventoryItemController.getInventoryItem
);


router.get(
    '/getInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    InventoryItemController.getInventoryItemById
);


router.put(
    '/updateInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItem, 
    InventoryItemController.updateInventoryItem
);


router.delete(
    '/deleteInventoryItem/:inventoryItemId', 
    authenticate, 
    // validator.validateInventoryItemId,
    InventoryItemController.deleteInventoryItem
);



router.get(
    '/getLowStockItems', 
    authenticate, 
    InventoryItemController.getLowStockItems
);



router.get(
    '/getExpiredItems', 
    authenticate, 
    InventoryItemController.getExpiredItems
);



router.get(
    '/getExpiringItems', 
    authenticate, 
    InventoryItemController.getExpiringItems
);



router.patch(
    '/updateStock/:inventoryItemId', 
    authenticate, 
    // validator.validateStockUpdate,
    InventoryItemController.updateStock
);

module.exports = router;