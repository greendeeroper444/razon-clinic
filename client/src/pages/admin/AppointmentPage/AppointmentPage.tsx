import React, { useCallback, useEffect, useState } from 'react'
import styles from './AppointmentPage.module.css'
import { Plus } from 'lucide-react'
import { OpenModalProps } from '../../../hooks/hook'
import { getFirstLetterOfFirstAndLastName, formatDate, formatTime, openModalWithRefresh, getAppointmentStatusClass, getLoadingText } from '../../../utils'
import { AppointmentFormData, AppointmentResponse, FormDataType } from '../../../types'
import { Main, Header, Modal, SubmitLoading, Loading, Searchbar, Pagination } from '../../../components'
import { useNavigate } from 'react-router-dom'
import { useAppointmentStore } from '../../../stores'

const AppointmentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    //zustand store selectors
    const {
        appointments,
        patients,
        submitLoading,
        loading,
        error,
        isProcessing,
        selectedAppointment,
        isModalOpen,
        isDeleteModalOpen,
        deleteAppointmentData,
        fetchAppointments,
        updateAppointmentData,
        deleteAppointment,
        pagination: storePagination,
        openUpdateModal,
        openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        currentOperation
    } = useAppointmentStore();

    //calculate summary stats using useMemo for performance
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
            modalType: 'appointment',
            openModal,
            onRefresh: () => fetchData(
                storePagination?.currentPage || 1, 
                storePagination?.itemsPerPage || 10, 
                searchTerm
            ),
        })
    }, [openModal, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`)
    }

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID')
            return
        }

        //assertion since we know it's AppointmentFormData in this context
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

            //refresh after operation completes
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

    const headerActions = [
        {
            id: 'newAppointmentBtn',
            label: 'New Appointment',
            icon: <Plus />,
            onClick: handleOpenModal,
            type: 'primary' as const
        }
    ]

  return (
    <Main error={error}>
        <Header
            title='Appointments'
            actions={headerActions}
        />

        {/* appointments */}
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}> Appointments ({loading ? '...' : appointments.length}) </div>

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

            {/*show loading skeleton or actual table */}
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
                        <div className={styles.tableResponsive}>
                            <table className={styles.appointmentsTable}>
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Preferred Date</th>
                                        <th>Preferred Time</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        appointments.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className={styles.noData}>
                                                    No appointments found. Create your first appointment using the "New Appointment" button.
                                                </td>
                                            </tr>
                                        ) : (
                                            appointments.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td>
                                                        <div className={styles.patientInfo}>
                                                            <div className={styles.patientAvatar}>
                                                                {
                                                                    (() => {
                                                                        const firstName = appointment.firstName
                                                                        return firstName 
                                                                        ? getFirstLetterOfFirstAndLastName(firstName)
                                                                        : 'N/A'
                                                                    })()
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className={styles.patientName}>
                                                                    {appointment.firstName}
                                                                </div>
                                                                <div className={styles.patientId}>
                                                                    APT-ID: {appointment.appointmentNumber || 'Walk-in'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.appointmentDate}>
                                                            {formatDate(appointment.preferredDate)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.appointmentTime}>
                                                            {formatTime(appointment.preferredTime)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${getAppointmentStatusClass(appointment.status, styles)}`}>
                                                            {appointment.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            type='button' 
                                                            className={`${styles.actionBtn} ${styles.view}`}
                                                            onClick={() => handleViewClick(appointment)}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            type='button' 
                                                            className={`${styles.actionBtn} ${styles.update}`}
                                                            onClick={() => openUpdateModal(appointment)}
                                                        >
                                                            Update
                                                        </button>
                                                        <button 
                                                            type='button' 
                                                            className={`${styles.actionBtn} ${styles.delete}`}
                                                            onClick={() => openDeleteModal(appointment)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
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
        
        {/* update appointment modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType="appointment"
                    onSubmit={handleSubmitUpdate}
                    patients={patients}
                    editData={selectedAppointment}
                    isProcessing={submitLoading}
                />
            )
        }

        {/* delete appointment modal */}
        {
            isDeleteModalOpen && deleteAppointmentData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
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