import React, { useCallback, useEffect, useState } from 'react'
import styles from './MedicalRecordsPage.module.css';
import { Plus, FileText, Download } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { FormDataType, MedicalRecordFormData, MedicalRecordResponse, TableColumn } from '../../../types';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components';
import { toast } from 'sonner';
import { calculateAge2, formatDate, getLoadingText, openModalWithRefresh } from '../../../utils';
import { useMedicalRecordStore } from '../../../stores';
import { useNavigate } from 'react-router-dom';
import { generateMedicalRecordPDF } from '../../../templates';

const MedicalRecordsPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    //zustand store selectors
    const {
        medicalRecords,
        submitLoading,
        loading,
        error,
        isProcessing,
        isModalOpen,
        isDeleteModalOpen,
        selectedMedicalRecord,
        softDeleteMedicalRecordData,
        pagination: storePagination,
        fetchMedicalRecords,
        openUpdateModal,
        openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        updateMedicalRecordData,
        addMedicalRecord,
        softDeleteMedicalRecord,
        getStatusFromRecord,
        currentOperation
    } = useMedicalRecordStore();


    //calculate summary stats using useMemo for performance
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchMedicalRecords({ page, limit, search });
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    }, [fetchMedicalRecords]);

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '');
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData]);

    //handle search
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, storePagination?.itemsPerPage || 10, term);
    }, [fetchData, storePagination?.itemsPerPage]);

    //handle page change
    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

    //handle items per page change
    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm);
    }, [fetchData, searchTerm]);

    const handleOpenModal = useCallback(() => {
        openModalWithRefresh({
            modalType: 'medical',
            openModal,
            onRefresh: () => fetchData(
                storePagination?.currentPage || 1, 
                storePagination?.itemsPerPage || 10, 
                searchTerm
            ),
        });
    }, [openModal, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleReport = () => {
        console.log('Generate report');
    };

    const handleViewClick = (record: MedicalRecordResponse) => {
        navigate(`/admin/medical-records/details/${record.id}`)
    }

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing medical ID');
            return;
        }

        const medicalData = data as MedicalRecordFormData;

        try {
            if (selectedMedicalRecord?.id) {
                await updateMedicalRecordData(selectedMedicalRecord.id, medicalData);
            } else {
                await addMedicalRecord(medicalData);
            }

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error processing medical record:', error);
        }
    }, [selectedMedicalRecord, updateMedicalRecordData, addMedicalRecord, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }

        try {
            await softDeleteMedicalRecord(data);

             setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error deleting medical record:', error);
        }
    }, [softDeleteMedicalRecord, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleDownloadReceipt = useCallback((record: MedicalRecordFormData) => {
        if (!record) {
            toast.error('No record data available');
            return;
        }

        //prevent multiple simultaneous downloads
        if (isGeneratingPDF) {
            toast.warning('Please wait, generating receipt...');
            return;
        }

        setIsGeneratingPDF(true);
        const loadingToast = toast.loading('Generating receipt PDF...');

        try {
            generateMedicalRecordPDF(record);
            
            toast.dismiss(loadingToast);
            toast.success('Receipt downloaded successfully!', {
                description: `Receipt for ${record.personalDetails.fullName}`
            });
        } catch (error) {
            console.error('Error generating receipt:', error);
            
            toast.dismiss(loadingToast);
            toast.error('Failed to generate receipt', {
                description: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    }, [isGeneratingPDF]);


    const medicalRecordsColumns: TableColumn<MedicalRecordResponse>[] = [
        {
            key: 'patientName',
            header: 'PATIENT NAME',
            render: (record) => (
                <span className={styles.patientName}>
                    {record.personalDetails.fullName}
                </span>
            )
        },
        {
            key: 'dateOfBirth',
            header: 'DATE OF BIRTH',
            render: (record) => 
                (formatDate(record.personalDetails.dateOfBirth))
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
            render: (record) => 
                (formatDate(record.dateRecorded))
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (record) => {
                getStatusFromRecord(record);
                
                return (
                    <div className={styles.actions}>
                        <button
                            type='button'
                            className={`${styles.actionBtn} ${styles.view}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(record);
                            }}
                            title='View Details'
                        >
                            View
                        </button>
                        <button
                            type='button'
                            className={`${styles.actionBtn} ${styles.update}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openUpdateModal(record);
                            }}
                            title='Update'
                        >
                            Update
                        </button>
                        <button
                            type='button'
                            className={`${styles.actionBtn} ${styles.delete}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(record);
                            }}
                            title='Delete'
                        >
                            Delete
                        </button>

                        <button
                            type='button'
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReceipt(record);
                            }}
                            className={`${styles.actionBtn} ${styles.download}`}
                            title="Download Receipt"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                );
            }
        }
    ];

    const headerActions = [
        {
            id: 'newMedicalRecordBtn',
            label: 'New Record',
            icon: <Plus />,
            onClick: handleOpenModal,
            type: 'primary' as const
        },
        {
            label: 'Report',
            icon: <FileText />,
            onClick: handleReport,
            type: 'outline' as const
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='Medical Records'
            actions={headerActions}
        />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Medical Records</div>

                {/* search and items per page controls */}
                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search medicines..."
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

            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading medical records data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={medicalRecordsColumns}
                            data={medicalRecords}
                            emptyMessage='No medical records found. Click "New Record" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(record) => record.id || ''}
                            className={styles.recordsTable}
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

        {/* update medical record modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType='medical'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedMedicalRecord}
                    isProcessing={submitLoading}
                />
            )
        }

        {/* delete medical record modal */}
        {
            isDeleteModalOpen && softDeleteMedicalRecordData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={softDeleteMedicalRecordData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'medical')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default MedicalRecordsPage