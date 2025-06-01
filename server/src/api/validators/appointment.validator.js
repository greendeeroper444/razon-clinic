const { body, param, validationResult } = require('express-validator');
const { ApiError } = require('../../utils/errors');
const mongoose = require('mongoose');

//validator for creating and updating appointments
const validateAppointment = [
    (req, res, next) => {
        // if no patientId provided and user is a patient, use their ID
        if (!req.body.patientId && req.user && req.user.role === 'Patient') {
            req.body.patientId = req.user.id;
        }
        next();
    },
    // body('patientId')
    //     .notEmpty().withMessage('Patient ID is required')
    //     .custom((value) => {
    //         if (!mongoose.Types.ObjectId.isValid(value)) {
    //             throw new Error('Invalid patient ID format');
    //         }
    //         return true;
    //     }),
    
    //appointment-specific validations
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
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format (24-hour)')
        .custom((value) => {
            //additional validation for business hours
            const hour = parseInt(value.split(':')[0]);
            if (hour < 8 || hour > 17) {
                throw new Error('Appointments are only available between 8:00 AM and 5:00 PM');
            }
            return true;
        }),
    body('reasonForVisit')
        .trim()
        .notEmpty().withMessage('Reason for visit is required')
        .isLength({ min: 5, max: 200 }).withMessage('Reason for visit must be between 5 and 200 characters'),
    
    //patient information validations
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
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
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
    
    //mother's information validations
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
    
    // father's information validations
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
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //enhanced error handling to provide more context
            const errorMessages = errors.array().map(error => {
                //add field name to error message for clarity
                return `${error.msg} for field: ${error.param}`;
            });
            //return first error or all errors as needed
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];

//validator for appointment status updates only
const validateStatusUpdate = [
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

//validator for appointment ID parameter
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

module.exports = {
    validateAppointment,
    validateStatusUpdate,
    validateAppointmentId
};