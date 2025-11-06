const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const userController = require('./user.controller');

router.get('/getUsers', authenticate, userController.getUsers);
router.get('/getUserById/:userId', authenticate, userController.getUserById);
router.patch('/archiveUser/:userId', authenticate, userController.archiveUser);
router.patch('/unarchiveUser/:userId', authenticate, userController.unarchiveUser);
router.patch('/archiveMultipleUsers', authenticate, userController.archiveMultipleUsers);
router.patch('/unarchiveMultipleUsers', authenticate, userController.unarchiveMultipleUsers);

module.exports = router;