const express = require('express');
const router = express.Router();
const validator = require('./auth.validator');
const { authenticate, authenticateRefresh, requireAdmin, requireDoctor, requireStaff, requirePatient, requireUser } = require('@middlewares/auth.middleware');
const authController = require('./auth.controller');

router.post('/register', validator.validateRegistration, authController.register);
router.post('/register/send-otp', validator.validateRegistration, authController.sendRegistrationOTP);
router.post('/register/verify-otp', authController.verifyRegistrationOTP);
router.post('/register/resend-otp',  authController.resendRegistrationOTP);
router.post('/login', validator.validateLogin, authController.login);
router.post('/verifyToken', authController.verifyToken);
router.post('/requestPasswordReset', authController.requestPasswordReset);
router.post('/resetPassword', authController.resetPassword);

router.get('/me', authenticate, authController.getProfile);
router.put('/updateProfile', authenticate, authController.updateProfile);
router.post('/changePassword', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

router.post('/refreshToken', authenticateRefresh, authController.refreshToken);

router.get('/admin/profile', authenticate, requireAdmin, authController.getProfile);
router.put('/admin/profile', authenticate, requireAdmin, authController.updateProfile);

router.get('/doctor/profile', authenticate, requireDoctor, authController.getProfile);

router.get('/staff/profile', authenticate, requireStaff, authController.getProfile);

router.get('/patient/profile', authenticate, requirePatient, authController.getProfile);
router.put('/patient/profile', authenticate, requirePatient, authController.updateProfile);

router.get('/user/profile', authenticate, requireUser, authController.getProfile);
router.put('/user/profile', authenticate, requireUser, authController.updateProfile);

module.exports = router;