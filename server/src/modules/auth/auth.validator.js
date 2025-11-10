const { body } = require('express-validator');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 3, max: 50 }).withMessage('First name must be between 3 and 50 characters'),
        
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be between 3 and 50 characters'),
        
    body('middleName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Middle name must be between 3 and 50 characters'),
        
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
        .custom((value) => {
            const birthdateObj = new Date(value);
            if (isNaN(birthdateObj.getTime())) {
                throw new Error('Invalid birthdate format');
            }
            
            //check minimum age (13 years)
            const minAge = new Date();
            minAge.setFullYear(minAge.getFullYear() - 13);
            if (birthdateObj > minAge) {
                throw new Error('User must be at least 13 years old');
            }
            
            return true;
        })
        .toDate(),
        
    body('sex')
        .trim()
        .notEmpty().withMessage('Sex is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
        
    body('address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),

    //optional mother info validation
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

    //optional father info validation
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

    //optional religion validation
    body('religion')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 30 }).withMessage('Religion must not exceed 30 characters'),

    handleValidationErrors
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

    handleValidationErrors
];

const validateChangePassword = [
    body('currentPassword')
        .trim()
        .notEmpty().withMessage('Current password is required'),
        
    body('newPassword')
        .trim()
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
        
    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New password and confirm password do not match');
            }
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),

    handleValidationErrors
];

const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('First name must be between 3 and 50 characters'),
        
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be between 3 and 50 characters'),
        
    body('middleName')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Middle name must be between 3 and 50 characters'),
        
    body('email')
        .optional()
        .trim()
        .toLowerCase()
        .isEmail().withMessage('Please provide a valid email address'),
        
    body('contactNumber')
        .optional()
        .trim()
        .matches(/^(09|\+639)\d{9}$/).withMessage('Please provide a valid contact number'),
        
    body('birthdate')
        .optional()
        .isISO8601().withMessage('Birthdate must be a valid date')
        .custom((value) => {
            if (value) {
                const birthdateObj = new Date(value);
                const minAge = new Date();
                minAge.setFullYear(minAge.getFullYear() - 13);
                if (birthdateObj > minAge) {
                    throw new Error('User must be at least 13 years old');
                }
            }
            return true;
        })
        .toDate(),
        
    body('sex')
        .optional()
        .trim()
        .isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
        
    body('address')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
        
    body('religion')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 30 }).withMessage('Religion must not exceed 30 characters'),

    handleValidationErrors
];

const validatePasswordReset = [
    body('emailOrContactNumber')
        .trim()
        .notEmpty().withMessage('Email or contact number is required')
        .custom((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const contactNumberRegex = /^(09|\+639)\d{9}$/;
            
            if (!emailRegex.test(value) && !contactNumberRegex.test(value)) {
                throw new Error('Must provide a valid email or contact number');
            }
            return true;
        }),

    handleValidationErrors
];

const validateResetPassword = [
    body('resetToken')
        .trim()
        .notEmpty().withMessage('Reset token is required'),
        
    body('newPassword')
        .trim()
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
        
    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New password and confirm password do not match');
            }
            return true;
        }),

    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateChangePassword,
    validateProfileUpdate,
    validatePasswordReset,
    validateResetPassword
};