const MedicalRecord = require('@modules/medical-record/medicalRecord.model');
const Appointment = require('@modules/appointment/appointment.model');
const Billing = require('@modules/billing/billing.model');
const Patient = require('@modules/patient/patient.model');
const InventoryItem = require('@modules/inventory-item/inventoryItem.model');

class DashboardService {

    async getDashboardStats(queryParams = {}) {
        try {
            const { startDate, endDate } = queryParams;

            //build date filter if provided
            const dateFilter = {};
            if (startDate || endDate) {
                dateFilter.createdAt = {};
                if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
                if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
            }

            //get all stats in parallel for better performance
            const [
                totalMedicalRecords,
                totalAppointments,
                totalSales,
                totalPatients,
                lowStockItems
            ] = await Promise.all([
                this.getTotalMedicalRecords(dateFilter),
                this.getTotalAppointments(dateFilter),
                this.getTotalSales(dateFilter),
                this.getTotalPatients(),
                this.getLowStockInventory()
            ]);

            return {
                totalMedicalRecords,
                totalAppointments,
                totalSales,
                totalPatients,
                lowStockItems: {
                    count: lowStockItems.count,
                    items: lowStockItems.items
                },
                dateRange: {
                    startDate: startDate || null,
                    endDate: endDate || null
                }
            };
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            throw error;
        }
    }

    async getTotalMedicalRecords(dateFilter = {}) {
        try {
            //count all medical records that are not soft-deleted
            const filter = {
                deletedAt: null,
                ...dateFilter
            };

            const count = await MedicalRecord.countDocuments(filter);

            return {
                count,
                label: 'Total Medical Records'
            };
        } catch (error) {
            console.error('Error getting total medical records:', error);
            throw new Error('Failed to retrieve medical records count');
        }
    }

    async getTotalAppointments(dateFilter = {}) {
        try {
            //count all appointments
            const filter = {
                ...dateFilter
            };

            const count = await Appointment.countDocuments(filter);

            //get breakdown by status
            const statusBreakdown = await Appointment.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const breakdown = {};
            statusBreakdown.forEach(item => {
                breakdown[item._id] = item.count;
            });

            return {
                count,
                label: 'Total Appointments',
                breakdown: {
                    pending: breakdown['Pending'] || 0,
                    confirmed: breakdown['Confirmed'] || 0,
                    completed: breakdown['Completed'] || 0,
                    cancelled: breakdown['Cancelled'] || 0
                }
            };
        } catch (error) {
            console.error('Error getting total appointments:', error);
            throw new Error('Failed to retrieve appointments count');
        }
    }

    async getTotalSales(dateFilter = {}) {
        try {
            //calculate total sales from paid billings
            const filter = {
                paymentStatus: 'Paid',
                ...dateFilter
            };

            const result = await Billing.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$amount' },
                        totalTransactions: { $sum: 1 },
                        averageTransaction: { $avg: '$amount' }
                    }
                }
            ]);

            const salesData = result[0] || {
                totalRevenue: 0,
                totalTransactions: 0,
                averageTransaction: 0
            };

            //get payment status breakdown
            const allBillings = await Billing.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);

            const paymentBreakdown = {};
            allBillings.forEach(item => {
                paymentBreakdown[item._id.toLowerCase()] = {
                    count: item.count,
                    amount: item.totalAmount
                };
            });

            return {
                totalRevenue: Math.round(salesData.totalRevenue * 100) / 100,
                totalTransactions: salesData.totalTransactions,
                averageTransaction: Math.round(salesData.averageTransaction * 100) / 100,
                label: 'Total Sales (Paid)',
                paymentBreakdown: {
                    paid: paymentBreakdown['paid'] || { count: 0, amount: 0 },
                    unpaid: paymentBreakdown['unpaid'] || { count: 0, amount: 0 },
                    pending: paymentBreakdown['pending'] || { count: 0, amount: 0 }
                }
            };
        } catch (error) {
            console.error('Error getting total sales:', error);
            throw new Error('Failed to retrieve sales data');
        }
    }

    async getTotalPatients() {
        try {
            //count all patients that are not archived
            const activePatients = await Patient.countDocuments({
                isArchived: false
            });

            const archivedPatients = await Patient.countDocuments({
                isArchived: true
            });

            const totalPatients = activePatients + archivedPatients;

            return {
                count: totalPatients,
                activeCount: activePatients,
                archivedCount: archivedPatients,
                label: 'Total Patients'
            };
        } catch (error) {
            console.error('Error getting total patients:', error);
            throw new Error('Failed to retrieve patients count');
        }
    }

    async getLowStockInventory(threshold = 50) {
        try {
            // find items where quantityInStock is below threshold and not archived
            const lowStockItems = await InventoryItem.find({
                quantityInStock: { $lt: threshold },
                isArchived: false
            })
            .select('itemName category quantityInStock quantityUsed price expiryDate')
            .sort({ quantityInStock: 1 }) //sort by lowest stock first
            .lean();

            //calculate remaining quantity for each item
            const itemsWithDetails = lowStockItems.map(item => {
                const quantityRemaining = Math.max(0, item.quantityInStock - (item.quantityUsed || 0));
                const isExpired = item.expiryDate && item.expiryDate <= new Date();
                const isExpiringSoon = item.expiryDate && 
                    item.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

                return {
                    id: item._id,
                    itemName: item.itemName,
                    category: item.category,
                    quantityInStock: item.quantityInStock,
                    quantityUsed: item.quantityUsed || 0,
                    quantityRemaining,
                    price: item.price,
                    expiryDate: item.expiryDate,
                    isExpired,
                    isExpiringSoon,
                    status: isExpired ? 'Expired' : 
                            isExpiringSoon ? 'Expiring Soon' : 
                            quantityRemaining < 10 ? 'Critical' :
                            quantityRemaining < 25 ? 'Very Low' : 'Low'
                };
            });

            //get critical items (below 10)
            const criticalItems = itemsWithDetails.filter(item => item.quantityRemaining < 10);

            return {
                count: lowStockItems.length,
                criticalCount: criticalItems.length,
                threshold,
                label: `Low Stock Items (Below ${threshold})`,
                items: itemsWithDetails
            };
        } catch (error) {
            console.error('Error getting low stock inventory:', error);
            throw new Error('Failed to retrieve low stock inventory');
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            const recentMedicalRecords = await MedicalRecord.find({ deletedAt: null })
                .select('personalDetails.fullName dateRecorded diagnosis')
                .sort({ dateRecorded: -1 })
                .limit(limit)
                .lean();

            const recentAppointments = await Appointment.find()
                .select('patientName appointmentDate status')
                .sort({ appointmentDate: -1 })
                .limit(limit)
                .lean();

            const recentBillings = await Billing.find()
                .select('patientName amount paymentStatus createdAt')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return {
                recentMedicalRecords,
                recentAppointments,
                recentBillings
            };
        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw new Error('Failed to retrieve recent activity');
        }
    }

    async getMonthlyTrends(months = 6) {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const medicalRecordsTrend = await MedicalRecord.aggregate([
                {
                    $match: {
                        dateRecorded: { $gte: startDate },
                        deletedAt: null
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$dateRecorded' },
                            month: { $month: '$dateRecorded' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const salesTrend = await Billing.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        paymentStatus: 'Paid'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        revenue: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            return {
                medicalRecordsTrend,
                salesTrend
            };
        } catch (error) {
            console.error('Error getting monthly trends:', error);
            throw new Error('Failed to retrieve monthly trends');
        }
    }
}

module.exports = new DashboardService();