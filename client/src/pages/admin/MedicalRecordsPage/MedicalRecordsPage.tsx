import React, { useCallback, useEffect, useState } from 'react'
import styles from './MedicalRecordsPage.module.css';
import { Plus, Download, Trash, Edit } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { FormDataType, MedicalRecordFormData, MedicalRecordResponse, TableColumn } from '../../../types';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components';
import { toast } from 'sonner';
import { calculateAge2, formatDate, generate20Only, generateInitials, getLoadingText } from '../../../utils';
import { useMedicalRecordStore } from '../../../stores';
import { useNavigate } from 'react-router-dom';
import { generateMedicalRecordPDF } from '../../../templates';

const MedicalRecordsPage: React.FC<OpenModalProps> = () => {
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
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        selectedMedicalRecord,
        softDeleteMedicalRecordData,
        pagination: storePagination,
        fetchMedicalRecords,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        updateMedicalRecordData,
        addMedicalRecord,
        softDeleteMedicalRecord,
        getStatusFromRecord,
        currentOperation,
        exportMedicalRecords
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

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, storePagination?.itemsPerPage || 10, term);
    }, [fetchData, storePagination?.itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm);
    }, [fetchData, searchTerm]);

    const handleCreateClick = useCallback(() => {
        openModalCreate();
    }, [openModalCreate]);

    const handleExport = () => {
        try {
            exportMedicalRecords();
        } catch (error) {
            console.log('Export error:', error)
        }
    };

    const handleViewClick = (record: MedicalRecordResponse) => {
        navigate(`/admin/medical-records/details/${record.id}`)
    }

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding billing')
            return
        }

        const billingData = data as MedicalRecordFormData;

        try {
            await addMedicalRecord(billingData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding medical records:', error);
        }
    }, [addMedicalRecord, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate])

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
                                openModalUpdate(record);
                            }}
                            title='Update'
                        >
                            <Edit size={16} />
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
                        <button
                            type='button'
                            className={`${styles.actionBtn} ${styles.delete}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModalDelete(record);
                            }}
                            title='Delete'
                        >
                            <Trash size={16} />
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
            onClick: handleCreateClick,
            type: 'primary' as const
        },
        {
            label: 'Export',
            icon: <Download />,
            onClick: handleExport,
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

                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search records..."
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
                                />
                            )
                        }

                    </>
                )
            }
        </div>

        {
            isModalCreateOpen && (
                <Modal
                    isOpen={isModalCreateOpen}
                    onClose={closeModalCreate}
                    modalType='medical'
                    onSubmit={handleSubmitCreate}
                    editData={selectedMedicalRecord}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType='medical'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedMedicalRecord}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalDeleteOpen && softDeleteMedicalRecordData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
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