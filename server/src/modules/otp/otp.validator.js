const { body } = require('express-validator');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateSendOTP = [
    body('userId')
        .trim()
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid User ID format'),
        
    body('purpose')
        .optional()
        .trim()
        .isIn(['verification', 'password_reset', 'login']).withMessage('Purpose must be verification, password_reset, or login'),

    handleValidationErrors
];

const validateVerifyOTP = [
    body('userId')
        .trim()
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid User ID format'),
        
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers'),
        
    body('purpose')
        .optional()
        .trim()
        .isIn(['verification', 'password_reset', 'login']).withMessage('Purpose must be verification, password_reset, or login'),

    handleValidationErrors
];

const validateResendOTP = [
    body('userId')
        .trim()
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid User ID format'),
        
    body('purpose')
        .optional()
        .trim()
        .isIn(['verification', 'password_reset', 'login']).withMessage('Purpose must be verification, password_reset, or login'),

    handleValidationErrors
];

const validateForgotPassword = [
    body('contactNumber')
        .trim()
        .notEmpty().withMessage('Contact number is required')
        .matches(/^(09|\+639)\d{9}$/).withMessage('Please provide a valid Philippine contact number'),

    handleValidationErrors
];

const validateVerifyPasswordResetOTP = [
    body('contactNumber')
        .trim()
        .notEmpty().withMessage('Contact number is required')
        .matches(/^(09|\+639)\d{9}$/).withMessage('Please provide a valid Philippine contact number'),
        
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers'),
        
    body('purpose')
        .optional()
        .trim()
        .isIn(['verification', 'password_reset', 'login']).withMessage('Purpose must be verification, password_reset, or login'),

    handleValidationErrors
];

const validateResetPasswordWithOTP = [
    body('contactNumber')
        .trim()
        .notEmpty().withMessage('Contact number is required')
        .matches(/^(09|\+639)\d{9}$/).withMessage('Please provide a valid Philippine contact number'),
        
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers'),
        
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
    validateSendOTP,
    validateVerifyOTP,
    validateResendOTP,
    validateForgotPassword,
    validateResetPasswordWithOTP,
    validateVerifyPasswordResetOTP
};