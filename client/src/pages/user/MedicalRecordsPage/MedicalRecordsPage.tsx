import React, { useCallback, useEffect, useState } from 'react'
import styles from './MedicalRecordsPage.module.css';
import { Download } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { MedicalRecordFormData, MedicalRecordResponse, TableColumn } from '../../../types';
import { Header, Loading, Main, Pagination, Searchbar, Table } from '../../../components';
import { toast } from 'sonner';
import { calculateAge2, formatDate, generate20Only, generateInitials } from '../../../utils';
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
        loading,
        error,
        isProcessing,
        pagination: storePagination,
        fetchMyMedicalRecords,
        getStatusFromRecord,
    } = useMedicalRecordStore();


    //calculate summary stats using useMemo for performance
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchMyMedicalRecords({ page, limit, search });
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    }, [fetchMyMedicalRecords]);

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

    const handleViewClick = (record: MedicalRecordResponse) => {
        navigate(`/user/medical-records/details/${record.id}`)
    }

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

  return (
    <Main error={error}>
        <Header title='Medical Records' />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Patient Records</div>

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
    </Main>
  )
}

export default MedicalRecordsPage