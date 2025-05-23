const Notification = require('../../models/notification.model');
const mongoose = require('mongoose');

class NotificationController {
   
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, isRead } = req.query;
            
            //query filter
            const filter = {};
            
            //if we're specifically filtering by read status
            if (isRead !== undefined) {
                filter.isRead = isRead === 'true';
            }
            
            //find notifications based on user role
            //admins see all notifications, others see only their own
            if (req.user.role !== 'Admin' && req.user.role !== 'Staff' && req.user.role !== 'Doctor' && req.user.role !== 'Secretary') {
                filter.sourceId = userId;
            }
            
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: { createdAt: -1 }
            };
            
            //get paginated results
            const notifications = await Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((options.page - 1) * options.limit)
                .limit(options.limit);
            
            //count total documents and unread count
            const total = await Notification.countDocuments(filter);
            const unreadCount = await Notification.countDocuments({ 
                ...filter, 
                isRead: false 
            });
            
            return res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: notifications,
                pagination: {
                    total,
                    page: options.page,
                    pages: Math.ceil(total / options.limit)
                },
                unreadCount
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            next(error);
        }
    }
    
    
    async markAsRead(req, res, next) {
        try {
            const { notificationId } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid notification ID'
                });
            }
            
            const notification = await Notification.findById(notificationId);
            
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
            
            //update the notification
            notification.isRead = true;
            await notification.save();
            
            return res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                data: notification
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            next(error);
        }
    }
    
    
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            
            //filter based on user role
            const filter = {};
            
            //for non-admin users, only mark their own notifications as read
            if (req.user.role !== 'Admin' && req.user.role !== 'Doctor' && req.user.role !== 'Secretary') {
                filter.sourceId = userId;
            }
            
            //update all matching notifications
            const result = await Notification.updateMany(
                { ...filter, isRead: false },
                { $set: { isRead: true } }
            );
            
            return res.status(200).json({
                success: true,
                message: 'All notifications marked as read',
                count: result.modifiedCount
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            next(error);
        }
    }
    

    async createNotification(req, res, next) {
        try {
            const { 
                sourceId, 
                sourceType, 
                type, 
                entityId, 
                entityType, 
                message 
            } = req.body;
            
            //validate required fields
            if (!type || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Type and message are required fields'
                });
            }
            
            const notification = new Notification({
                sourceId,
                sourceType,
                type,
                entityId,
                entityType,
                message,
                isRead: false
            });
            
            await notification.save();
            
            return res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            next(error);
        }
    }
    
   
    async deleteNotification(req, res, next) {
        try {
            const { notificationId } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid notification ID'
                });
            }
            
            const notification = await Notification.findByIdAndDelete(notificationId);
            
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            next(error);
        }
    }
    
    
    async deleteAllRead(req, res, next) {
        try {
            const userId = req.user.id;
            
            //build filter based on user role
            const filter = { isRead: true };
            
            //for non-admin users, only delete their own notifications
            if (req.user.role !== 'Admin' && req.user.role !== 'Doctor' && req.user.role !== 'Secretary') {
                filter.sourceId = userId;
            }
            
            const result = await Notification.deleteMany(filter);
            
            return res.status(200).json({
                success: true,
                message: 'All read notifications deleted successfully',
                count: result.deletedCount
            });
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            next(error);
        }
    }
}

module.exports = new NotificationController();