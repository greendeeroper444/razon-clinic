export interface InventoryReportItem {
    id: string
    itemName: string
    category: string
    quantityInStock: number
    quantityUsed: number
    price: number
    totalValue: number
    expiryDate: string
    status: string
}

export interface SalesReportItem {
    id: string
    patientName: string
    medicalRecordId?: {
        id: string
        personalDetails: {
            fullName: string
            age: number | null
        }
        diagnosis: string
    }
    itemName: string[]
    itemQuantity: number[]
    itemPrices: number[]
    amount: number
    paymentStatus: string
    medicalRecordDate: string
    createdAt: string
    updatedAt: string
}

export interface InventorySummary {
    totalItems: number
    totalValue: number
    lowStockItems: number
    expiringItems: number
    outOfStockItems: number
    totalStock: number
    totalUsed: number
    vaccines: number
    medicalSupplies: number
}

export interface SalesSummary {
    totalSales: number
    totalTransactions: number
    paidAmount: number
    unpaidAmount: number
    pendingAmount: number
}

export interface DashboardReport {
    inventory: {
        summary: {
            total: number
            today: number
            week: number
            month: number
            year: number
        }
        statistics: {
            totalItems: number
            totalStock: number
            totalUsed: number
            totalValue: number
            vaccines: number
            medicalSupplies: number
            lowStockItems: number
            expiringSoon: number
        }
    }
    sales: {
        total: {
            count: number
            revenue: number
        }
        today: {
            count: number
            revenue: number
        }
        week: {
            count: number
            revenue: number
        }
        month: {
            count: number
            revenue: number
        }
        year: {
            count: number
            revenue: number
        }
        statistics: {
            totalSales: number
            totalRevenue: number
            paid: {
                count: number
                amount: number
            }
            unpaid: {
                count: number
                amount: number
            }
            pending: {
                count: number
                amount: number
            }
        }
    }
    generatedAt: string
}

export interface ReportParams {
    period?: 'today' | 'week' | 'month' | 'year'
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
    category?: string
    search?: string
    paymentStatus?: string
}
