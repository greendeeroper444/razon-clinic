const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

class NotificationService {

    async getNotifications(userId, userRole, queryParams) {
        const { page, limit, isRead } = queryParams;
        
        const filter = {};
   
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true';
        }
        
        //find notifications based on user role
        //admins see all notifications, others see only their own
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }
        
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ 
            ...filter, 
            isRead: false 
        });
        
        const totalPages = Math.ceil(total / parseInt(limit));
        
        return {
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            },
            unreadCount
        };
    }

    async markNotificationAsRead(notificationId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new Error('Invalid notification ID');
        }
        
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            throw new Error('Notification not found');
        }
        

        notification.isRead = true;
        await notification.save();
        
        return notification;
    }

    async markAllNotificationsAsRead(userId, userRole) {
        const filter = {};
        
        //for non-admin users, only mark their own notifications as read
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }
        
        //update all matching notifications
        const result = await Notification.updateMany(
            { ...filter, isRead: false },
            { $set: { isRead: true } }
        );
        
        return {
            modifiedCount: result.modifiedCount,
            message: 'All notifications marked as read'
        };
    }

    async deleteNotification(notificationId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new Error('Invalid notification ID');
        }
        
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) {
            throw new Error('Notification not found');
        }
        
        return notification;
    }

    async deleteAllReadNotifications(userId, userRole) {
        const filter = { isRead: true };
        
        //for non-admin users, only delete their own notifications
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }
        
        const result = await Notification.deleteMany(filter);
        
        return {
            deletedCount: result.deletedCount,
            message: 'All read notifications deleted successfully'
        };
    }

    async createNotification(notificationData) {
        const {
            sourceId,
            sourceType,
            type,
            entityId,
            entityType,
            message,
            isRead = false
        } = notificationData;

        if (!sourceId || !type || !message) {
            throw new Error('Source ID, type, and message are required');
        }

        if (!mongoose.Types.ObjectId.isValid(sourceId)) {
            throw new Error('Invalid source ID');
        }

        if (entityId && !mongoose.Types.ObjectId.isValid(entityId)) {
            throw new Error('Invalid entity ID');
        }

        const existingNotification = await Notification.findOne({
            sourceId,
            entityId,
            type,
            entityType,
        });

        if (existingNotification) {
            throw new Error('Notification already exists');
        }

        const notification = new Notification({
            sourceId,
            sourceType,
            type,
            entityId,
            entityType,
            message,
            isRead
        });

        return await notification.save();
    }

    async getNotificationById(notificationId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new Error('Invalid notification ID');
        }

        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            throw new Error('Notification not found');
        }

        return notification;
    }

    async getNotificationsByType(userId, userRole, notificationType) {
        const filter = { type: notificationType };
        
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }

        return await Notification.find(filter)
            .sort({ createdAt: -1 });
    }

    async getUnreadNotifications(userId, userRole) {
        const filter = { isRead: false };
        
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 });

        return {
            notifications,
            count: notifications.length
        };
    }

    async getNotificationStats(userId, userRole) {
        const filter = {};
        
        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }

        const total = await Notification.countDocuments(filter);
        const unread = await Notification.countDocuments({ ...filter, isRead: false });
        const read = await Notification.countDocuments({ ...filter, isRead: true });

        //get notifications by type
        const typeStats = await Notification.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $eq: ['$isRead', false] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return {
            total,
            unread,
            read,
            typeStats
        };
    }

    async bulkMarkAsRead(notificationIds, userId, userRole) {
        const invalidIds = notificationIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new Error('Invalid notification IDs provided');
        }

        const filter = {
            _id: { $in: notificationIds },
            isRead: false
        };

        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }

        const result = await Notification.updateMany(
            filter,
            { $set: { isRead: true } }
        );

        return {
            modifiedCount: result.modifiedCount,
            message: `${result.modifiedCount} notifications marked as read`
        };
    }

    async bulkDeleteNotifications(notificationIds, userId, userRole) {
        const invalidIds = notificationIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new Error('Invalid notification IDs provided');
        }

        const filter = {
            _id: { $in: notificationIds }
        };

        if (!this.isAdminRole(userRole)) {
            filter.sourceId = userId;
        }

        const result = await Notification.deleteMany(filter);

        return {
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} notifications deleted successfully`
        };
    }

    isAdminRole(userRole) {
        const adminRoles = ['Admin', 'Staff', 'Doctor', 'Secretary'];
        return adminRoles.includes(userRole);
    }

    async checkNotificationExists(notificationId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return false;
        }
        
        const notification = await Notification.findById(notificationId);
        return !!notification;
    }

    async countNotifications(filter = {}) {
        return await Notification.countDocuments(filter);
    }
}

module.exports = new NotificationService();