const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validatePatient = [
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
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    
    body('contactNumber')
        .optional()
        .custom((value) => {
            if (!value) return true;
            const numberStr = String(value);
            //accept formats: 09XXXXXXXXX or +639XXXXXXXXX or 9XXXXXXXXX
            if (!/^(09|\+639|9)\d{9}$/.test(numberStr)) {
                throw new Error('Invalid Philippine contact number format');
            }
            return true;
        }),
    
    body('birthdate')
        .notEmpty().withMessage('Birth date is required')
        .isISO8601().withMessage('Birth date must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            const age = (today - value) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 0) {
                throw new Error('Birth date cannot be in the future');
            }
            if (age > 150) {
                throw new Error('Birth date seems unrealistic');
            }
            return true;
        }),
    
    body('sex')
        .notEmpty().withMessage('Sex is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
    
    body('address')
        .notEmpty().withMessage('Address is required')
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
    
    body('motherInfo.name')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s name must not exceed 50 characters'),
    
    body('motherInfo.age')
        .optional()
        .isInt({ min: 15, max: 120 }).withMessage('Mother\'s age must be between 15 and 120'),
    
    body('motherInfo.occupation')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s occupation must not exceed 50 characters'),
    
    body('fatherInfo.name')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s name must not exceed 50 characters'),
    
    body('fatherInfo.age')
        .optional()
        .isInt({ min: 15, max: 120 }).withMessage('Father\'s age must be between 15 and 120'),
    
    body('fatherInfo.occupation')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s occupation must not exceed 50 characters'),
    
    body('religion')
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage('Religion must not exceed 30 characters'),
    
    handleValidationErrors
];

const validatePatientId = [
    param('patientId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid patient ID format');
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
    
    query('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address'),
    
    query('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
    
    query('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
    
    query('patientNumber')
        .optional()
        .trim()
        .matches(/^\d{4}$/).withMessage('Patient number must be a 4-digit number'),
    
    query('religion')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 }).withMessage('Religion must be between 1 and 30 characters'),
    
    query('sex')
        .optional()
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
    
    query('fromDate')
        .optional()
        .isISO8601().withMessage('fromDate must be a valid date'),
    
    query('toDate')
        .optional()
        .isISO8601().withMessage('toDate must be a valid date'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'firstName', 'lastName', 'patientNumber', 'birthdate', 'lastActiveAt'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    query('isArchived')
        .optional()
        .isBoolean().withMessage('isArchived must be a boolean value'),
    
    handleValidationErrors
];

const validateArchivePatient = [
    param('patientId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid patient ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateMultiplePatients = [
    body('patientIds')
        .notEmpty().withMessage('Patient IDs are required')
        .isArray({ min: 1 }).withMessage('Patient IDs must be a non-empty array')
        .custom((value) => {
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('All patient IDs must be valid MongoDB ObjectIds');
            }
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    validatePatient,
    validatePatientId,
    validateQueryParams,
    validateArchivePatient,
    validateMultiplePatients,
    handleValidationErrors
};