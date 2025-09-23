const NotificationService = require('../../services/notification.service');

class NotificationController {

    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await NotificationService.getNotifications(userId, userRole, req.query);

            return res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const { notificationId } = req.params;
            const notification = await NotificationService.markNotificationAsRead(notificationId);

            return res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await NotificationService.markAllNotificationsAsRead(userId, userRole);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    modifiedCount: result.modifiedCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req, res, next) {
        try {
            const { notificationId } = req.params;
            const notification = await NotificationService.deleteNotification(notificationId);

            return res.status(200).json({
                success: true,
                message: 'Notification deleted successfully',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAllRead(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await NotificationService.deleteAllReadNotifications(userId, userRole);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    deletedCount: result.deletedCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //additional controller methods for enhanced functionality

    async createNotification(req, res, next) {
        try {
            const notification = await NotificationService.createNotification(req.body);

            return res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    async getNotificationById(req, res, next) {
        try {
            const { notificationId } = req.params;
            const notification = await NotificationService.getNotificationById(notificationId);

            return res.status(200).json({
                success: true,
                message: 'Notification retrieved successfully',
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    async getNotificationsByType(req, res, next) {
        try {
            const { type } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            const notifications = await NotificationService.getNotificationsByType(userId, userRole, type);

            return res.status(200).json({
                success: true,
                message: `Notifications of type '${type}' retrieved successfully`,
                data: {
                    notifications,
                    count: notifications.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await NotificationService.getUnreadNotifications(userId, userRole);

            return res.status(200).json({
                success: true,
                message: 'Unread notifications retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getNotificationStats(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const stats = await NotificationService.getNotificationStats(userId, userRole);

            return res.status(200).json({
                success: true,
                message: 'Notification statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async bulkMarkAsRead(req, res, next) {
        try {
            const { notificationIds } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Array of notification IDs is required'
                });
            }

            const result = await NotificationService.bulkMarkAsRead(notificationIds, userId, userRole);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    modifiedCount: result.modifiedCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async bulkDeleteNotifications(req, res, next) {
        try {
            const { notificationIds } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Array of notification IDs is required'
                });
            }

            const result = await NotificationService.bulkDeleteNotifications(notificationIds, userId, userRole);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    deletedCount: result.deletedCount
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();