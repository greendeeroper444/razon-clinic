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

    async getArchivedUsers(req, res, next) {
        try {
            const result = await UserService.getArchivedUsers(req.query);
            
            res.status(200).json({
                success: true,
                message: 'Archived users retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();