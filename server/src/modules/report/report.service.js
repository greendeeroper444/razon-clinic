const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
const Billing = require('@modules/billing/billing.model');
const MedicalRecord = require('@modules/medical-record/medicalRecord.model');
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

    // ==================== AGE CALCULATION HELPER ====================
    calculateAgeInDays(dateOfBirth) {
        const today = new Date();
        const birth = new Date(dateOfBirth);
        const diffTime = Math.abs(today - birth);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateAgeInYears(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    categorizeAge(dateOfBirth) {
        const ageInDays = this.calculateAgeInDays(dateOfBirth);
        const ageInYears = this.calculateAgeInYears(dateOfBirth);
        
        // Neonate / Newborn: 0–28 days
        if (ageInDays <= 28) return 'neonate';
        
        // Infant: 1 month – 1 year (29 days to 365 days)
        if (ageInDays <= 365) return 'infant';
        
        // Toddler: 1 – 3 years
        if (ageInYears >= 1 && ageInYears < 3) return 'toddler';
        
        // Preschool / Early Childhood: 3 – 5 years
        if (ageInYears >= 3 && ageInYears < 6) return 'preschool';
        
        // School-age / Middle Childhood: 6 – 12 years
        if (ageInYears >= 6 && ageInYears < 13) return 'schoolAge';
        
        // Adolescent: 13 – 18 years
        if (ageInYears >= 13 && ageInYears <= 18) return 'adolescent';
        
        // Adult: 18+ years
        return 'adult';
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

        const lowStockItems = items.filter(item => item.quantityInStock < 50).length;

        // expiring soon (within 30 days)
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

    // ==================== MEDICAL RECORDS REPORTS ====================
    async getMedicalRecordsReport(queryParams) {
        const {
            search, page, limit, gender, period, fromDate, toDate,
            sortBy = 'dateRecorded', sortOrder = 'desc'
        } = queryParams;

        const filter = { deletedAt: null };

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
                'dateRecorded'
            );
            if (dateFilter) Object.assign(filter, dateFilter);
        }

        if (search) {
            const searchFilter = this.buildSearchFilter(search, ['personalDetails.fullName', 'diagnosis', 'medicalRecordNumber']);
            Object.assign(filter, searchFilter);
        }

        if (gender) {
            filter['personalDetails.gender'] = gender;
        }

        const searchTerm = search || null;

        const result = await this.paginate(MedicalRecord, filter, {
            page,
            limit,
            sortBy,
            sortOrder,
            populate: {
                path: 'appointmentId',
                select: 'appointmentDate status'
            },
            searchTerm
        });

        const statistics = await this.getMedicalRecordsStatistics(filter);

        return {
            medicalRecords: result.data,
            pagination: result.pagination,
            statistics
        };
    }

    async getMedicalRecordsStatistics(filter = {}) {
        const records = await MedicalRecord.find(filter);

        const totalRecords = records.length;
        
        const malePatients = records.filter(r => r.personalDetails?.gender === 'Male').length;
        const femalePatients = records.filter(r => r.personalDetails?.gender === 'Female').length;
        const otherPatients = records.filter(r => r.personalDetails?.gender === 'Other').length;

        // Age distribution based on medical age categories
        const ageDistribution = {
            neonate: 0,      // 0–28 days
            infant: 0,       // 1 month – 1 year
            toddler: 0,      // 1 – 3 years
            preschool: 0,    // 3 – 5 years
            schoolAge: 0,    // 6 – 12 years
            adolescent: 0,   // 13 – 18 years
            adult: 0         // 18+ years
        };

        records.forEach(record => {
            if (record.personalDetails?.dateOfBirth) {
                const category = this.categorizeAge(record.personalDetails.dateOfBirth);
                if (ageDistribution.hasOwnProperty(category)) {
                    ageDistribution[category]++;
                }
            }
        });

        // Follow-up tracking
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const upcomingFollowUps = records.filter(r => 
            r.followUpDate && 
            new Date(r.followUpDate) <= thirtyDaysFromNow &&
            new Date(r.followUpDate) >= new Date()
        ).length;

        const overdueFollowUps = records.filter(r => 
            r.followUpDate && 
            new Date(r.followUpDate) < new Date()
        ).length;

        return {
            totalRecords,
            genderDistribution: {
                male: malePatients,
                female: femalePatients,
                other: otherPatients
            },
            ageDistribution,
            followUps: {
                upcoming: upcomingFollowUps,
                overdue: overdueFollowUps
            }
        };
    }

    async getMedicalRecordsSummary() {
        const allRecords = await MedicalRecord.find({ deletedAt: null });
        
        const todayRange = this.getDateRange('today');
        const weekRange = this.getDateRange('week');
        const monthRange = this.getDateRange('month');
        const yearRange = this.getDateRange('year');

        const todayRecords = await MedicalRecord.countDocuments({
            deletedAt: null,
            dateRecorded: { $gte: todayRange.fromDate, $lte: todayRange.toDate }
        });

        const weekRecords = await MedicalRecord.countDocuments({
            deletedAt: null,
            dateRecorded: { $gte: weekRange.fromDate, $lte: weekRange.toDate }
        });

        const monthRecords = await MedicalRecord.countDocuments({
            deletedAt: null,
            dateRecorded: { $gte: monthRange.fromDate, $lte: monthRange.toDate }
        });

        const yearRecords = await MedicalRecord.countDocuments({
            deletedAt: null,
            dateRecorded: { $gte: yearRange.fromDate, $lte: yearRange.toDate }
        });

        return {
            total: allRecords.length,
            today: todayRecords,
            week: weekRecords,
            month: monthRecords,
            year: yearRecords
        };
    }

    // ==================== LINE CHART DATA ====================
    
    // Helper: Generate date labels based on period
    generateDateLabels(period, fromDate, toDate) {
        const labels = [];
        const dataPoints = [];
        
        if (period === 'week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                dataPoints.push({
                    date: new Date(date),
                    endDate: new Date(date.setHours(23, 59, 59, 999))
                });
            }
        } else if (period === 'month') {
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                dataPoints.push({
                    date: new Date(date),
                    endDate: new Date(date.setHours(23, 59, 59, 999))
                });
            }
        } else if (period === 'year') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
                labels.push(startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
                dataPoints.push({
                    date: startOfMonth,
                    endDate: endOfMonth
                });
            }
        } else if (fromDate && toDate) {
            // Custom date range - daily breakdown
            const start = new Date(fromDate);
            const end = new Date(toDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            for (let i = 0; i <= diffDays; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                date.setHours(0, 0, 0, 0);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                dataPoints.push({
                    date: new Date(date),
                    endDate: new Date(date.setHours(23, 59, 59, 999))
                });
            }
        }
        
        return { labels, dataPoints };
    }

    // Inventory Line Chart Data
    async getInventoryLineChartData(queryParams) {
        const { period = 'month', fromDate, toDate } = queryParams;
        
        const { labels, dataPoints } = this.generateDateLabels(period, fromDate, toDate);
        
        const itemsAdded = [];
        const stockValue = [];
        
        for (const point of dataPoints) {
            // Items added on this date
            const addedCount = await InventoryItem.countDocuments({
                isArchived: false,
                createdAt: { $gte: point.date, $lte: point.endDate }
            });
            itemsAdded.push(addedCount);
            
            // Total stock value at end of this period
            const items = await InventoryItem.find({
                isArchived: false,
                createdAt: { $lte: point.endDate }
            });
            const totalValue = items.reduce((sum, item) => 
                sum + (item.quantityInStock * item.price), 0
            );
            stockValue.push(parseFloat(totalValue.toFixed(2)));
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Items Added',
                    data: itemsAdded,
                    type: 'itemsAdded'
                },
                {
                    label: 'Stock Value (₱)',
                    data: stockValue,
                    type: 'stockValue'
                }
            ]
        };
    }

    // Sales Line Chart Data
    async getSalesLineChartData(queryParams) {
        const { period = 'month', fromDate, toDate } = queryParams;
        
        const { labels, dataPoints } = this.generateDateLabels(period, fromDate, toDate);
        
        const revenue = [];
        const salesCount = [];
        
        for (const point of dataPoints) {
            const billings = await Billing.find({
                createdAt: { $gte: point.date, $lte: point.endDate }
            });
            
            const totalRevenue = billings.reduce((sum, b) => sum + b.amount, 0);
            revenue.push(parseFloat(totalRevenue.toFixed(2)));
            salesCount.push(billings.length);
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Revenue (₱)',
                    data: revenue,
                    type: 'revenue'
                },
                {
                    label: 'Sales Count',
                    data: salesCount,
                    type: 'salesCount'
                }
            ]
        };
    }

    // Medical Records Line Chart Data
    async getMedicalRecordsLineChartData(queryParams) {
        const { period = 'month', fromDate, toDate } = queryParams;
        
        const { labels, dataPoints } = this.generateDateLabels(period, fromDate, toDate);
        
        const recordsCreated = [];
        
        for (const point of dataPoints) {
            const count = await MedicalRecord.countDocuments({
                deletedAt: null,
                dateRecorded: { $gte: point.date, $lte: point.endDate }
            });
            recordsCreated.push(count);
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Patient Records',
                    data: recordsCreated,
                    type: 'recordsCreated'
                }
            ]
        };
    }

    // ==================== COMBINED DASHBOARD REPORT ====================
    async getDashboardReport() {
        const inventorySummary = await this.getInventorySummary();
        const salesSummary = await this.getSalesSummary();
        const medicalRecordsSummary = await this.getMedicalRecordsSummary();
        const inventoryStats = await this.getInventoryStatistics({ isArchived: false });
        const salesStats = await this.getSalesStatistics({});
        const medicalRecordsStats = await this.getMedicalRecordsStatistics({ deletedAt: null });

        return {
            inventory: {
                summary: inventorySummary,
                statistics: inventoryStats
            },
            sales: {
                summary: salesSummary,
                statistics: salesStats
            },
            medicalRecords: {
                summary: medicalRecordsSummary,
                statistics: medicalRecordsStats
            },
            generatedAt: new Date()
        };
    }
}

module.exports = new ReportService();