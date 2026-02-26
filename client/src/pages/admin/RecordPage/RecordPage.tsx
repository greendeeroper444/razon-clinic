import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './RecordPage.module.css'
import { Plus, FileText, Search } from 'lucide-react'
import { Header, Loading, Main, Modal, Pagination, SubmitLoading, Table } from '../../../components'
import { useNavigate } from 'react-router-dom'
import { getMedicalRecordsByName } from '../../../services'
import { formatDate, generateInitials, calculateAge2, generate20Only, getLoadingText } from '../../../utils'
import { FormDataType, MedicalRecordFormData, MedicalRecordResponse, TableColumn } from '../../../types'
import { useMedicalRecordStore } from '../../../stores'
import { toast } from 'sonner'

const RecordPage: React.FC = () => {
    const navigate = useNavigate()
    const [records, setRecords] = useState<MedicalRecordResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasFetched = useRef(false)

    const {
        isModalCreateOpen,
        selectedMedicalRecord,
        submitLoading,
        currentOperation,
        openModalCreate,
        closeModalCreate,
        addMedicalRecord,
    } = useMedicalRecordStore()

    const fetchRecords = useCallback(async (search?: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await getMedicalRecordsByName(search)
            if (response.success) {
                setRecords(response.data.medicalRecords || [])
                setCurrentPage(1)
            } else {
                setError(response.message || 'Failed to fetch records')
            }
        } catch (err) {
            console.error('Error fetching records:', err)
            setError('An error occurred while fetching records')
            toast.error('Failed to load patient records')
        } finally {
            setLoading(false)
        }
    }, [])   // stable — no deps that change

    //only fetch once on mount
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true
            fetchRecords()
        }
    }, [fetchRecords])

    //client-side pagination
    const totalItems = records.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const paginatedRecords = records.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchRecords(value.trim() || undefined)
        }, 400)
    }

    const handleViewRecords = (record: MedicalRecordResponse) => {
        const fullName = record.personalDetails?.fullName
        if (!fullName) return
        navigate(`/admin/medical-records?fullName=${encodeURIComponent(fullName)}`)
    }

    const handleCreateClick = useCallback(() => {
        openModalCreate()
    }, [openModalCreate])

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') return
        const medicalData = data as MedicalRecordFormData
        try {
            await addMedicalRecord(medicalData)
            setTimeout(() => {
                fetchRecords(searchTerm.trim() || undefined)
                closeModalCreate()
            }, 600)
        } catch (error) {
            console.error('Error adding medical record:', error)
        }
    }, [addMedicalRecord, fetchRecords, searchTerm, closeModalCreate])

    const columns: TableColumn<MedicalRecordResponse>[] = [
        {
            key: 'patientName',
            header: 'PATIENT NAME',
            render: (record) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                        {generateInitials(record.personalDetails.fullName)}
                    </div>
                    <div className={styles.patientText}>
                        <div className={styles.patientName}>
                            {generate20Only(record.personalDetails.fullName)}
                        </div>
                        <div className={styles.recordId}>
                            MDR-ID: {record.medicalRecordNumber}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'dateOfBirth',
            header: 'DATE OF BIRTH',
            render: (record) => formatDate(record.personalDetails.dateOfBirth)
        },
        {
            key: 'age',
            header: 'AGE',
            render: (record) => calculateAge2(record.personalDetails.dateOfBirth)
        },
        {
            key: 'gender',
            header: 'GENDER',
            render: (record) => record.personalDetails.gender
        },
        {
            key: 'phone',
            header: 'PHONE',
            render: (record) => record.personalDetails.phone
        },
        {
            key: 'dateRecorded',
            header: 'DATE RECORDED',
            render: (record) => formatDate(record.dateRecorded)
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (record) => (
                <div className={styles.actions}>
                    <button
                        type='button'
                        className={`${styles.actionBtn} ${styles.view}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleViewRecords(record)
                        }}
                        title='View Records'
                    >
                        View Records
                    </button>
                </div>
            )
        }
    ]

    const headerActions = [
        {
            id: 'newMedicalRecordBtn',
            label: 'New Record',
            icon: <Plus />,
            onClick: handleCreateClick,
            type: 'primary' as const
        },
        {
            label: 'All Medical Records',
            icon: <FileText />,
            onClick: () => navigate('/admin/medical-records'),
            type: 'outline' as const
        }
    ]

  return (
    <Main error={error}>
        <Header
            title='Patient Records'
            actions={headerActions}
        />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Patient Records</div>

                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input
                            type='text'
                            className={styles.searchInput}
                            placeholder='Search by patient name...'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                setCurrentPage(1)
                            }}
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

            {loading ? (
                <div className={styles.tableResponsive}>
                    <Loading
                        type='skeleton'
                        rows={7}
                        message='Loading patient records...'
                        delay={0}
                        minDuration={1000}
                    />
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={paginatedRecords}
                        emptyMessage='No patient records found.'
                        searchTerm={searchTerm}
                        getRowKey={(record) => record.id || ''}
                    />

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            disabled={loading}
                        />
                    )}
                </>
            )}
        </div>

        {isModalCreateOpen && (
            <Modal
                isOpen={isModalCreateOpen}
                onClose={closeModalCreate}
                modalType='medical'
                onSubmit={handleSubmitCreate}
                editData={selectedMedicalRecord}
                isProcessing={submitLoading}
            />
        )}

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'medical')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default RecordPage