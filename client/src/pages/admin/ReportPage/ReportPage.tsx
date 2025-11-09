import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ReportPage.module.css'
import { useReportStore } from '../../../stores/reportStore'
import { Header, Loading, Main, Pagination, Searchbar, Tab, Table } from '../../../components'
import { formatDate, formatCurrency, getStatusClass } from '../../../utils'
import { InventoryItem, SalesReportItem, TableColumn } from '../../../types'
import { Package, DollarSign, ShoppingCart, AlertTriangle, Calendar } from 'lucide-react'

const ReportPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const {
        inventoryReportItems,
        inventorySummary,
        salesReportItems,
        salesSummary,
        dashboardReport,
        loading,
        error,
        activeTab,
        period,
        fromDate,
        toDate,
        category,
        paymentStatus,
        searchTerm,
        inventoryPagination,
        salesPagination,
        fetchInventoryReport,
        fetchSalesReport,
        fetchDashboardReport,
        setActiveTab,
        setPeriod,
        setDateRange,
        setCategory,
        setPaymentStatus,
        setSearchTerm,
        resetFilters
    } = useReportStore()

    useEffect(() => {
        if (isInitialLoad) {
            const tab = searchParams.get('tab') || 'dashboard'
            if (tab === 'dashboard') {
                fetchDashboardReport()
            } else if (tab === 'inventory') {
                fetchInventoryReport({ page: 1 })
            } else if (tab === 'sales') {
                fetchSalesReport({ page: 1 })
            }
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, searchParams, fetchDashboardReport, fetchInventoryReport, fetchSalesReport])

    useEffect(() => {
        const tab = searchParams.get('tab') || 'dashboard'
        const validTabs = ['dashboard', 'inventory', 'sales'] as const

        if (validTabs.includes(tab as typeof validTabs[number]) && tab !== activeTab) {
            setActiveTab(tab as 'dashboard' | 'inventory' | 'sales')
        }
    }, [searchParams, activeTab, setActiveTab])

    const handleTabChange = (tab: string) => {
        if (tab === 'dashboard') {
            navigate('/admin/reports')
        } else {
            navigate(`/admin/reports?tab=${tab}`)
        }
    }

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        if (activeTab === 'inventory') {
            fetchInventoryReport({ page: 1 })
        } else if (activeTab === 'sales') {
            fetchSalesReport({ page: 1 })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport, setSearchTerm])

    const handlePageChange = useCallback((page: number) => {
        if (activeTab === 'inventory') {
            fetchInventoryReport({ page, limit: inventoryPagination.itemsPerPage })
        } else if (activeTab === 'sales') {
            fetchSalesReport({ page, limit: salesPagination.itemsPerPage })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport, inventoryPagination, salesPagination])

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        if (activeTab === 'inventory') {
            fetchInventoryReport({ page: 1, limit: itemsPerPage })
        } else if (activeTab === 'sales') {
            fetchSalesReport({ page: 1, limit: itemsPerPage })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport])

    const handleDateRangeSubmit = () => {
        if (fromDate && toDate) {
            setDateRange(fromDate, toDate)
            setShowDatePicker(false)
        }
    }

    const tabs = [
        { key: 'dashboard', label: 'Dashboard Report', count: null },
        { key: 'inventory', label: 'Inventory Report', count: inventoryPagination.totalItems },
        { key: 'sales', label: 'Sales Report', count: salesPagination.totalItems }
    ]

    const inventoryColumns: TableColumn<InventoryItem>[] = [
        {
            key: 'itemName',
            header: 'ITEM NAME',
            render: (item) => (
                <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.itemName}</div>
                    <div className={styles.itemCategory}>{item.category}</div>
                </div>
            )
        },
        {
            key: 'quantityInStock',
            header: 'IN STOCK',
            render: (item) => (
                <span className={item.quantityInStock < 10 ? styles.lowStock : ''}>
                    {item.quantityInStock}
                </span>
            )
        },
        {
            key: 'quantityUsed',
            header: 'USED',
            render: (item) => item.quantityUsed
        },
        {
            key: 'price',
            header: 'PRICE',
            render: (item) => formatCurrency(item.price)
        },
        {
            key: 'totalValue',
            header: 'TOTAL VALUE',
            render: (item) => formatCurrency(item.quantityInStock * item.price)
        },
        {
            key: 'expiryDate',
            header: 'EXPIRY DATE',
            render: (item) => formatDate(item.expiryDate)
        }
    ]

    const salesColumns: TableColumn<SalesReportItem>[] = [
        {
            key: 'patient',
            header: 'PATIENT',
            render: (sale) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientName}>{sale.patientName}</div>
                    <div className={styles.appointmentNumber}>
                        MR-{sale.medicalRecordId?.id?.slice(-8) || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            key: 'billingDate',
            header: 'DATE',
            render: (sale) => formatDate(sale.createdAt || sale.medicalRecordDate)
        },
        {
            key: 'items',
            header: 'ITEMS',
            render: (sale) => (
                <div className={styles.itemsList}>
                    {sale.itemName?.map((item: string, index: number) => (
                        <div key={index} className={styles.itemRow}>
                            {item} × {sale.itemQuantity?.[index] || 0}
                        </div>
                    ))}
                </div>
            )
        },
        {
            key: 'totalAmount',
            header: 'AMOUNT',
            render: (sale) => formatCurrency(sale.amount)
        },
        {
            key: 'paymentStatus',
            header: 'STATUS',
            render: (sale) => (
                <span className={`${styles.statusBadge} ${getStatusClass(sale.paymentStatus, styles)}`}>
                    {sale.paymentStatus}
                </span>
            )
        }
    ]

    const currentPagination = activeTab === 'inventory' ? inventoryPagination : salesPagination

  return (
    <Main error={error}>
        <Header title='Reports & Analytics' />

        <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
        />

        {
            activeTab === 'dashboard' && (
                <div className={styles.dashboardContainer}>
                    {
                        loading ? (
                            <Loading type='skeleton' rows={4} message='Loading dashboard...' />
                        ) : dashboardReport && dashboardReport.inventory && dashboardReport.sales ? (
                            <>
                                <div className={styles.overviewCards}>
                                    <div className={styles.card}>
                                        <div className={styles.cardIcon} style={{ backgroundColor: '#' }}>
                                            <Package size={24} color="#1976d2" />
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.cardLabel}>Total Inventory Items</div>
                                            <div className={styles.cardValue}>
                                                {dashboardReport.inventory?.summary?.total || 0}
                                            </div>
                                            <div className={styles.cardSubtext}>
                                                This Year: {dashboardReport.inventory?.summary?.year || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.card}>
                                        <div className={styles.cardIcon} style={{ backgroundColor: '#f3e5f5' }}>
                                            <ShoppingCart size={24} color="#7b1fa2" />
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.cardLabel}>Inventory Value</div>
                                            <div className={styles.cardValue}>
                                                {formatCurrency(dashboardReport.inventory?.statistics?.totalValue || 0)}
                                            </div>
                                            <div className={styles.cardSubtext}>
                                                In Stock: {dashboardReport.inventory?.statistics?.totalStock || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.card}>
                                        <div className={styles.cardIcon} style={{ backgroundColor: '#e8f5e9' }}>
                                            <DollarSign size={24} color="#388e3c" />
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.cardLabel}>Total Revenue</div>
                                            <div className={styles.cardValue}>
                                                {formatCurrency(dashboardReport.sales?.total?.revenue || 0)}
                                            </div>
                                            <div className={styles.cardSubtext}>
                                                Transactions: {dashboardReport.sales?.total?.count || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.card}>
                                        <div className={styles.cardIcon} style={{ backgroundColor: '#fff3e0' }}>
                                            <Calendar size={24} color="#f57c00" />
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.cardLabel}>This Year Sales</div>
                                            <div className={styles.cardValue}>
                                                {formatCurrency(dashboardReport.sales?.year?.revenue || 0)}
                                            </div>
                                            <div className={styles.cardSubtext}>
                                                Transactions: {dashboardReport.sales?.year?.count || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.alertsSection}>
                                    <h2 className={styles.sectionTitle}>Inventory Alerts</h2>
                                    <div className={styles.alertCards}>
                                        <div className={styles.alertCard}>
                                            <AlertTriangle size={20} color="#ff9800" />
                                            <div>
                                                <div className={styles.alertValue}>
                                                    {dashboardReport.inventory?.statistics?.lowStockItems || 0}
                                                </div>
                                                <div className={styles.alertLabel}>Low Stock Items</div>
                                            </div>
                                        </div>
                                        <div className={styles.alertCard}>
                                            <AlertTriangle size={20} color="#f44336" />
                                            <div>
                                                <div className={styles.alertValue}>
                                                    {dashboardReport.inventory?.statistics?.expiringSoon || 0}
                                                </div>
                                                <div className={styles.alertLabel}>Expiring Soon</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.statsSection}>
                                    <div className={styles.statsCard}>
                                        <h3 className={styles.statsTitle}>Sales Breakdown</h3>
                                        <div className={styles.statsGrid}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Paid</div>
                                                <div className={styles.statValue} style={{ color: 'var(--success)' }}>
                                                    {formatCurrency(dashboardReport.sales?.statistics?.paid?.amount || 0)}
                                                </div>
                                                <div className={styles.statCount}>
                                                    {dashboardReport.sales?.statistics?.paid?.count || 0} transactions
                                                </div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Unpaid</div>
                                                <div className={styles.statValue} style={{ color: 'var(--danger)' }}>
                                                    {formatCurrency(dashboardReport.sales?.statistics?.unpaid?.amount || 0)}
                                                </div>
                                                <div className={styles.statCount}>
                                                    {dashboardReport.sales?.statistics?.unpaid?.count || 0} transactions
                                                </div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Pending</div>
                                                <div className={styles.statValue} style={{ color: 'var(--warning)' }}>
                                                    {formatCurrency(dashboardReport.sales?.statistics?.pending?.amount || 0)}
                                                </div>
                                                <div className={styles.statCount}>
                                                    {dashboardReport.sales?.statistics?.pending?.count || 0} transactions
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.statsCard}>
                                        <h3 className={styles.statsTitle}>Inventory Categories</h3>
                                        <div className={styles.statsGrid}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Vaccines</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.inventory?.statistics?.vaccines || 0}
                                                </div>
                                                <div className={styles.statCount}>items</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Medical Supplies</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.inventory?.statistics?.medicalSupplies || 0}
                                                </div>
                                                <div className={styles.statCount}>items</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Total Used</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.inventory?.statistics?.totalUsed || 0}
                                                </div>
                                                <div className={styles.statCount}>units</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.noData}>No dashboard data available</div>
                        )
                    }
                </div>
            )
        }

        {
            activeTab === 'inventory' && (
                <div className={styles.reportSection}>
                    {
                        inventorySummary && (
                            <div className={styles.summaryCards}>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Total Items</div>
                                    <div className={styles.summaryValue}>{inventorySummary?.totalItems || 0}</div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Total Value</div>
                                    <div className={styles.summaryValue}>
                                        {formatCurrency(inventorySummary?.totalValue || 0)}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Low Stock</div>
                                    <div className={`${styles.summaryValue} ${styles.warning}`}>
                                        {inventorySummary?.lowStockItems || 0}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Expiring Soon</div>
                                    <div className={`${styles.summaryValue} ${styles.danger}`}>
                                        {inventorySummary?.expiringItems || 0}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <div className={styles.filtersSection}>
                        <div className={styles.periodFilters}>
                            <button type='submit'
                                className={`${styles.periodBtn} ${period === 'today' ? styles.active : ''}`}
                                onClick={() => setPeriod('today')}
                            >
                                Today
                            </button>
                            <button type='submit'
                                className={`${styles.periodBtn} ${period === 'week' ? styles.active : ''}`}
                                onClick={() => setPeriod('week')}
                            >
                                This Week
                            </button>
                            <button type='submit'
                                className={`${styles.periodBtn} ${period === 'month' ? styles.active : ''}`}
                                onClick={() => setPeriod('month')}
                            >
                                This Month
                            </button>
                            <button type='submit'
                                className={`${styles.periodBtn} ${period === 'year' ? styles.active : ''}`}
                                onClick={() => setPeriod('year')}
                            >
                                This Year
                            </button>
                            <button type='submit'
                                className={`${styles.periodBtn} ${period === 'custom' ? styles.active : ''}`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar size={16} /> Custom
                            </button>
                        </div>

                        <div className={styles.actionFilters}>
                            <select
                                title='Categories'
                                value={category || ''}
                                onChange={(e) => setCategory(e.target.value || null)}
                                className={styles.filterSelect}
                            >
                                <option value="">All Categories</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Vaccine">Vaccine</option>
                                <option value="Vitamin">Vitamin</option>
                                <option value="Supplement">Supplement</option>
                            </select>

                            <Searchbar
                                onSearch={handleSearch}
                                placeholder="Search items..."
                                disabled={loading}
                                className={styles.searchbar}
                            />

                            <button type='submit' className={styles.resetBtn} onClick={resetFilters}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {
                        showDatePicker && (
                            <div className={styles.datePickerCard}>
                                <div className={styles.dateInputs}>
                                    <input
                                        title='Date'
                                        type="date"
                                        value={fromDate || ''}
                                        onChange={(e) => setDateRange(e.target.value, toDate || '')}
                                        className={styles.dateInput}
                                    />
                                    <span>to</span>
                                    <input
                                        title='Date'
                                        type="date"
                                        value={toDate || ''}
                                        onChange={(e) => setDateRange(fromDate || '', e.target.value)}
                                        className={styles.dateInput}
                                    />
                                </div>
                                <button type='submit' className={styles.applyBtn} onClick={handleDateRangeSubmit}>
                                    Apply
                                </button>
                            </div>
                        )
                    }

                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <span className={styles.recordCount}>
                                {inventoryPagination.startIndex}-{inventoryPagination.endIndex} of{' '}
                                {inventoryPagination.totalItems}
                            </span>
                            <select
                                title='Item Per Page'
                                value={inventoryPagination.itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className={styles.itemsPerPageSelect}
                                disabled={loading}
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        {
                            loading ? (
                                <Loading type='skeleton' rows={7} message='Loading report...' />
                            ) : (
                                <>
                                    <Table
                                        columns={inventoryColumns}
                                        data={inventoryReportItems}
                                        emptyMessage='No inventory data found.'
                                        searchTerm={searchTerm}
                                        getRowKey={(item) => item.id}
                                    />

                                    {
                                        inventoryPagination.totalPages > 1 && (
                                            <Pagination
                                                currentPage={inventoryPagination.currentPage}
                                                totalPages={inventoryPagination.totalPages}
                                                totalItems={inventoryPagination.totalItems}
                                                itemsPerPage={inventoryPagination.itemsPerPage}
                                                onPageChange={handlePageChange}
                                                disabled={loading}
                                                className={styles.pagination}
                                            />
                                        )
                                    }
                                </>
                            )
                        }
                    </div>
                </div>
            )
        }

        {
            activeTab === 'sales' && (
                <div className={styles.reportSection}>
                    {
                        salesSummary && (
                            <div className={styles.summaryCards}>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Total Sales</div>
                                    <div className={styles.summaryValue}>
                                        {formatCurrency(salesSummary?.totalSales || 0)}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Transactions</div>
                                    <div className={styles.summaryValue}>{salesSummary?.totalTransactions || 0}</div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Paid</div>
                                    <div className={`${styles.summaryValue} ${styles.success}`}>
                                        {formatCurrency(salesSummary?.paidAmount || 0)}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Unpaid</div>
                                    <div className={`${styles.summaryValue} ${styles.danger}`}>
                                        {formatCurrency(salesSummary?.unpaidAmount || 0)}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <div className={styles.filtersSection}>
                        <div className={styles.periodFilters}>
                            <button
                                type='submit'
                                className={`${styles.periodBtn} ${period === 'today' ? styles.active : ''}`}
                                onClick={() => setPeriod('today')}
                            >
                                Today
                            </button>
                            <button
                                type='submit'
                                className={`${styles.periodBtn} ${period === 'week' ? styles.active : ''}`}
                                onClick={() => setPeriod('week')}
                            >
                                This Week
                            </button>
                            <button
                                type='submit'
                                className={`${styles.periodBtn} ${period === 'month' ? styles.active : ''}`}
                                onClick={() => setPeriod('month')}
                            >
                                This Month
                            </button>
                            <button
                                type='submit'
                                className={`${styles.periodBtn} ${period === 'year' ? styles.active : ''}`}
                                onClick={() => setPeriod('year')}
                            >
                                This Year
                            </button>
                            <button
                                type='submit'
                                className={`${styles.periodBtn} ${period === 'custom' ? styles.active : ''}`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar size={16} /> Custom
                            </button>
                        </div>

                        <div className={styles.actionFilters}>
                            <select
                                title='Status'
                                value={paymentStatus || ''}
                                onChange={(e) => setPaymentStatus(e.target.value || null)}
                                className={styles.filterSelect}
                            >
                                <option value="">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partially Paid">Partially Paid</option>
                            </select>

                            <Searchbar
                                onSearch={handleSearch}
                                placeholder="Search sales..."
                                disabled={loading}
                                className={styles.searchbar}
                            />

                            <button type='submit' className={styles.resetBtn} onClick={resetFilters}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {
                        showDatePicker && (
                            <div className={styles.datePickerCard}>
                                <div className={styles.dateInputs}>
                                    <input
                                        title='Date'
                                        type="date"
                                        value={fromDate || ''}
                                        onChange={(e) => setDateRange(e.target.value, toDate || '')}
                                        className={styles.dateInput}
                                    />
                                    <span>to</span>
                                    <input
                                        title='Date'
                                        type="date"
                                        value={toDate || ''}
                                        onChange={(e) => setDateRange(fromDate || '', e.target.value)}
                                        className={styles.dateInput}
                                    />
                                </div>
                                <button type='submit' className={styles.applyBtn} onClick={handleDateRangeSubmit}>
                                    Apply
                                </button>
                            </div>
                        )
                    }

                    <div className={styles.tableContainer}>
                        <div className={styles.tableHeader}>
                            <span className={styles.recordCount}>
                                {salesPagination.startIndex}-{salesPagination.endIndex} of{' '}
                                {salesPagination.totalItems}
                            </span>
                            <select
                                title='Item Per Page'
                                value={salesPagination.itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className={styles.itemsPerPageSelect}
                                disabled={loading}
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        {
                            loading ? (
                                <Loading type='skeleton' rows={7} message='Loading report...' />
                            ) : (
                                <>
                                    <Table
                                        columns={salesColumns}
                                        data={salesReportItems}
                                        emptyMessage='No sales data found.'
                                        searchTerm={searchTerm}
                                        getRowKey={(sale) => sale.id}
                                    />

                                    {
                                        salesPagination.totalPages > 1 && (
                                            <Pagination
                                                currentPage={salesPagination.currentPage}
                                                totalPages={salesPagination.totalPages}
                                                totalItems={salesPagination.totalItems}
                                                itemsPerPage={salesPagination.itemsPerPage}
                                                onPageChange={handlePageChange}
                                                disabled={loading}
                                                className={styles.pagination}
                                            />
                                        )
                                    }
                                </>
                            )
                        }
                    </div>
                </div>
            )
        }
    </Main>
  )
}

export default ReportPage