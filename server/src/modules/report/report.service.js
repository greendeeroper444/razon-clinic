const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
const Billing = require('@modules/billing/billing.model');
const BaseService = require('@services/base.service');

class ReportService extends BaseService {

    // ==================== DATE RANGE HELPERS ====================
    getDateRange(period) {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        switch (period) {
            case 'today':
                return { fromDate: startOfDay, toDate: endOfDay };
            
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); //sunday
                startOfWeek.setHours(0, 0, 0, 0);
                return { fromDate: startOfWeek, toDate: endOfDay };
            
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return { fromDate: startOfMonth, toDate: endOfDay };
            
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                return { fromDate: startOfYear, toDate: endOfDay };
            
            default:
                return null;
        }
    }

    // ==================== INVENTORY REPORTS ====================
    async getInventoryReport(queryParams) {
        const {
            search, page, limit, category, period, fromDate, toDate,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = queryParams;

        const filter = { isArchived: false };

        let dateRange;
        if (period) {
            dateRange = this.getDateRange(period);
        } else if (fromDate || toDate) {
            dateRange = { 
                fromDate: fromDate ? new Date(fromDate) : null, 
                toDate: toDate ? new Date(toDate) : null 
            };
        }

        if (dateRange) {
            const dateFilter = this.buildDateRangeFilter(
                dateRange.fromDate, 
                dateRange.toDate, 
                'createdAt'
            );
            if (dateFilter) Object.assign(filter, dateFilter);
        }

        if (search) {
            const searchFilter = this.buildSearchFilter(search, ['itemName']);
            Object.assign(filter, searchFilter);
        }

        if (category) {
            filter.category = category;
        }

        const searchTerm = search || null;

        const result = await this.paginate(InventoryItem, filter, {
            page,
            limit,
            sortBy,
            sortOrder,
            searchTerm
        });

        const statistics = await this.getInventoryStatistics(filter);

        return {
            inventoryItems: result.data,
            pagination: result.pagination,
            statistics
        };
    }

    async getInventoryStatistics(filter = {}) {
        const items = await InventoryItem.find(filter);

        const totalItems = items.length;
        const totalStock = items.reduce((sum, item) => sum + item.quantityInStock, 0);
        const totalUsed = items.reduce((sum, item) => sum + item.quantityUsed, 0);
        const totalValue = items.reduce((sum, item) => sum + (item.quantityInStock * item.price), 0);

        const vaccines = items.filter(item => item.category === 'Vaccine').length;
        const medicalSupplies = items.filter(item => item.category === 'Medical Supply').length;

        //low stock items (less than 10)
        const lowStockItems = items.filter(item => (item.quantityInStock - item.quantityUsed) < 10).length;

        //expiring soon (within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoon = items.filter(item => item.expiryDate <= thirtyDaysFromNow).length;

        return {
            totalItems,
            totalStock,
            totalUsed,
            totalValue: parseFloat(totalValue.toFixed(2)),
            vaccines,
            medicalSupplies,
            lowStockItems,
            expiringSoon
        };
    }

    async getInventorySummary() {
        const allItems = await InventoryItem.find({ isArchived: false });
        
        const todayRange = this.getDateRange('today');
        const weekRange = this.getDateRange('week');
        const monthRange = this.getDateRange('month');
        const yearRange = this.getDateRange('year');

        const todayItems = await InventoryItem.countDocuments({
            isArchived: false,
            createdAt: { $gte: todayRange.fromDate, $lte: todayRange.toDate }
        });

        const weekItems = await InventoryItem.countDocuments({
            isArchived: false,
            createdAt: { $gte: weekRange.fromDate, $lte: weekRange.toDate }
        });

        const monthItems = await InventoryItem.countDocuments({
            isArchived: false,
            createdAt: { $gte: monthRange.fromDate, $lte: monthRange.toDate }
        });

        const yearItems = await InventoryItem.countDocuments({
            isArchived: false,
            createdAt: { $gte: yearRange.fromDate, $lte: yearRange.toDate }
        });

        return {
            total: allItems.length,
            today: todayItems,
            week: weekItems,
            month: monthItems,
            year: yearItems
        };
    }

    // ==================== SALES/BILLING REPORTS ====================
    async getSalesReport(queryParams) {
        const {
            search, page, limit, paymentStatus, period, fromDate, toDate,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = queryParams;

        const filter = {};

        let dateRange;
        if (period) {
            dateRange = this.getDateRange(period);
        } else if (fromDate || toDate) {
            dateRange = { 
                fromDate: fromDate ? new Date(fromDate) : null, 
                toDate: toDate ? new Date(toDate) : null 
            };
        }

        if (dateRange) {
            const dateFilter = this.buildDateRangeFilter(
                dateRange.fromDate, 
                dateRange.toDate, 
                'createdAt'
            );
            if (dateFilter) Object.assign(filter, dateFilter);
        }

        if (search) {
            const searchFilter = this.buildSearchFilter(search, ['patientName', 'itemName']);
            Object.assign(filter, searchFilter);
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        const searchTerm = search || null;

        const result = await this.paginate(Billing, filter, {
            page,
            limit,
            sortBy,
            sortOrder,
            populate: {
                path: 'medicalRecordId',
                select: 'personalDetails.fullName diagnosis'
            },
            searchTerm
        });

        const statistics = await this.getSalesStatistics(filter);

        return {
            billings: result.data,
            pagination: result.pagination,
            statistics
        };
    }

    async getSalesStatistics(filter = {}) {
        const billings = await Billing.find(filter);

        const totalSales = billings.length;
        const totalRevenue = billings.reduce((sum, billing) => sum + billing.amount, 0);

        const paid = billings.filter(b => b.paymentStatus === 'Paid');
        const unpaid = billings.filter(b => b.paymentStatus === 'Unpaid');
        const pending = billings.filter(b => b.paymentStatus === 'Pending');

        const paidAmount = paid.reduce((sum, b) => sum + b.amount, 0);
        const unpaidAmount = unpaid.reduce((sum, b) => sum + b.amount, 0);
        const pendingAmount = pending.reduce((sum, b) => sum + b.amount, 0);

        return {
            totalSales,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            paid: {
                count: paid.length,
                amount: parseFloat(paidAmount.toFixed(2))
            },
            unpaid: {
                count: unpaid.length,
                amount: parseFloat(unpaidAmount.toFixed(2))
            },
            pending: {
                count: pending.length,
                amount: parseFloat(pendingAmount.toFixed(2))
            }
        };
    }

    async getSalesSummary() {
        const allBillings = await Billing.find();
        
        const todayRange = this.getDateRange('today');
        const weekRange = this.getDateRange('week');
        const monthRange = this.getDateRange('month');
        const yearRange = this.getDateRange('year');

        const todayBillings = await Billing.find({
            createdAt: { $gte: todayRange.fromDate, $lte: todayRange.toDate }
        });

        const weekBillings = await Billing.find({
            createdAt: { $gte: weekRange.fromDate, $lte: weekRange.toDate }
        });

        const monthBillings = await Billing.find({
            createdAt: { $gte: monthRange.fromDate, $lte: monthRange.toDate }
        });

        const yearBillings = await Billing.find({
            createdAt: { $gte: yearRange.fromDate, $lte: yearRange.toDate }
        });

        return {
            total: {
                count: allBillings.length,
                revenue: parseFloat(allBillings.reduce((sum, b) => sum + b.amount, 0).toFixed(2))
            },
            today: {
                count: todayBillings.length,
                revenue: parseFloat(todayBillings.reduce((sum, b) => sum + b.amount, 0).toFixed(2))
            },
            week: {
                count: weekBillings.length,
                revenue: parseFloat(weekBillings.reduce((sum, b) => sum + b.amount, 0).toFixed(2))
            },
            month: {
                count: monthBillings.length,
                revenue: parseFloat(monthBillings.reduce((sum, b) => sum + b.amount, 0).toFixed(2))
            },
            year: {
                count: yearBillings.length,
                revenue: parseFloat(yearBillings.reduce((sum, b) => sum + b.amount, 0).toFixed(2))
            }
        };
    }

    // ==================== COMBINED DASHBOARD REPORT ====================
    async getDashboardReport() {
        const inventorySummary = await this.getInventorySummary();
        const salesSummary = await this.getSalesSummary();
        const inventoryStats = await this.getInventoryStatistics({ isArchived: false });
        const salesStats = await this.getSalesStatistics({});

        return {
            inventory: {
                summary: inventorySummary,
                statistics: inventoryStats
            },
            sales: {
                summary: salesSummary,
                statistics: salesStats
            },
            generatedAt: new Date()
        };
    }
}

module.exports = new ReportService();