const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validatePersonnel = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('First name must be between 3 and 50 characters'),
    
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be between 3 and 50 characters'),
    
    body('middleName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Middle name must be between 3 and 50 characters'),
    
    body('suffix')
        .optional()
        .trim()
        .isIn(['Jr.', 'Sr.', 'II', 'III', 'IV', 'V', '']).withMessage('Suffix must be one of: Jr., Sr., II, III, IV, V')
        .isLength({ max: 10 }).withMessage('Suffix must not exceed 10 characters'),

    body('contactNumber')
        .notEmpty().withMessage('Email or contact number is required')
        .trim()
        .custom((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhoneNumber = /^(09|\+639)\d{9}$/.test(value);
            
            if (!isEmail && !isPhoneNumber) {
                throw new Error('Please provide a valid email address or Philippine contact number (09XXXXXXXXX or +639XXXXXXXXX)');
            }
            return true;
        }),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('birthdate')
        .notEmpty().withMessage('Birthdate is required')
        .isISO8601().withMessage('Birthdate must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            const age = Math.floor((today - value) / (365.25 * 24 * 60 * 60 * 1000));
            
            if (age < 18) {
                throw new Error('Personnel must be at least 18 years old');
            }
            if (age > 100) {
                throw new Error('Birthdate seems unrealistic');
            }
            return true;
        }),
    
    body('sex')
        .notEmpty().withMessage('Sex is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be either Male, Female, or Other'),
    
    body('address')
        .notEmpty().withMessage('Address is required')
        .trim()
        .isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['Doctor', 'Staff']).withMessage('Role must be either Doctor or Staff'),
    
    handleValidationErrors
];

const validatePersonnelUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('First name must be between 3 and 50 characters'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be between 3 and 50 characters'),
    
    body('middleName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Middle name must be between 3 and 50 characters'),

    body('suffix')
        .optional()
        .trim()
        .isIn(['Jr.', 'Sr.', 'II', 'III', 'IV', 'V', '']).withMessage('Suffix must be one of: Jr., Sr., II, III, IV, V')
        .isLength({ max: 10 }).withMessage('Suffix must not exceed 10 characters'),
    
    body('contactNumber')
        .optional()
        .trim()
        .custom((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhoneNumber = /^(09|\+639)\d{9}$/.test(value);
            
            if (!isEmail && !isPhoneNumber) {
                throw new Error('Please provide a valid email address or Philippine contact number (09XXXXXXXXX or +639XXXXXXXXX)');
            }
            return true;
        }),
    
    body('password')
        .optional()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('birthdate')
        .optional()
        .isISO8601().withMessage('Birthdate must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            const age = Math.floor((today - value) / (365.25 * 24 * 60 * 60 * 1000));
            
            if (age < 18) {
                throw new Error('Personnel must be at least 18 years old');
            }
            if (age > 100) {
                throw new Error('Birthdate seems unrealistic');
            }
            return true;
        }),
    
    body('sex')
        .optional()
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be either Male, Female, or Other'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
    
    body('role')
        .optional()
        .isIn(['Doctor', 'Staff']).withMessage('Role must be either Doctor or Staff'),
    
    handleValidationErrors
];

const validatePersonnelId = [
    param('personnelId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid personnel ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateQueryParams = [
    query('role')
        .optional()
        .isIn(['Doctor', 'Staff']).withMessage('Role must be either Doctor or Staff'),
    
    // query('search')
    //     .optional()
    //     .trim()
    //     .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'firstName', 'lastName', 'dateRegistered', 'role'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    handleValidationErrors
];

const validateRoleQuery = [
    query('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['Doctor', 'Staff']).withMessage('Role must be either Doctor or Staff'),
    
    handleValidationErrors
];

module.exports = {
    validatePersonnel,
    validatePersonnelUpdate,
    validatePersonnelId,
    validateQueryParams,
    validateRoleQuery,
    handleValidationErrors
};