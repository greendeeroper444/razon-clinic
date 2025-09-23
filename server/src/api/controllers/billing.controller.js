const BillingService = require('../../services/billing.service');

class BillingController {

    async addBilling(req, res, next) {
        try {
            const billing = await BillingService.createBilling(req.body);

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

    async updateBilling(req, res, next) {
        try {
            const { billingId } = req.params;
            const billing = await BillingService.updateBilling(billingId, req.body);

            return res.status(200).json({
                success: true,
                message: 'Billing record updated successfully',
                data: billing
            });
        } catch (error) {
            next(error);
        }
    }

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
}

module.exports = new BillingController();