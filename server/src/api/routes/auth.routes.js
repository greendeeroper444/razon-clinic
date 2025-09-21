const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const validator = require('../validators/auth.validator');
const { 
    authenticate, 
    authenticateRefresh,
    requireAdmin,
    requireDoctor,
    requireStaff,
    requirePatient,
    requireUser
} = require('../middlewares/auth.middleware');

router.post('/register', validator.validateRegistration, AuthController.register);
router.post('/login', validator.validateLogin, AuthController.login);
router.post('/verify-token', AuthController.verifyToken);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

router.get('/me', authenticate, AuthController.getProfile);
router.put('/update-profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

router.post('/refresh-token', authenticateRefresh, AuthController.refreshToken);

router.get('/admin/profile', authenticate, requireAdmin, AuthController.getProfile);
router.put('/admin/profile', authenticate, requireAdmin, AuthController.updateProfile);

router.get('/doctor/profile', authenticate, requireDoctor, AuthController.getProfile);

router.get('/staff/profile', authenticate, requireStaff, AuthController.getProfile);

router.get('/patient/profile', authenticate, requirePatient, AuthController.getProfile);
router.put('/patient/profile', authenticate, requirePatient, AuthController.updateProfile);

router.get('/user/profile', authenticate, requireUser, AuthController.getProfile);
router.put('/user/profile', authenticate, requireUser, AuthController.updateProfile);

module.exports = router;