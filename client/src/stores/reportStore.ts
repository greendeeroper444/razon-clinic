import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getInventoryReport, getInventorySummary, getSalesReport, getSalesSummary, getDashboardReport, exportSalesReport, exportInventoryReport } from '../services/reportService'
import { DashboardReport, ReportParams, ReportState } from '../types'
import { toast } from 'sonner'


export const useReportStore = create<ReportState>()(
    devtools(
        (set, get) => ({
            inventoryReportItems: [],
            inventorySummary: null,
            salesReportItems: [],
            salesSummary: null,
            dashboardReport: null,
            loading: false,
            fetchLoading: false,
            error: null,
            activeTab: 'dashboard',
            period: 'month',
            fromDate: null,
            toDate: null,
            category: null,
            paymentStatus: null,
            searchTerm: '',
            inventoryPagination: {
               currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: 1,
                endIndex: 0,
                isUnlimited: false,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm: null
            },
            salesPagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: 1,
                endIndex: 0,
                isUnlimited: false,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm: null
            },

            fetchInventoryReport: async (params = {}) => {
                const currentState = get()
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...')
                    return
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null })

                    const queryParams: ReportParams = {
                        period: currentState.period !== 'custom' ? currentState.period : undefined,
                        fromDate: currentState.period === 'custom' ? currentState.fromDate || undefined : undefined,
                        toDate: currentState.period === 'custom' ? currentState.toDate || undefined : undefined,
                        category: currentState.category || undefined,
                        search: currentState.searchTerm || undefined,
                        ...params
                    }

                    const response = await getInventoryReport(queryParams)
                    
                    const items = response.data.inventoryItems || []
                    const pagination = response.data.pagination || {}
                    const statistics = response.data.statistics || {}

                    set({
                        inventoryReportItems: items,
                        loading: false,
                        fetchLoading: false,
                        inventoryPagination: {
                            currentPage: pagination.currentPage || 1,
                            totalPages: pagination.totalPages || 1,
                            totalItems: pagination.totalItems || 0,
                            itemsPerPage: pagination.itemsPerPage || 10,
                            hasNextPage: pagination.hasNextPage || false,
                            hasPreviousPage: pagination.hasPreviousPage || false,
                            startIndex: pagination.startIndex || 1,
                            endIndex: pagination.endIndex || 0,
                            isUnlimited: pagination.isUnlimited || false,
                            nextPage: pagination.nextPage,
                            previousPage: pagination.previousPage,
                            remainingItems: pagination.remainingItems || 0,
                            searchTerm: pagination.searchTerm || null
                        },
                        inventorySummary: {
                            totalItems: statistics.totalItems || 0,
                            totalValue: statistics.totalValue || 0,
                            lowStockItems: statistics.lowStockItems || 0,
                            expiringItems: statistics.expiringSoon || 0,
                            outOfStockItems: 0,
                            totalStock: statistics.totalStock || 0,
                            totalUsed: statistics.totalUsed || 0,
                            vaccines: statistics.vaccines || 0,
                            medicalSupplies: statistics.medicalSupplies || 0
                        }
                    })
                } catch (error) {
                    console.error('Error fetching inventory report:', error)
                    set({
                        error: 'An error occurred while fetching inventory report',
                        loading: false,
                        fetchLoading: false
                    })
                }
            },

            fetchInventorySummary: async () => {
                try {
                    const response = await getInventorySummary()
                    
                    const summary = response.data
                    
                    set({ 
                        inventorySummary: {
                            totalItems: summary.total || 0,
                            totalValue: 0,
                            lowStockItems: 0,
                            expiringItems: 0,
                            outOfStockItems: 0,
                            totalStock: 0,
                            totalUsed: 0,
                            vaccines: 0,
                            medicalSupplies: 0
                        }
                    })
                } catch (error) {
                    console.error('Error fetching inventory summary:', error)
                }
            },

            fetchSalesReport: async (params = {}) => {
                const currentState = get()
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...')
                    return
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null })

                    const queryParams: ReportParams = {
                        period: currentState.period !== 'custom' ? currentState.period : undefined,
                        fromDate: currentState.period === 'custom' ? currentState.fromDate || undefined : undefined,
                        toDate: currentState.period === 'custom' ? currentState.toDate || undefined : undefined,
                        paymentStatus: currentState.paymentStatus || undefined,
                        search: currentState.searchTerm || undefined,
                        ...params
                    }

                    const response = await getSalesReport(queryParams)
                    
                    const items = response.data.billings || []
                    const pagination = response.data.pagination || {}
                    const statistics = response.data.statistics || {}

                    console.log('Sales Report Response:', response.data)
                    console.log('Sales Items:', items)

                    set({
                        salesReportItems: items,
                        loading: false,
                        fetchLoading: false,
                        salesPagination: {
                            currentPage: pagination.currentPage || 1,
                            totalPages: pagination.totalPages || 1,
                            totalItems: pagination.totalItems || 0,
                            itemsPerPage: pagination.itemsPerPage || 10,
                            hasNextPage: pagination.hasNextPage || false,
                            hasPreviousPage: pagination.hasPreviousPage || false,
                            startIndex: pagination.startIndex || 1,
                            endIndex: pagination.endIndex || 0,
                            isUnlimited: pagination.isUnlimited || false,
                            nextPage: pagination.nextPage,
                            previousPage: pagination.previousPage,
                            remainingItems: pagination.remainingItems || 0,
                            searchTerm: pagination.searchTerm || null
                        },
                        salesSummary: {
                            totalSales: statistics.totalRevenue || 0,
                            totalTransactions: statistics.totalSales || 0,
                            paidAmount: statistics.paid?.amount || 0,
                            unpaidAmount: statistics.unpaid?.amount || 0,
                            pendingAmount: statistics.pending?.amount || 0
                        }
                    })
                } catch (error) {
                    console.error('Error fetching sales report:', error)
                    set({
                        error: 'An error occurred while fetching sales report',
                        loading: false,
                        fetchLoading: false
                    })
                }
            },

            fetchSalesSummary: async () => {
                try {
                    const response = await getSalesSummary()
                    
                    const summary = response.data
                    
                    set({ 
                        salesSummary: {
                            totalSales: summary.total?.revenue || 0,
                            totalTransactions: summary.total?.count || 0,
                            paidAmount: 0,
                            unpaidAmount: 0,
                            pendingAmount: 0
                        }
                    })
                } catch (error) {
                    console.error('Error fetching sales summary:', error)
                }
            },

            fetchDashboardReport: async () => {
                try {
                    set({ fetchLoading: true, loading: true, error: null })
                    
                    const response = await getDashboardReport()
                    
                    console.log('Dashboard Response:', response.data)
                    
                    const dashboardData = response.data
                    
                    //map the backend response to match frontend structure
                    const mappedDashboard: DashboardReport = {
                        inventory: {
                            summary: dashboardData.inventory?.summary || {
                                total: 0,
                                today: 0,
                                week: 0,
                                month: 0,
                                year: 0
                            },
                            statistics: dashboardData.inventory?.statistics || {
                                totalItems: 0,
                                totalStock: 0,
                                totalUsed: 0,
                                totalValue: 0,
                                vaccines: 0,
                                medicalSupplies: 0,
                                lowStockItems: 0,
                                expiringSoon: 0
                            }
                        },
                        sales: {
                            total: dashboardData.sales?.total || { count: 0, revenue: 0 },
                            today: dashboardData.sales?.today || { count: 0, revenue: 0 },
                            week: dashboardData.sales?.week || { count: 0, revenue: 0 },
                            month: dashboardData.sales?.month || { count: 0, revenue: 0 },
                            year: dashboardData.sales?.year || { count: 0, revenue: 0 },
                            statistics: dashboardData.sales?.statistics || {
                                totalSales: 0,
                                totalRevenue: 0,
                                paid: { count: 0, amount: 0 },
                                unpaid: { count: 0, amount: 0 },
                                pending: { count: 0, amount: 0 }
                            }
                        },
                        generatedAt: dashboardData.generatedAt || new Date().toISOString()
                    }
                    
                    set({
                        dashboardReport: mappedDashboard,
                        loading: false,
                        fetchLoading: false
                    })
                } catch (error) {
                    console.error('Error fetching dashboard report:', error)
                    set({
                        error: 'An error occurred while fetching dashboard report',
                        loading: false,
                        fetchLoading: false
                    })
                }
            },


            // ==================== EXPORT FUNCTIONS ====================
            exportInventoryReport: async () => {
                const currentState = get()
                
                try {
                    set({ loading: true })
                    
                    const exportParams: ReportParams = {
                        period: currentState.period !== 'custom' ? currentState.period : undefined,
                        fromDate: currentState.period === 'custom' ? currentState.fromDate || undefined : undefined,
                        toDate: currentState.period === 'custom' ? currentState.toDate || undefined : undefined,
                        category: currentState.category || undefined,
                        search: currentState.searchTerm || undefined
                    }

                    const result = await exportInventoryReport(exportParams)
                    
                    if (result.success) {
                        toast.success('Export completed successfully!', {
                            description: `Downloaded: ${result.filename}`
                        })
                    }
                } catch (error) {
                    console.error('Error exporting inventory report:', error)
                    toast.error('Failed to export inventory report', {
                        description: error instanceof Error ? error.message : 'An error occurred'
                    })
                } finally {
                    set({ loading: false })
                }
            },

            exportSalesReport: async () => {
                const currentState = get()
                
                try {
                    set({ loading: true })
                    
                    const exportParams: ReportParams = {
                        period: currentState.period !== 'custom' ? currentState.period : undefined,
                        fromDate: currentState.period === 'custom' ? currentState.fromDate || undefined : undefined,
                        toDate: currentState.period === 'custom' ? currentState.toDate || undefined : undefined,
                        paymentStatus: currentState.paymentStatus || undefined,
                        search: currentState.searchTerm || undefined
                    }

                    const result = await exportSalesReport(exportParams)
                    
                    if (result.success) {
                        toast.success('Export completed successfully!', {
                            description: `Downloaded: ${result.filename}`
                        })
                    }
                } catch (error) {
                    console.error('Error exporting sales report:', error)
                    toast.error('Failed to export sales report', {
                        description: error instanceof Error ? error.message : 'An error occurred'
                    })
                } finally {
                    set({ loading: false })
                }
            },

            setActiveTab: (tab) => {
                set({ activeTab: tab })
                
                if (tab === 'inventory') {
                    get().fetchInventoryReport({ page: 1 })
                } else if (tab === 'sales') {
                    get().fetchSalesReport({ page: 1 })
                } else if (tab === 'dashboard') {
                    get().fetchDashboardReport()
                }
            },

            setPeriod: (period) => {
                set({ period })
                
                const { activeTab } = get()
                if (activeTab === 'inventory') {
                    get().fetchInventoryReport({ page: 1 })
                } else if (activeTab === 'sales') {
                    get().fetchSalesReport({ page: 1 })
                }
            },

            setDateRange: (fromDate, toDate) => {
                set({ fromDate, toDate, period: 'custom' })
                
                const { activeTab } = get()
                if (activeTab === 'inventory') {
                    get().fetchInventoryReport({ page: 1 })
                } else if (activeTab === 'sales') {
                    get().fetchSalesReport({ page: 1 })
                }
            },

            setCategory: (category) => {
                set({ category })
                get().fetchInventoryReport({ page: 1 })
            },

            setPaymentStatus: (status) => {
                set({ paymentStatus: status })
                get().fetchSalesReport({ page: 1 })
            },

            setSearchTerm: (term) => {
                set({ searchTerm: term })
            },

            resetFilters: () => {
                set({
                    period: 'month',
                    fromDate: null,
                    toDate: null,
                    category: null,
                    paymentStatus: null,
                    searchTerm: ''
                })
                
                const { activeTab } = get()
                if (activeTab === 'inventory') {
                    get().fetchInventoryReport({ page: 1 })
                } else if (activeTab === 'sales') {
                    get().fetchSalesReport({ page: 1 })
                }
            }
        }),
        {
            name: 'report-store'
        }
    )
)