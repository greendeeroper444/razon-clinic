import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './PatientManagementPage.module.css'
import { usePatientStore } from '../../../stores'
import { Header, Loading, Main, Pagination, Searchbar, SubmitLoading, Tab, Table } from '../../../components'
import { formatDate, getFirstLetterOfFirstAndLastName, getLoadingText, getStatusClass } from '../../../utils'
import { getPatientSummaryCards } from '../../../config/patientSummaryCards'
import { TableColumn, Patient } from '../../../types'

const PatientManagementPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    
    const {
        patients,
        loading,
        submitLoading,
        error,
        pagination: storePagination,
        selectedPatientIds,
        currentPage,
        activeTab,
        fetchPatients,
        summaryStats,
        isProcessing,
        currentOperation,
        setActiveTab,
        togglePatientSelection,
        toggleSelectAll,
        archiveSelectedPatients,
        unarchiveSelectedPatients,
        getStats
    } = usePatientStore();

    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchPatients({ page, limit, search })
        } catch (error) {
            console.error('Error fetching patients:', error)
        }
    }, [fetchPatients])

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '')
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, fetchData])

    //sync url tab with store
    useEffect(() => {
        const tab = searchParams.get('tab') || 'active'
        const validTabs = ['all', 'active', 'archive'] as const
        
        if (validTabs.includes(tab as typeof validTabs[number]) && tab !== activeTab) {
            setActiveTab(tab as 'all' | 'active' | 'archive')
        }
    }, [searchParams, activeTab, setActiveTab])

    useEffect(() => {
        if (!isInitialLoad) {
            fetchData(currentPage, storePagination?.itemsPerPage || 10, searchTerm)
        }
    }, [activeTab, currentPage, isInitialLoad, fetchData, storePagination?.itemsPerPage, searchTerm])

    const handleTabChange = (tab: string) => {
        if (tab === 'all') {
            navigate('/admin/patient-management')
        } else {
            navigate(`/admin/patient-management?tab=${tab}`)
        }
    }

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        fetchData(1, storePagination?.itemsPerPage || 10, term)
    }, [fetchData, storePagination?.itemsPerPage])

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm)
    }, [fetchData, storePagination?.itemsPerPage, searchTerm])

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm)
    }, [fetchData, searchTerm])

    //stats declaration before tabs
    const stats = getStats()

    const tabs = [
        // { key: 'all', label: 'All Patients', count: stats.totalPatients },
        { key: 'active', label: 'Active Patients', count: stats.activePatients },
        { key: 'archive', label: 'Archived', count: stats.archivedPatients }
    ]

    const summaryCards = getPatientSummaryCards(summaryStats);

    const patientColumns: TableColumn<Patient>[] = [
        {
            key: 'checkbox',
            header: '',
            className: styles.thCheckbox,
            render: (patient) => (
                <input
                    type="checkbox"
                    title='Checkbox'
                    checked={selectedPatientIds.includes(patient.id)}
                    onChange={() => togglePatientSelection(patient.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        {
            key: 'patient',
            header: 'PATIENT',
            className: styles.thPatient,
            render: (patient) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                        {
                            (() => {
                                const firstName = patient.firstName
                                const lastName = patient.lastName
                                return firstName && lastName
                                    ? getFirstLetterOfFirstAndLastName(`${firstName} ${lastName}`)
                                    : 'N/A'
                            })()
                        }
                    </div>
                    <div>
                        <div className={styles.patientName}>
                            {patient.firstName} {patient.lastName}
                        </div>

                        <div className={styles.patientId}>
                            PTN-ID: {patient.patientNumber || 'N/A'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'patientNumber',
            header: 'PATIENT NUMBER',
            className: styles.thDate,
            render: (patient) => patient.patientNumber || 'N/A'
        },
        {
            key: 'lastActive',
            header: 'LAST ACTIVE',
            className: styles.thDate,
            render: (patient) => (
                <>
                    {formatDate(patient.lastActiveAt)}
                </>
            )
        },
        {
            key: 'status',
            header: 'STATUS',
            className: styles.thStatus,
            render: (patient) => (
                <span className={`${styles.statusBadge} ${getStatusClass(patient.isArchived ? 'Archived' : 'Active', styles)}`}>
                    {patient.isArchived ? 'Archived' : 'Active'}
                </span>

            )
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='Patient Management'
        />

        <div className={styles.contentCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <card.icon /> 
                            </div>
                        </div>
                        <div className={styles.cardValue}>{card.value}</div>
                        <div className={styles.cardFooter}>
                            <span>{card.footer}</span>
                        </div>
                    </div>
                ))
            }
        </div>

        <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
        />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Patient Management</h1>

                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search patients..."
                        disabled={loading}
                        className={styles.searchbar}
                    />
                    
                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.bulkActionsBar}>
                    <label className={styles.selectAllLabel}>
                        <input
                            type="checkbox"
                            checked={selectedPatientIds.length === patients.length && patients.length > 0}
                            onChange={toggleSelectAll}
                            className={styles.selectAllCheckbox}
                        />
                        <span className={styles.selectedCount}>{selectedPatientIds.length} selected</span>
                    </label>
                    <span className={styles.recordCount}>
                        {storePagination ? `${storePagination.startIndex}-${storePagination.endIndex} of ${storePagination.totalItems}` : '0 records'}
                    </span>
                </div>

                {
                    loading ? (
                        <div className={styles.tableResponsive}>
                            <Loading
                                type='skeleton'
                                rows={7}
                                message='Loading patient data...'
                                delay={0}
                                minDuration={1000}
                            />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={patientColumns}
                                data={patients}
                                emptyMessage='No patients found.'
                                searchTerm={searchTerm}
                                getRowKey={(patient) => patient.id}
                                onRowClick={(patient) => togglePatientSelection(patient.id)}
                            />

                            {
                                storePagination && storePagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={storePagination.currentPage}
                                        totalPages={storePagination.totalPages}
                                        totalItems={storePagination.totalItems}
                                        itemsPerPage={storePagination.itemsPerPage}
                                        onPageChange={handlePageChange}
                                        disabled={loading || isProcessing}
                                        className={styles.pagination}
                                    />
                                )
                            }
                        </>
                    )
                }
            </div>
            
            <div className={styles.archiveActions}>
                {
                    activeTab === 'archive' && (
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.restoreButton} ${selectedPatientIds.length === 0 ? styles.disabled : ''}`}
                            disabled={selectedPatientIds.length === 0}
                            onClick={unarchiveSelectedPatients}
                        >
                            Restore Selected ({selectedPatientIds.length})
                        </button>
                    )
                }
                {
                    activeTab === 'active' && (
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.archiveButton} ${selectedPatientIds.length === 0 ? styles.disabled : ''}`}
                            disabled={selectedPatientIds.length === 0}
                            onClick={archiveSelectedPatients}
                        >
                            Archive Selected ({selectedPatientIds.length})
                        </button>
                    )
                }
                {
                    activeTab === 'all' && selectedPatientIds.length > 0 && (
                        <div className={styles.multiActions}>
                            <button 
                                type='button' 
                                className={`${styles.actionButton} ${styles.archiveButton}`}
                                onClick={archiveSelectedPatients}
                            >
                                Archive Selected ({selectedPatientIds.length})
                            </button>
                            <button 
                                type='button' 
                                className={`${styles.actionButton} ${styles.restoreButton}`}
                                onClick={unarchiveSelectedPatients}
                            >
                                Restore Selected ({selectedPatientIds.length})
                            </button>
                        </div>
                    )
                }
            </div>
        </div>

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'patient')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default PatientManagementPage