import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ReportPage.module.css'
import { useReportStore } from '../../../stores'
import { Header, LineChart, Loading, Main, Pagination, Searchbar, Tab, Table } from '../../../components'
import { formatDate, formatCurrency, getStatusClass } from '../../../utils'
import { InventoryItem, SalesReportItem, TableColumn } from '../../../types'
import { Package, DollarSign, ShoppingCart, AlertTriangle, Calendar, FileText, Users, UserCheck } from 'lucide-react'

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
        medicalRecordsReportItems,
        medicalRecordsSummary,
        dashboardReport,
        inventoryChartData,
        salesChartData,
        medicalRecordsChartData,
        loading,
        error,
        activeTab,
        period,
        fromDate,
        toDate,
        category,
        paymentStatus,
        gender,
        searchTerm,
        inventoryPagination,
        salesPagination,
        medicalRecordsPagination,
        fetchInventoryReport,
        fetchSalesReport,
        fetchMedicalRecordsReport,
        fetchDashboardReport,
        exportInventoryReport, 
        exportSalesReport,
        exportMedicalRecordsReport,
        setActiveTab,
        setPeriod,
        setDateRange,
        setCategory,
        setPaymentStatus,
        setGender,
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
            } else if (tab === 'medicalRecords') {
                fetchMedicalRecordsReport({ page: 1 })
            }
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, searchParams, fetchDashboardReport, fetchInventoryReport, fetchSalesReport, fetchMedicalRecordsReport])

    useEffect(() => {
        const tab = searchParams.get('tab') || 'dashboard'
        const validTabs = ['dashboard', 'inventory', 'sales', 'medicalRecords'] as const

        if (validTabs.includes(tab as typeof validTabs[number]) && tab !== activeTab) {
            setActiveTab(tab as 'dashboard' | 'inventory' | 'sales' | 'medicalRecords')
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
        } else if (activeTab === 'medicalRecords') {
            fetchMedicalRecordsReport({ page: 1 })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport, fetchMedicalRecordsReport, setSearchTerm])

    const handlePageChange = useCallback((page: number) => {
        if (activeTab === 'inventory') {
            fetchInventoryReport({ page, limit: inventoryPagination.itemsPerPage })
        } else if (activeTab === 'sales') {
            fetchSalesReport({ page, limit: salesPagination.itemsPerPage })
        } else if (activeTab === 'medicalRecords') {
            fetchMedicalRecordsReport({ page, limit: medicalRecordsPagination.itemsPerPage })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport, fetchMedicalRecordsReport, inventoryPagination, salesPagination, medicalRecordsPagination])

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        if (activeTab === 'inventory') {
            fetchInventoryReport({ page: 1, limit: itemsPerPage })
        } else if (activeTab === 'sales') {
            fetchSalesReport({ page: 1, limit: itemsPerPage })
        } else if (activeTab === 'medicalRecords') {
            fetchMedicalRecordsReport({ page: 1, limit: itemsPerPage })
        }
    }, [activeTab, fetchInventoryReport, fetchSalesReport, fetchMedicalRecordsReport])

    const handleDateRangeSubmit = () => {
        if (fromDate && toDate) {
            setDateRange(fromDate, toDate)
            setShowDatePicker(false)
        }
    }

    const handleExport = async (reportType: 'inventory' | 'sales' | 'medicalRecords') => {
        try {
            if (reportType === 'inventory') {
                await exportInventoryReport();
            } else if (reportType === 'sales') {
                await exportSalesReport();
            } else if (reportType === 'medicalRecords') {
                await exportMedicalRecordsReport();
            }
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const tabs = [
        { key: 'dashboard', label: 'Dashboard Report', count: null },
        { key: 'inventory', label: 'Inventory Report', count: inventoryPagination.totalItems },
        { key: 'sales', label: 'Sales Report', count: salesPagination.totalItems },
        { key: 'medicalRecords', label: 'Medical Records Report', count: medicalRecordsPagination.totalItems }
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

    const medicalRecordsColumns: TableColumn<any>[] = [
        {
            key: 'patient',
            header: 'PATIENT',
            render: (record) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientName}>{record.personalDetails?.fullName || 'N/A'}</div>
                    <div className={styles.medicalRecordNumber}>
                        MR-{record.medicalRecordNumber || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            key: 'demographics',
            header: 'DEMOGRAPHICS',
            render: (record) => (
                <div className={styles.demographics}>
                    <div>{record.personalDetails?.age || 'N/A'} years • {record.personalDetails?.gender || 'N/A'}</div>
                    <div className={styles.bloodType}>{record.personalDetails?.bloodType || 'N/A'}</div>
                </div>
            )
        },
        {
            key: 'chiefComplaint',
            header: 'CHIEF COMPLAINT',
            render: (record) => record.currentSymptoms?.chiefComplaint || 'N/A'
        },
        {
            key: 'diagnosis',
            header: 'DIAGNOSIS',
            render: (record) => record.diagnosis || 'N/A'
        },
        {
            key: 'followUp',
            header: 'FOLLOW-UP',
            render: (record) => {
                if (!record.followUpDate) return <span className={styles.noFollowUp}>None</span>
                
                const followUpDate = new Date(record.followUpDate)
                const today = new Date()
                
                if (followUpDate < today) {
                    return <span className={`${styles.statusBadge} ${styles.overdue}`}>Overdue</span>
                } else {
                    const daysUntil = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    if (daysUntil <= 7) {
                        return <span className={`${styles.statusBadge} ${styles.warning}`}>Due Soon</span>
                    }
                    return <span className={`${styles.statusBadge} ${styles.success}`}>Scheduled</span>
                }
            }
        },
        {
            key: 'dateRecorded',
            header: 'DATE RECORDED',
            render: (record) => formatDate(record.dateRecorded)
        }
    ]

    const currentPagination = activeTab === 'inventory' ? inventoryPagination : 
                             activeTab === 'sales' ? salesPagination : 
                             medicalRecordsPagination

  return (
    <Main error={error}>
        <Header title='Reports & Analytics' />

        <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
        />

        {/* DASHBOARD TAB */}
        {
            activeTab === 'dashboard' && (
                <div className={styles.dashboardContainer}>
                    {
                        loading ? (
                            <Loading type='skeleton' rows={4} message='Loading dashboard...' />
                        ) : dashboardReport && dashboardReport.inventory && dashboardReport.sales && dashboardReport.medicalRecords ? (
                            <>
                                <div className={styles.overviewCards}>
                                    <div className={styles.card}>
                                        <div className={styles.cardIcon} style={{ backgroundColor: '#e3f2fd' }}>
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
                                            <FileText size={24} color="#f57c00" />
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.cardLabel}>Medical Records</div>
                                            <div className={styles.cardValue}>
                                                {dashboardReport.medicalRecords?.summary?.total || 0}
                                            </div>
                                            <div className={styles.cardSubtext}>
                                                This Year: {dashboardReport.medicalRecords?.summary?.year || 0}
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
                                        <div className={styles.alertCard}>
                                            <UserCheck size={20} color="#4caf50" />
                                            <div>
                                                <div className={styles.alertValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.followUps?.upcoming || 0}
                                                </div>
                                                <div className={styles.alertLabel}>Upcoming Follow-ups</div>
                                            </div>
                                        </div>
                                        <div className={styles.alertCard}>
                                            <AlertTriangle size={20} color="#f44336" />
                                            <div>
                                                <div className={styles.alertValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.followUps?.overdue || 0}
                                                </div>
                                                <div className={styles.alertLabel}>Overdue Follow-ups</div>
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
                                        <h3 className={styles.statsTitle}>Patient Demographics</h3>
                                        <div className={styles.statsGrid}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Male Patients</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.genderDistribution?.male || 0}
                                                </div>
                                                <div className={styles.statCount}>records</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Female Patients</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.genderDistribution?.female || 0}
                                                </div>
                                                <div className={styles.statCount}>records</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Other</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.genderDistribution?.other || 0}
                                                </div>
                                                <div className={styles.statCount}>records</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.statsCard}>
                                        <h3 className={styles.statsTitle}>Age Distribution</h3>
                                        <div className={styles.statsGrid}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Pediatric (&lt;18)</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.ageDistribution?.pediatric || 0}
                                                </div>
                                                <div className={styles.statCount}>patients</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Adult (18-64)</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.ageDistribution?.adult || 0}
                                                </div>
                                                <div className={styles.statCount}>patients</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Senior (65+)</div>
                                                <div className={styles.statValue}>
                                                    {dashboardReport.medicalRecords?.statistics?.ageDistribution?.senior || 0}
                                                </div>
                                                <div className={styles.statCount}>patients</div>
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

        {/* INVENTORY TAB */}
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

                    {/* INVENTORY LINE CHART */}
                    {
                        inventoryChartData && (
                            <div className={styles.chartSection}>
                                <LineChart
                                    labels={inventoryChartData.labels}
                                    datasets={inventoryChartData.datasets}
                                    title="Inventory Trends"
                                    height={350}
                                />
                            </div>
                        )
                    }

                    <div className={styles.filtersSection}>
                        <div className={styles.filterContent}>
                            <div className={styles.periodFilters}>
                                <button 
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'today' ? styles.active : ''}`}
                                    onClick={() => setPeriod('today')}
                                >
                                    Today
                                </button>
                                <button 
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'week' ? styles.active : ''}`}
                                    onClick={() => setPeriod('week')}
                                >
                                    This Week
                                </button>
                                <button 
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'month' ? styles.active : ''}`}
                                    onClick={() => setPeriod('month')}
                                >
                                    This Month
                                </button>
                                <button 
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'year' ? styles.active : ''}`}
                                    onClick={() => setPeriod('year')}
                                >
                                    This Year
                                </button>
                                <button 
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'custom' ? styles.active : ''}`}
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <Calendar size={16} /> Custom
                                </button>
                            </div>
                            
                            <div className={styles.exportBtnContainer}>
                                <button
                                    type='button'
                                    className={styles.exportBtn}
                                    onClick={() => handleExport('inventory')}
                                >
                                    Export Inventory Report
                                </button>
                            </div>
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

        {/* SALES TAB */}
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

                    {/* SALES LINE CHART */}
                    {
                        salesChartData && (
                            <div className={styles.chartSection}>
                                <LineChart
                                    labels={salesChartData.labels}
                                    datasets={salesChartData.datasets}
                                    title="Sales & Revenue Trends"
                                    height={350}
                                />
                            </div>
                        )
                    }

                    <div className={styles.filtersSection}>
                        <div className={styles.filterContent}>
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
                            <div>
                                <button
                                    type='button'
                                    className={styles.exportBtn}
                                    onClick={() => handleExport('sales')}
                                >
                                    Export Sales Report
                                </button>
                            </div>
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

        {/* MEDICAL RECORDS TAB */}
        {
            activeTab === 'medicalRecords' && (
                <div className={styles.reportSection}>
                    {
                        medicalRecordsSummary && (
                            <div className={styles.summaryCards}>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Total Records</div>
                                    <div className={styles.summaryValue}>
                                        {medicalRecordsSummary?.totalRecords || 0}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Pediatric (&lt;18)</div>
                                    <div className={styles.summaryValue}>
                                        {medicalRecordsSummary?.ageDistribution?.pediatric || 0}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Upcoming Follow-ups</div>
                                    <div className={`${styles.summaryValue} ${styles.success}`}>
                                        {medicalRecordsSummary?.followUps?.upcoming || 0}
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryLabel}>Overdue Follow-ups</div>
                                    <div className={`${styles.summaryValue} ${styles.danger}`}>
                                        {medicalRecordsSummary?.followUps?.overdue || 0}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* MEDICAL RECORDS LINE CHART */}
                    {
                        medicalRecordsChartData && (
                            <div className={styles.chartSection}>
                                <LineChart
                                    labels={medicalRecordsChartData.labels}
                                    datasets={medicalRecordsChartData.datasets}
                                    title="Patient Records Trends"
                                    height={350}
                                />
                            </div>
                        )
                    }

                    <div className={styles.filtersSection}>
                        <div className={styles.filterContent}>
                            <div className={styles.periodFilters}>
                                <button
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'today' ? styles.active : ''}`}
                                    onClick={() => setPeriod('today')}
                                >
                                    Today
                                </button>
                                <button
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'week' ? styles.active : ''}`}
                                    onClick={() => setPeriod('week')}
                                >
                                    This Week
                                </button>
                                <button
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'month' ? styles.active : ''}`}
                                    onClick={() => setPeriod('month')}
                                >
                                    This Month
                                </button>
                                <button
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'year' ? styles.active : ''}`}
                                    onClick={() => setPeriod('year')}
                                >
                                    This Year
                                </button>
                                <button
                                    type='button'
                                    className={`${styles.periodBtn} ${period === 'custom' ? styles.active : ''}`}
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <Calendar size={16} /> Custom
                                </button>
                            </div>
                            
                            <div className={styles.exportBtnContainer}>
                                <button
                                    type='button'
                                    className={styles.exportBtn}
                                    onClick={() => handleExport('medicalRecords')}
                                >
                                    Export Medical Records Report
                                </button>
                            </div>
                        </div>

                        <div className={styles.actionFilters}>
                            <select
                                title='Gender'
                                value={gender || ''}
                                onChange={(e) => setGender(e.target.value || null)}
                                className={styles.filterSelect}
                            >
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>

                            <Searchbar
                                onSearch={handleSearch}
                                placeholder="Search patients, diagnosis..."
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
                                {medicalRecordsPagination.startIndex}-{medicalRecordsPagination.endIndex} of{' '}
                                {medicalRecordsPagination.totalItems}
                            </span>
                            <select
                                title='Item Per Page'
                                value={medicalRecordsPagination.itemsPerPage}
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
                                        columns={medicalRecordsColumns}
                                        data={medicalRecordsReportItems}
                                        emptyMessage='No medical records found.'
                                        searchTerm={searchTerm}
                                        getRowKey={(record) => record.id}
                                    />

                                    {
                                        medicalRecordsPagination.totalPages > 1 && (
                                            <Pagination
                                                currentPage={medicalRecordsPagination.currentPage}
                                                totalPages={medicalRecordsPagination.totalPages}
                                                totalItems={medicalRecordsPagination.totalItems}
                                                itemsPerPage={medicalRecordsPagination.itemsPerPage}
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