const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/getNotifications', NotificationController.getNotifications);
router.patch('/markAsRead/:notificationId/mark-read', NotificationController.markAsRead);
router.patch('/markAllAsRead', NotificationController.markAllAsRead);
router.post('/createNotification', NotificationController.createNotification);
router.delete('/deleteNotification/:notificationId', NotificationController.deleteNotification);
router.delete('/deleteAllRead', NotificationController.deleteAllRead);

module.exports = router;