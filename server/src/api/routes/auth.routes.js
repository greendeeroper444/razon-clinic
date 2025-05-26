const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const validator = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');


router.post('/register', validator.validateRegistration, AuthController.register);
router.post('/login', validator.validateLogin, AuthController.login);
router.get('/getProfile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;