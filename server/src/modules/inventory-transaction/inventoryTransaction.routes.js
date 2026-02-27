const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const inventoryTransactionController = require('./inventoryTransaction.controller');

router.get(
    '/getTransactions',
    authenticate,
    inventoryTransactionController.getTransactions
);

router.get(
    '/getTransactions/:inventoryItemId',
    authenticate,
    inventoryTransactionController.getTransactionsByItemId
);

router.get(
    '/getTransactionStats',
    authenticate,
    inventoryTransactionController.getTransactionStats
);

module.exports = router;