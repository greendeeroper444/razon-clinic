const BillingService = require('./billing.service');
const GenerateBillingFile = require('./generateBillingFile.helper');

class BillingController {

    async addBilling(req, res, next) {
        try {
            const billing = await BillingService.createBilling(req.body, req.user);

            return res.status(201).json({
                success: true,
                message: 'Billing record created successfully',
                data: billing
            });
        } catch (error) {
            next(error);
        }
    }

    async getBillings(req, res, next) {
        try {
            const result = await BillingService.getBillings(req.query);

            return res.status(200).json({
                success: true,
                message: 'Billing records retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getBillingById(req, res, next) {
        try {
            const { billingId } = req.params;
            const billing = await BillingService.getBillingById(billingId);

            return res.status(200).json({
                success: true,
                message: 'Billing record retrieved successfully',
                data: billing
            });
        } catch (error) {
            next(error);
        }
    }

    async getMedicalRecordsForBilling(req, res, next) {
        try {
            const medicalRecords = await BillingService.getMedicalRecordsForBilling();

            return res.status(200).json({
                success: true,
                message: 'Medical records retrieved successfully',
                data: {
                    medicalRecords,
                    count: medicalRecords.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryItemsForBilling(req, res, next) {
        try {
            const inventoryItems = await BillingService.getInventoryItemsForBilling();

            return res.status(200).json({
                success: true,
                message: 'Inventory items retrieved successfully',
                data: {
                    inventoryItems,
                    count: inventoryItems.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getBillingsByMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const billings = await BillingService.getBillingsByMedicalRecord(medicalRecordId);

            return res.status(200).json({
                success: true,
                message: 'Billings for medical record retrieved successfully',
                data: {
                    billings,
                    count: billings.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getBillingsByPaymentStatus(req, res, next) {
        try {
            const { paymentStatus } = req.params;
            const billings = await BillingService.getBillingsByPaymentStatus(paymentStatus);

            return res.status(200).json({
                success: true,
                message: `Billings with ${paymentStatus} status retrieved successfully`,
                data: {
                    billings,
                    count: billings.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getTotalRevenue(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const revenueData = await BillingService.getTotalRevenue(startDate, endDate);

            return res.status(200).json({
                success: true,
                message: 'Revenue data retrieved successfully',
                data: revenueData
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== UPDATE ====================
    async updateBilling(req, res, next) {
        try {
            const { billingId } = req.params;
            const { path } = req.route;
            
            const isPaymentStatusUpdate = path.includes('/paymentStatus');

            const billing = await BillingService.updateBilling(
                billingId, 
                req.body, 
                req.user, 
                isPaymentStatusUpdate
            );

            return res.status(200).json({
                success: true,
                message: 'Billing record updated successfully',
                data: billing
            });
        } catch (error) {
            next(error);
        }
    }
    
    // ==================== DELETE ====================
    async deleteBilling(req, res, next) {
        try {
            const { billingId } = req.params;
            const billing = await BillingService.deleteBilling(billingId);

            return res.status(200).json({
                success: true,
                message: 'Billing record deleted successfully',
                data: billing
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== EXPORT ====================
    async exportBillings(req, res, next) {
        try {
            const {
                format = 'csv',
                search,
                paymentStatus,
                patientName,
                itemName,
                minAmount,
                maxAmount,
                fromDate,
                toDate,
                sortBy,
                sortOrder
            } = req.query;

            const queryParams = {
                search,
                paymentStatus,
                patientName,
                itemName,
                minAmount,
                maxAmount,
                fromDate,
                toDate,
                sortBy,
                sortOrder,
                page: null,
                limit: null
            };

            const result = await BillingService.getBillings(queryParams);
            const records = result.billings;

            if (!records || records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No billing records found to export'
                });
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const formatLower = format.toLowerCase();

            if (formatLower === 'csv') {
                const csvData = GenerateBillingFile.generateCSV(records);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="billing_records_${timestamp}.csv"`);
                return res.status(200).send(csvData);
            } else if (formatLower === 'xlsx') {
                const xlsxData = await GenerateBillingFile.generateXLSX(records);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="billing_records_${timestamp}.xlsx"`);
                return res.status(200).send(xlsxData);
            } else if (formatLower === 'json') {
                const jsonData = GenerateBillingFile.generateJSON(records);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="billing_records_${timestamp}.json"`);
                return res.status(200).send(jsonData);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid format. Supported formats: csv, xlsx, json'
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BillingController();