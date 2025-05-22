const { body, param, validationResult } = require('express-validator');
const { ApiError } = require('../../utils/errors');
const mongoose = require('mongoose');

//validator for creating and updating appointments
const validateAppointment = [
    body('patientId')
        .notEmpty().withMessage('Patient ID is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid patient ID format');
            }
            return true;
        }),
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
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
    body('reasonForVisit')
        .trim()
        .notEmpty().withMessage('Reason for visit is required')
        .isLength({ min: 5, max: 200 }).withMessage('Reason for visit must be between 5 and 200 characters'),
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