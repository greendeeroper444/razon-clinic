import React, { useCallback, useEffect, useState } from 'react'
import styles from './AppointmentPage.module.css'
import { Plus } from 'lucide-react'
import { OpenModalProps } from '../../../hooks/hook'
import { getFirstLetterOfFirstAndLastName, formatDate, formatTime, getStatusClass, getLoadingText, generateInitials, generate20Only } from '../../../utils'
import { AppointmentFormData, AppointmentResponse, FormDataType, TableColumn } from '../../../types'
import { Main, Header, Modal, SubmitLoading, Loading, Searchbar, Pagination, Table } from '../../../components'
import { useNavigate } from 'react-router-dom'
import { useAppointmentStore } from '../../../stores'

const AppointmentPage: React.FC<OpenModalProps> = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    //zustand store selectors
    const {
        appointments,
        submitLoading,
        loading,
        error,
        isProcessing,
        selectedAppointment,
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        deleteAppointmentData,
        fetchAppointments,
        addAppointment,
        updateAppointmentData,
        deleteAppointment,
        pagination: storePagination,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        currentOperation
    } = useAppointmentStore();

    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchAppointments({ page, limit, search });
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, [fetchAppointments]);

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

    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`)
    }

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding appointment')
            return
        }

        const appointmentData = data as AppointmentFormData;

        try {
            await addAppointment(appointmentData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding appointment:', error);
        }
    }, [addAppointment, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate])

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID')
            return
        }

        const appointmentData = data as AppointmentFormData;

        try {
            await updateAppointmentData(selectedAppointment.id, appointmentData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    }, [selectedAppointment, updateAppointmentData, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm])

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
         if (typeof data !== 'string') {
            console.error('Invalid appointment ID');
            return;
        }

        try {
            await deleteAppointment(data);

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);

        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    }, [deleteAppointment, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    //table columns
    const appointmentColumns: TableColumn<AppointmentResponse>[] = [
        {
            key: 'patient',
            header: 'PATIENT NAME',
            render: (appointment) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                        {generateInitials(appointment.firstName)}
                    </div>

                    <div className={styles.patientText}>
                        <div className={styles.patientName}>
                            {generate20Only(appointment.firstName)}
                        </div>
                        <div className={styles.appointmentId}>
                            APT-ID: {appointment.appointmentNumber}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'date',
            header: 'PREFERRED DATE',
            render: (appointment) => (
                <div className={styles.appointmentDate}>
                    {formatDate(appointment.preferredDate)}
                </div>
            )
        },
        {
            key: 'time',
            header: 'PREFERRED TIME',
            render: (appointment) => (
                <div className={styles.appointmentTime}>
                    {formatTime(appointment.preferredTime)}
                </div>
            )
        },
        {
            key: 'status',
            header: 'STATUS',
            render: (appointment) => (
                <span className={`${styles.statusBadge} ${getStatusClass(appointment.status, styles)}`}>
                    {appointment.status}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (appointment) => (
                <>
                    <button 
                        type='button' 
                        className={`${styles.actionBtn} ${styles.view}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(appointment);
                        }}
                    >
                        View
                    </button>
                    <button 
                        type='button' 
                        className={`${styles.actionBtn} ${styles.update}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModalUpdate(appointment);
                        }}
                    >
                        Update
                    </button>
                    <button 
                        type='button' 
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModalDelete(appointment);
                        }}
                    >
                        Delete
                    </button>
                </>
            )
        }
    ];

    const headerActions = [
        {
            id: 'newAppointmentBtn',
            label: 'New Appointment',
            icon: <Plus />,
            onClick: handleCreateClick,
            type: 'primary' as const
        }
    ]

  return (
    <Main error={error}>
        <Header
            title='Appointments'
            actions={headerActions}
        />

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}> 
                    Appointments ({loading ? '...' : appointments.length}) 
                </div>

                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search appointments..."
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
                            message='Loading appointment data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={appointmentColumns}
                            data={appointments}
                            emptyMessage='No appointments found. Click "New Appointment" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(appointment) => appointment.id}
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
                    modalType="appointment"
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
                    modalType="appointment"
                    onSubmit={handleSubmitUpdate}
                    editData={selectedAppointment}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalDeleteOpen && deleteAppointmentData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
                    modalType="delete"
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteAppointmentData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'appointment')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default AppointmentPage