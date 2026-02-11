const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const dashboardController = require('./dashboard.controller');
const validator = require('./dashboard.validator');

router.get(
    '/getDashboardStats',
    authenticate,
    validator.validateDashboardStats,
    dashboardController.getDashboardStats
);

module.exports = router;