const DashboardService = require('./dashboard.service');

class DashboardController {

    async getDashboardStats(req, res, next) {
        try {
            const stats = await DashboardService.getDashboardStats(req.query);

            return res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();