import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styles from './PatientPage.module.css';
import { Plus } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Main, Header, Modal, SubmitLoading, Loading, Searchbar, Pagination, Table } from '../../../components';
import { FormDataType, PatientDisplayData, PatientFormData, TableColumn } from '../../../types';
import { calculateAge2, generateInitials, getLoadingText } from '../../../utils';
import { getPatientSummaryCards } from '../../../config/patientSummaryCards';
import { useAuthenticationStore, usePatientStore } from '../../../stores';
import { useNavigate } from 'react-router-dom';

const PatientPage: React.FC<OpenModalProps> = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    //zustand store selectors
    const {
        patients,
        submitLoading,
        loading,
        error,
        isProcessing,
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        selectedPatient,
        deletePatientData,
        addPatient,
        pagination: storePagination,
        summaryStats,
        fetchPatients,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        updatePatientData,
        deletePatient,
        archiveSinglePatient,
        currentOperation
    } = usePatientStore();
    const { user } = useAuthenticationStore();

    //calculate summary stats using useMemo for performance
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchPatients({ page, limit, search });
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    }, [fetchPatients]);

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

    //transform api data to display format
    const transformPatientData = (apiData: PatientFormData[]): PatientDisplayData[] => {
        return apiData.map(patient => ({
            ...patient,
            age: calculateAge2(patient.birthdate),
            initials: generateInitials(patient.firstName)
        }));
    };

    //transform patients for display
    const displayPatients = useMemo(() => 
        transformPatientData(patients), 
        [patients]
    );

    const handleCreateClick = useCallback(() => {
        openModalCreate();
    }, [openModalCreate]);

    const handleViewClick = (patient: PatientDisplayData) => {
        navigate(`/admin/patients/details/${patient.id}`)
    };

    const handleUpdateClick = useCallback((patient: PatientFormData) => {
        openModalUpdate(patient);
    }, [openModalUpdate]);

    const handleDeleteClick = useCallback((patient: PatientFormData) => {
        openModalDelete(patient);
    }, [openModalDelete]);

    const handleArchiveClick = useCallback(async (patient: PatientFormData) => {
        if (!patient.id) {
            console.error('Patient ID is missing');
            return;
        }

        try {
            await archiveSinglePatient(patient.id);
        } catch (error) {
            console.error('Error archiving patient:', error);
        }
    }, [archiveSinglePatient]);

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding patient')
            return
        }

        const patientData = data as PatientFormData;

        try {
            await addPatient(patientData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    }, [addPatient, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate])
    

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedPatient || !selectedPatient.id) {
            console.error('Invalid data or missing patient ID');
            return;
        }
        const patientData = data as PatientFormData;

        try {
            if (selectedPatient && selectedPatient.id) {
                await updatePatientData(selectedPatient.id, patientData);
            } else {
                await addPatient(patientData);
            }

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    }, [selectedPatient, updatePatientData, addPatient, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    //handle delete confirmation
    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }

        try {
            await deletePatient(data);

            //refresh after operation completes
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);

        } catch (error) {
            console.error('Error deleting patient:', error);
        }
    }, [deletePatient, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const summaryCards = getPatientSummaryCards(summaryStats);

    const patientColumns: TableColumn<PatientDisplayData>[] = [
        {
            key: 'patient',
            header: 'PATIENT',
            render: (patient) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>{patient.initials}</div>
                    <div>
                        <div className={styles.patientName}>
                            {patient.firstName} {patient.lastName} {patient.suffix}
                        </div>
                        <div className={styles.patientId}>PT-ID: {patient.patientNumber}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'gender',
            header: 'GENDER',
            render: (patient) => (
                <span className={`${styles.patientGender} ${styles[patient.sex?.toLowerCase() || 'unknown']}`}>
                    {patient.sex || 'N/A'}
                </span>
            )
        },
        {
            key: 'age',
            header: 'AGE',
            render: (patient) => patient.age || 'N/A'
        },
        {
            key: 'contact',
            header: 'CONTACT',
            render: (patient) => patient.contactNumber || 'N/A'
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (patient) => (
                <>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.primary}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(patient);
                        }}
                    >
                        View
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.update}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateClick(patient);
                        }}
                    >
                        Update
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.cancel}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(patient);
                        }}
                    >
                        Delete
                    </button>
                    {
                        user && user.role === 'Doctor' && (
                            <button 
                                type='button'
                                className={`${styles.actionBtn} ${styles.archive}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveClick(patient);
                                }}
                                disabled={isProcessing || patient.isArchived}
                            >
                                Archive
                            </button>
                        )
                    }
                </>
            )
        }
    ];

    const headerActions = [
        {
            id: 'newPatientBtn',
            label: 'New Patient',
            icon: <Plus />,
            onClick: handleCreateClick,
            type: 'primary' as const
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='Patients'
            actions={headerActions}
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

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Patient Records</div>

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
                            data={displayPatients}
                            emptyMessage='No patients found. Click "New Patient" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(patient) => patient.id || ''}
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

        {
            isModalCreateOpen && (
                <Modal
                    isOpen={isModalCreateOpen}
                    onClose={closeModalCreate}
                    modalType="patient"
                    onSubmit={handleSubmitCreate}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType='patient'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedPatient}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalDeleteOpen && deletePatientData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deletePatientData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'patient')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default PatientPage