import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TrashPage.module.css'
import { useTrashStore } from '../../../stores'
import { Header, Loading, Main, Pagination, SubmitLoading, Tab, Table } from '../../../components'
import { formatDate, getLoadingText } from '../../../utils'
import { DeletedMedicalRecord, TableColumn } from '../../../types'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'

const TrashPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    
    const {
        deletedRecords,
        loading,
        submitLoading,
        error,
        pagination,
        selectedRecordIds,
        activeTab,
        isProcessing,
        currentOperation,
        fetchDeletedRecords,
        restoreSingleRecord,
        bulkRestore,
        bulkPermanentDelete,
        toggleRecordSelection,
        toggleSelectAll,
        setActiveTab
    } = useTrashStore()

    const fetchData = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            await fetchDeletedRecords(page, limit)
        } catch (error) {
            console.error('Error fetching deleted records:', error)
        }
    }, [fetchDeletedRecords])

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10)
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, fetchData])

    useEffect(() => {
        const tab = searchParams.get('tab') || 'medicalRecords'
        if (tab === 'medicalRecords' && tab !== activeTab) {
            setActiveTab(tab as 'medicalRecords')
        }
    }, [searchParams, activeTab, setActiveTab])

    const handleTabChange = (tab: string) => {
        if (tab === 'medicalRecords') {
            navigate('/admin/trash')
        } else {
            navigate(`/admin/trash?tab=${tab}`)
        }
    }

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, pagination.itemsPerPage)
    }, [fetchData, pagination.itemsPerPage])

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage)
    }, [fetchData])

    const handleBulkRestore = async () => {
        await bulkRestore()
    }

    const handleBulkDelete = async () => {
        setShowDeleteConfirm(false)
        await bulkPermanentDelete()
    }

    const tabs = [
        { 
            key: 'medicalRecords', 
            label: 'Medical Records', 
            count: pagination.totalItems 
        }
    ]

    const recordColumns: TableColumn<DeletedMedicalRecord>[] = [
        {
            key: 'checkbox',
            header: '',
            className: styles.thCheckbox,
            render: (record) => (
                <input
                    type="checkbox"
                    title='Checkbox'
                    checked={selectedRecordIds.includes(record.id)}
                    onChange={() => toggleRecordSelection(record.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        {
            key: 'patient',
            header: 'PATIENT',
            className: styles.thPatient,
            render: (record) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientName}>
                        {record.personalDetails.fullName}
                    </div>
                    <div className={styles.patientNumber}>
                        MR-ID: {record.medicalRecordNumber}
                    </div>
                </div>
            )
        },
        {
            key: 'appointmentNumber',
            header: 'APPOINTMENT #',
            className: styles.thRecordType,
            render: (record) => (
                <span className={styles.recordType}>
                    {record.appointmentId?.appointmentNumber || 'N/A'}
                </span>
            )
        },
        {
            key: 'dateRecorded',
            header: 'DATE RECORDED',
            className: styles.thDate,
            render: (record) => formatDate(record.dateRecorded)
        },
        {
            key: 'deletedAt',
            header: 'DELETED AT',
            className: styles.thDate,
            render: (record) => formatDate(record.deletedAt)
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            className: styles.thActions,
            render: (record) => (
                <button
                    type="button"
                    className={styles.restoreBtn}
                    onClick={(e) => {
                        e.stopPropagation()
                        restoreSingleRecord(record.id)
                    }}
                    disabled={isProcessing}
                >
                    <RotateCcw size={16} />
                    Restore
                </button>
            )
        }
    ]

  return (
    <Main error={error}>
        <Header title='Trash Management' />

        <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
        />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Deleted Medical Records</h1>
                
                <div className={styles.itemsPerPageControl}>
                    <label htmlFor="itemsPerPage">Items per page:</label>
                    <select
                        id="itemsPerPage"
                        value={pagination.itemsPerPage}
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

            <div className={styles.tableContainer}>
                <div className={styles.bulkActionsBar}>
                    <label className={styles.selectAllLabel}>
                        <input
                            type="checkbox"
                            checked={selectedRecordIds.length === deletedRecords.length && deletedRecords.length > 0}
                            onChange={toggleSelectAll}
                            className={styles.selectAllCheckbox}
                        />
                        <span className={styles.selectedCount}>
                            {selectedRecordIds.length} selected
                        </span>
                    </label>
                    <span className={styles.recordCount}>
                        {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}
                    </span>
                </div>

                {
                    loading ? (
                        <div className={styles.tableResponsive}>
                            <Loading
                                type='skeleton'
                                rows={7}
                                message='Loading deleted records...'
                                delay={0}
                                minDuration={1000}
                            />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={recordColumns}
                                data={deletedRecords}
                                emptyMessage='No deleted records found.'
                                searchTerm={''}
                                getRowKey={(record) => record.id}
                                onRowClick={(record) => toggleRecordSelection(record.id)}
                            />

                            {
                                pagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.totalItems}
                                        itemsPerPage={pagination.itemsPerPage}
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
            
            {
                selectedRecordIds.length > 0 && (
                    <div className={styles.bulkActions}>
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.restoreButton}`}
                            onClick={handleBulkRestore}
                            disabled={isProcessing}
                        >
                            <RotateCcw size={18} />
                            Restore Selected ({selectedRecordIds.length})
                        </button>
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isProcessing}
                        >
                            <Trash2 size={18} />
                            Permanently Delete ({selectedRecordIds.length})
                        </button>
                    </div>
                )
            }
        </div>

        {
            showDeleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>
                            <AlertTriangle size={48} />
                        </div>
                        <h2 className={styles.modalTitle}>Permanent Delete</h2>
                        <p className={styles.modalMessage}>
                            Are you sure you want to permanently delete {selectedRecordIds.length} record(s)? 
                            This action cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button 
                                type='submit'
                                className={styles.cancelBtn}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type='submit'
                                className={styles.confirmDeleteBtn}
                                onClick={handleBulkDelete}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'delete')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default TrashPage