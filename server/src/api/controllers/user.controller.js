const UserService = require('../../services/user.service');

class UserController {

    async getUsers(req, res, next) {
        try {
            const result = await UserService.getUsers(req.query);
            
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getUserById(req, res, next) {
        try {
            const { userId } = req.params;
            
            const result = await UserService.getUserById(userId);
            
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async archiveUser(req, res, next) {
        try {
            const { userId } = req.params;
            const archivedByUserId = req.user.id; 
            
            const result = await UserService.archiveUser(userId, archivedByUserId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async unarchiveUser(req, res, next) {
        try {
            const { userId } = req.params;
            
            const result = await UserService.unarchiveUser(userId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async archiveMultipleUsers(req, res, next) {
        try {
            const { userIds } = req.body;
            const archivedByUserId = req.user.id;
            
            const result = await UserService.archiveMultipleUsers(userIds, archivedByUserId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async unarchiveMultipleUsers(req, res, next) {
        try {
            const { userIds } = req.body;
            
            const result = await UserService.unarchiveMultipleUsers(userIds);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();