const { body, validationResult } = require('express-validator');
const { ApiError } = require('../../utils/errors');

const validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 3, max: 50 }).withMessage('First name must be between 3 and 50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be between 3 and 50 characters'),
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

    // Optional mother info validation
    body('motherInfo.name')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s name must not exceed 50 characters'),
        
    body('motherInfo.age')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 15, max: 120 }).withMessage('Mother\'s age must be between 15 and 120'),
        
    body('motherInfo.occupation')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage('Mother\'s occupation must not exceed 50 characters'),

    // Optional father info validation
    body('fatherInfo.name')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s name must not exceed 50 characters'),
        
    body('fatherInfo.age')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 15, max: 120 }).withMessage('Father\'s age must be between 15 and 120'),
        
    body('fatherInfo.occupation')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage('Father\'s occupation must not exceed 50 characters'),

    // Optional religion validation
    body('religion')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 30 }).withMessage('Religion must not exceed 30 characters'),

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