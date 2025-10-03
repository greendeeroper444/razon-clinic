const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/getUsers', authenticate, UserController.getUsers);
router.get('/getUserById/:userId', authenticate, UserController.getUserById);
router.patch('/archiveUser/:userId', authenticate, UserController.archiveUser);
router.patch('/unarchiveUser/:userId', authenticate, UserController.unarchiveUser);
router.patch('/archiveMultipleUsers', authenticate, UserController.archiveMultipleUsers);
router.patch('/unarchiveMultipleUsers', authenticate, UserController.unarchiveMultipleUsers);

module.exports = router;