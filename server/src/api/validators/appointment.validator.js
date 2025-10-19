const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../../utils/errors');
const mongoose = require('mongoose');

const validateAppointment = [
    (req, res, next) => {
        if (!req.body.userId && req.user && req.user.role === 'User') {
            req.body.userId = req.user.id;
        }
        next();
    },
    
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('middleName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Middle name must not exceed 50 characters'),
    
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
        .isIn(['Male', 'Female']).withMessage('Sex must be Male or Female'),
    
    body('height')
        .optional()
        .isFloat({ min: 30, max: 300 }).withMessage('Height must be between 30 and 300 cm'),
    
    body('weight')
        .optional()
        .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),
    
    body('religion')
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage('Religion must not exceed 30 characters'),
    
    body('contactNumber')
        .notEmpty().withMessage('Contact number is required')
        .custom((value) => {
            const numberStr = String(value);
            //accept formats: 09XXXXXXXXX or +639XXXXXXXXX or 9XXXXXXXXX
            if (!/^(09|\+639|9)\d{9}$/.test(numberStr)) {
                throw new Error('Invalid Philippine contact number format');
            }
            return true;
        }),
    
    body('address')
        .notEmpty().withMessage('Address is required')
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
    
    body('motherName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s name must not exceed 50 characters'),
    
    body('motherAge')
        .optional()
        .isInt({ min: 15, max: 120 }).withMessage('Mother\'s age must be between 15 and 120'),
    
    body('motherOccupation')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s occupation must not exceed 50 characters'),
    
    body('fatherName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s name must not exceed 50 characters'),
    
    body('fatherAge')
        .optional()
        .isInt({ min: 15, max: 120 }).withMessage('Father\'s age must be between 15 and 120'),
    
    body('fatherOccupation')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s occupation must not exceed 50 characters'),
    
    body('preferredDate')
        .notEmpty().withMessage('Preferred date is required')
        .isISO8601().withMessage('Preferred date must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (value < today) {
                throw new Error('Appointment date cannot be in the past');
            }
            return true;
        }),
    
    body('preferredTime')
        .notEmpty().withMessage('Preferred time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/)
        .withMessage('Time must be in HH:MM format using 15-minute intervals (e.g., 08:00, 08:15, 08:30, 08:45)')
        .custom((value) => {
            const [hourStr, minuteStr] = value.split(':');
            const hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);
            
            if (hour < 8 || (hour === 17 && minute > 0) || hour > 17) {
                throw new Error('Appointments are only available between 08:00 and 17:00');
            }
            return true;
        }),
    
    body('reasonForVisit')
        .trim()
        .notEmpty().withMessage('Reason for visit is required')
        .isLength({ min: 5, max: 200 }).withMessage('Reason for visit must be between 5 and 200 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => {
                return `${error.msg} for field: ${error.param}`;
            });
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

const validateStatusUpdate = [
    param('appointmentId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid appointment ID format');
            }
            return true;
        }),
    
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rebooked'])
        .withMessage('Status must be one of: Pending, Scheduled, Completed, Cancelled, Rebooked'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

const validateAppointmentId = [
    param('appointmentId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid appointment ID format');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

const validateDateQuery = [
    query('date')
        .notEmpty().withMessage('Date parameter is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
        .custom((value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    
    query('status')
        .optional()
        .isIn(['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rebooked'])
        .withMessage('Invalid status value'),
    
    query('fromDate')
        .optional()
        .isISO8601().withMessage('fromDate must be a valid date'),
    
    query('toDate')
        .optional()
        .isISO8601().withMessage('toDate must be a valid date'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'preferredDate', 'preferredTime', 'firstName', 'lastName', 'status'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

module.exports = {
    validateAppointment,
    validateStatusUpdate,
    validateAppointmentId,
    validateDateQuery,
    validateQueryParams
};