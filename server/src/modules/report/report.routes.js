const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const reportController = require('./report.controller');

// ==================== INVENTORY REPORTS ====================
router.get(
    '/getInventoryReport',
    authenticate,
    reportController.getInventoryReport
);

router.get(
    '/getInventorySummary',
    authenticate,
    reportController.getInventorySummary
);

// ==================== SALES REPORTS ====================
router.get(
    '/getSalesReport',
    authenticate,
    reportController.getSalesReport
);

router.get(
    '/getSalesSummary',
    authenticate,
    reportController.getSalesSummary
);

// ==================== DASHBOARD REPORT ====================
router.get(
    '/getDashboardReport',
    authenticate,
    reportController.getDashboardReport
);

module.exports = router;