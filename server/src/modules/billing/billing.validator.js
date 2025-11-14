const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateBilling = [
    body('medicalRecordId')
        .notEmpty().withMessage('Medical Record ID is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Medical Record ID format');
            }
            return true;
        }),
    
    body('patientName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Patient name must be between 2 and 100 characters'),
    
    body('itemName')
        .optional()
        .isArray().withMessage('Item names must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                if (!value.every(item => typeof item === 'string' && item.trim().length > 0)) {
                    throw new Error('All item names must be non-empty strings');
                }
            }
            return true;
        }),
    
    body('itemQuantity')
        .optional()
        .isArray().withMessage('Item quantities must be an array')
        .custom((value, { req }) => {
            if (value && value.length > 0) {
                if (!value.every(qty => Number.isInteger(qty) && qty > 0)) {
                    throw new Error('All item quantities must be positive integers');
                }
                
                if (req.body.itemName && value.length !== req.body.itemName.length) {
                    throw new Error('Item names and quantities must have the same length');
                }
            }
            return true;
        }),
    
    body('itemPrices')
        .optional()
        .isArray().withMessage('Item prices must be an array')
        .custom((value, { req }) => {
            if (value && value.length > 0) {
                if (!value.every(price => typeof price === 'number' && price >= 0)) {
                    throw new Error('All item prices must be non-negative numbers');
                }
                
                if (req.body.itemName && value.length !== req.body.itemName.length) {
                    throw new Error('Item names and prices must have the same length');
                }
                if (req.body.itemQuantity && value.length !== req.body.itemQuantity.length) {
                    throw new Error('Item quantities and prices must have the same length');
                }
            }
            return true;
        }),
    
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Amount cannot be negative');
            }
            return true;
        }),
    
    body('paymentStatus')
        .optional()
        .isIn(['Paid', 'Unpaid', 'Pending']).withMessage('Payment status must be Paid, Unpaid, or Pending'),
    
    body('medicalRecordDate')
        .optional()
        .isISO8601().withMessage('Medical record date must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            const fiveYearsAgo = new Date();
            fiveYearsAgo.setFullYear(today.getFullYear() - 5);
            
            if (value > today) {
                throw new Error('Medical record date cannot be in the future');
            }
            if (value < fiveYearsAgo) {
                throw new Error('Medical record date seems unrealistic (more than 5 years ago)');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateBillingId = [
    param('billingId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid billing ID format');
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
    
    query('paymentStatus')
        .optional()
        .isIn(['Paid', 'Unpaid', 'Pending', 'all']).withMessage('Payment status must be Paid, Unpaid, Pending, or all'),
    
    query('patientName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Patient name must be between 1 and 100 characters'),
    
    query('itemName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Item name must be between 1 and 100 characters'),
    
    query('minAmount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum amount must be a non-negative number'),
    
    query('maxAmount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum amount must be a non-negative number')
        .custom((value, { req }) => {
            if (req.query.minAmount && parseFloat(value) < parseFloat(req.query.minAmount)) {
                throw new Error('Maximum amount must be greater than or equal to minimum amount');
            }
            return true;
        }),
    
    query('fromDate')
        .optional()
        .isISO8601().withMessage('fromDate must be a valid date'),
    
    query('toDate')
        .optional()
        .isISO8601().withMessage('toDate must be a valid date')
        .custom((value, { req }) => {
            if (req.query.fromDate && new Date(value) < new Date(req.query.fromDate)) {
                throw new Error('toDate must be greater than or equal to fromDate');
            }
            return true;
        }),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'amount', 'paymentStatus', 'patientName', 'medicalRecordDate'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    handleValidationErrors
];

const validatePaymentStatusUpdate = [
    param('billingId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid billing ID format');
            }
            return true;
        }),
    
    body('paymentStatus')
        .notEmpty().withMessage('Payment status is required')
        .isIn(['Paid', 'Unpaid', 'Pending']).withMessage('Payment status must be Paid, Unpaid, or Pending'),
    
    handleValidationErrors
];

const validateRevenueQuery = [
    query('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date'),
    
    query('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
                throw new Error('End date must be greater than or equal to start date');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateMedicalRecordId = [
    param('medicalRecordId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid medical record ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    validateBilling,
    validateBillingId,
    validateQueryParams,
    validatePaymentStatusUpdate,
    validateRevenueQuery,
    validateMedicalRecordId,
    handleValidationErrors
};