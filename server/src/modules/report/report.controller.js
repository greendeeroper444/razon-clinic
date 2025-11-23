const ReportService = require('./report.service');
const GenerateReportFile = require('./generateReportFile.helper');

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

    async exportInventoryReport(req, res, next) {
        try {
            const {
                search,
                category,
                period,
                fromDate,
                toDate,
                sortBy,
                sortOrder
            } = req.query;

            const queryParams = {
                search,
                category,
                period,
                fromDate,
                toDate,
                sortBy,
                sortOrder,
                page: null,
                limit: null
            };

            const result = await ReportService.getInventoryReport(queryParams);
            const records = result.inventoryItems;

            if (!records || records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No inventory records found to export'
                });
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const xlsxData = await GenerateReportFile.generateInventoryXLSX(records);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${timestamp}.xlsx"`);
            
            return res.status(200).send(xlsxData);
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

    async exportSalesReport(req, res, next) {
        try {
            const {
                search,
                paymentStatus,
                period,
                fromDate,
                toDate,
                sortBy,
                sortOrder
            } = req.query;

            const queryParams = {
                search,
                paymentStatus,
                period,
                fromDate,
                toDate,
                sortBy,
                sortOrder,
                page: null,
                limit: null
            };

            const result = await ReportService.getSalesReport(queryParams);
            const records = result.billings;

            if (!records || records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No sales records found to export'
                });
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const xlsxData = await GenerateReportFile.generateSalesXLSX(records);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="sales_report_${timestamp}.xlsx"`);
            
            return res.status(200).send(xlsxData);
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