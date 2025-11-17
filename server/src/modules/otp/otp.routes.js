const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const otpController = require('./otp.controller');
const { validateSendOTP, validateVerifyOTP, validateResendOTP, validateForgotPassword, validateResetPasswordWithOTP } = require('./otp.validator');

router.post('/sendOTP', authenticate, validateSendOTP, otpController.sendOTP);
router.post('/verifyOTP', authenticate, validateVerifyOTP, otpController.verifyOTP);
router.post('/resendOTP', authenticate, validateResendOTP, otpController.resendOTP);

router.post('/forgotPassword', validateForgotPassword, otpController.forgotPassword);
router.post('/sendPasswordResetOTP', validateForgotPassword, otpController.sendPasswordResetOTP);
router.post('/resetPasswordWithOTP', validateResetPasswordWithOTP, otpController.resetPasswordWithOTP);


module.exports = router;