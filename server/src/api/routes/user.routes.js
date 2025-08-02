const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');


router.get('/getAllUsers', authenticate, UserController.getAllUsers);
router.get('/getUsers', authenticate, UserController.getUsers);
router.get('/getUserById/:userId', authenticate, UserController.getUserById);

module.exports = router;