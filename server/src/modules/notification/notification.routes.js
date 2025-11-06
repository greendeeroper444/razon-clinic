const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const notificationController = require('./notification.controller');


router.use(authenticate);

router.get('/getNotifications', notificationController.getNotifications);
router.patch('/markAsRead/:notificationId/mark-read', notificationController.markAsRead);
router.patch('/markAllAsRead', notificationController.markAllAsRead);
// router.post('/createNotification', notificationController.createNotification);
router.delete('/deleteNotification/:notificationId', notificationController.deleteNotification);
router.delete('/deleteAllRead', notificationController.deleteAllRead);

module.exports = router;