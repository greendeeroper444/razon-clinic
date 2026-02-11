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

router.get(
    '/getInventoryLineChart',
    authenticate,
    reportController.getInventoryLineChart
);

router.get(
    '/exportInventoryReport',
    authenticate,
    reportController.exportInventoryReport
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

router.get(
    '/getSalesLineChart',
    authenticate,
    reportController.getSalesLineChart
);

router.get(
    '/exportSalesReport',
    authenticate,
    reportController.exportSalesReport
);

// ==================== MEDICAL RECORDS REPORTS ====================
router.get(
    '/getMedicalRecordsReport',
    authenticate,
    reportController.getMedicalRecordsReport
);

router.get(
    '/getMedicalRecordsSummary',
    authenticate,
    reportController.getMedicalRecordsSummary
);

router.get(
    '/getMedicalRecordsLineChart',
    authenticate,
    reportController.getMedicalRecordsLineChart
);

router.get(
    '/exportMedicalRecordsReport',
    authenticate,
    reportController.exportMedicalRecordsReport
);

// ==================== DASHBOARD REPORT ====================
router.get(
    '/getDashboardReport',
    authenticate,
    reportController.getDashboardReport
);

module.exports = router;