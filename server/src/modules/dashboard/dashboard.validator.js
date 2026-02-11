const { query } = require('express-validator');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateDateRange = [
    query('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid ISO 8601 date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            if (value > today) {
                throw new Error('Start date cannot be in the future');
            }
            return true;
        }),
    
    query('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const today = new Date();
            if (value > today) {
                throw new Error('End date cannot be in the future');
            }
            
            if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
                throw new Error('End date must be greater than or equal to start date');
            }
            
            return true;
        }),
    
    handleValidationErrors
];

const validateLowStockThreshold = [
    query('threshold')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Threshold must be an integer between 1 and 1000')
        .toInt(),
    
    handleValidationErrors
];

const validateActivityLimit = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
    
    handleValidationErrors
];

const validateMonthlyTrends = [
    query('months')
        .optional()
        .isInt({ min: 1, max: 24 })
        .withMessage('Months must be an integer between 1 and 24')
        .toInt(),
    
    handleValidationErrors
];

const validateDashboardStats = [
    query('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid ISO 8601 date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            if (value > today) {
                throw new Error('Start date cannot be in the future');
            }
            return true;
        }),
    
    query('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const today = new Date();
            if (value > today) {
                throw new Error('End date cannot be in the future');
            }
            
            if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
                throw new Error('End date must be greater than or equal to start date');
            }
            
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    validateDateRange,
    validateLowStockThreshold,
    validateActivityLimit,
    validateMonthlyTrends,
    validateDashboardStats
};