const ReportService = require('./report.service');

class ReportController {

    // ==================== INVENTORY REPORTS ====================
    async getInventoryReport(req, res, next) {
        try {
            const result = await ReportService.getInventoryReport(req.query);

            return res.status(200).json({
                success: true,
                message: 'Inventory report retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventorySummary(req, res, next) {
        try {
            const summary = await ReportService.getInventorySummary();

            return res.status(200).json({
                success: true,
                message: 'Inventory summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== SALES REPORTS ====================
    async getSalesReport(req, res, next) {
        try {
            const result = await ReportService.getSalesReport(req.query);

            return res.status(200).json({
                success: true,
                message: 'Sales report retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getSalesSummary(req, res, next) {
        try {
            const summary = await ReportService.getSalesSummary();

            return res.status(200).json({
                success: true,
                message: 'Sales summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== DASHBOARD REPORT ====================
    async getDashboardReport(req, res, next) {
        try {
            const dashboard = await ReportService.getDashboardReport();

            return res.status(200).json({
                success: true,
                message: 'Dashboard report retrieved successfully',
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReportController();