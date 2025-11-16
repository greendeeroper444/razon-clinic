const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateBlockedTimeSlot = [
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date')
        .toDate(),
    
    body('endDate')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date')
        .toDate()
        .custom((value, { req }) => {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(value);
            if (endDate < startDate) {
                throw new Error('End date must be after or equal to start date');
            }
            return true;
        }),
    
    body('startTime')
        .notEmpty().withMessage('Start time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/)
        .withMessage('Start time must be in HH:MM format with 15-minute intervals (e.g., 09:00, 09:15, 09:30, 09:45)'),
    
    body('endTime')
        .notEmpty().withMessage('End time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/)
        .withMessage('End time must be in HH:MM format with 15-minute intervals (e.g., 09:00, 09:15, 09:30, 09:45)')
        .custom((value, { req }) => {
            const startTime = req.body.startTime;
            if (startTime && value) {
                const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
                const endMinutes = parseInt(value.split(':')[0]) * 60 + parseInt(value.split(':')[1]);
                if (endMinutes <= startMinutes) {
                    throw new Error('End time must be after start time');
                }
            }
            return true;
        }),
    
    body('reason')
        .notEmpty().withMessage('Reason is required')
        .isIn([
            'Doctor Unavailable',
            'Holiday',
            'Maintenance',
            'Emergency',
            'Meeting',
            'Training',
            'Other'
        ]).withMessage('Invalid reason'),
    
    body('customReason')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Custom reason must not exceed 100 characters'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean value'),
    
    handleValidationErrors
];

const validateBlockedTimeSlotId = [
    param('blockedTimeSlotId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid blocked time slot ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateQueryParams = [
    query('reason')
        .optional()
        .isIn([
            'Doctor Unavailable',
            'Holiday',
            'Maintenance',
            'Emergency',
            'Meeting',
            'Training',
            'Other'
        ]).withMessage('Invalid reason'),
    
    query('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date'),
    
    query('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid date'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'startDate', 'endDate', 'startTime', 'endTime', 'reason'])
        .withMessage('Invalid sortBy field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('sortOrder must be either asc or desc'),
    
    handleValidationErrors
];

module.exports = {
    validateBlockedTimeSlot,
    validateBlockedTimeSlotId,
    validateQueryParams,
    handleValidationErrors
};