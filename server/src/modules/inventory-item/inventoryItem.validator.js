const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateInventoryItem = [
    body('itemName')
        .notEmpty().withMessage('Item name is required')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Item name must be between 2 and 100 characters'),
    
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Vaccine', 'Medical Supply']).withMessage('Category must be either Vaccine or Medical Supply'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Price cannot be negative');
            }
            return true;
        }),
    
    body('quantityInStock')
        .notEmpty().withMessage('Quantity in stock is required')
        .isInt({ min: 0 }).withMessage('Quantity in stock must be a non-negative integer')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Quantity in stock cannot be negative');
            }
            return true;
        }),
    
    body('quantityUsed')
        .optional()
        .isInt({ min: 0 }).withMessage('Quantity used must be a non-negative integer'),
    
    body('expiryDate')
        .notEmpty().withMessage('Expiry date is required')
        .isISO8601().withMessage('Expiry date must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            //allow expiry dates in the past for historical records
            //but warn if too far in the past (more than 10 years)
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(today.getFullYear() - 10);
            
            if (value < tenYearsAgo) {
                throw new Error('Expiry date seems unrealistic (more than 10 years ago)');
            }
            return true;
        }),
    
    body('isArchived')
        .optional()
        .isBoolean().withMessage('isArchived must be a boolean value'),
    
    handleValidationErrors
];

const validateInventoryItemId = [
    param('inventoryItemId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid inventory item ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateQueryParams = [
    // query('page')
    //     .optional()
    //     .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    // query('limit')
    //     .optional()
    //     .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    
    // query('search')
    //     .optional()
    //     .trim()
    //     .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
    
    query('category')
        .optional()
        .isIn(['Vaccine', 'Medical Supply']).withMessage('Category must be either Vaccine or Medical Supply'),
    
    query('itemName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Item name must be between 1 and 100 characters'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'itemName', 'category', 'price', 'quantityInStock', 'quantityUsed', 'expiryDate'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    handleValidationErrors
];

const validateStockUpdate = [
    param('inventoryItemId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid inventory item ID format');
            }
            return true;
        }),
    
    body('quantityUsed')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
        .custom((value) => {
            if (value <= 0) {
                throw new Error('Quantity must be greater than zero');
            }
            return true;
        }),
    
    body('operation')
        .notEmpty().withMessage('Operation is required')
        .isIn(['use', 'restock']).withMessage('Operation must be either "use" or "restock"'),
    
    handleValidationErrors
];

const validateLowStockQuery = [
    query('threshold')
        .optional()
        .isInt({ min: 0, max: 1000 }).withMessage('Threshold must be between 0 and 1000'),
    
    handleValidationErrors
];

const validateExpiringQuery = [
    query('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    
    handleValidationErrors
];

module.exports = {
    validateInventoryItem,
    validateInventoryItemId,
    validateQueryParams,
    validateStockUpdate,
    validateLowStockQuery,
    validateExpiringQuery,
    handleValidationErrors
};