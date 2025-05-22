const { body, validationResult } = require('express-validator');
const { ApiError } = require('../../utils/errors');

const validateRegistration = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3, max: 30 }).withMessage('Name must be between 3 and 30 characters'),

    body('emailOrContactNumber')
        .trim()
        .notEmpty().withMessage('Email or Contact Number is required')
        .custom((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const contactNumberRegex = /^(09|\+639)\d{9}$/;
            
            if (!emailRegex.test(value) && !contactNumberRegex.test(value)) {
                throw new Error('Must provide a valid email or contact number');
            }
            return true;
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        
    body('birthdate')
        .notEmpty().withMessage('Birthdate is required')
        .isISO8601().withMessage('Birthdate must be a valid date')
        .toDate(),
        
    body('sex')
        .trim()
        .notEmpty().withMessage('Sex is required'),
        
    body('address')
        .trim()
        .notEmpty().withMessage('Address is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ApiError(errorMessages[0], 400));
        }
        next();
    }
];


const validateLogin = [
    body('emailOrContactNumber')
        .trim()
        .notEmpty().withMessage('Email or Contact Number is required')
        .custom((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const contactNumberRegex = /^(09|\+639)\d{9}$/;
            
            if (!emailRegex.test(value) && !contactNumberRegex.test(value)) {
                throw new Error('Must provide a valid email or contact number');
            }
            return true;
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required'),

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
    validateRegistration,
    validateLogin
};