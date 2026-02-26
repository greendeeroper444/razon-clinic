import React, { useCallback, useEffect, useState } from 'react'
import styles from './AppointmentPage.module.css'
import { Plus } from 'lucide-react'
import { OpenModalProps } from '../../../hooks/hook'
import { formatDate, formatTime, getStatusClass, getLoadingText, generateInitials } from '../../../utils'
import { AppointmentFormData, AppointmentResponse, FormDataType, TableColumn } from '../../../types'
import { Main, Header, Modal, SubmitLoading, Loading, Searchbar, Pagination, Table } from '../../../components'
import { useNavigate } from 'react-router-dom'
import { useAppointmentStore, useAuthenticationStore } from '../../../stores'
import { toast } from 'sonner'
import { updateAppointmentStatus } from '../../../services'

const AppointmentPage: React.FC<OpenModalProps> = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    //get the logged-in user to pre-fill the create form
    const user = useAuthenticationStore((state) => state.user);

    //build the user's full name from their profile
    const userFullName = [
        user?.firstName,
        user?.middleName,
        user?.lastName,
        user?.suffix
    ].filter(Boolean).join(' ');

    const userAge = React.useMemo(() => {
        if (!user?.birthdate) return '';
        const birth = new Date(user.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return String(age);
    }, [user?.birthdate]);

    const userDefaultFormData: Partial<AppointmentFormData> = {
        //patient unformation — left blank (child's info, filled by user)
        firstName:    '',
        lastName:     '',
        middleName:   '',
        birthdate:    '',
        sex:          '',
        height:       '',
        weight:       '',

        //mother's Information — pre-filled only if logged-in user is Female
        motherName:       user?.sex === 'Female' ? userFullName : '',
        motherAge:        user?.sex === 'Female' ? userAge : '', 
        motherOccupation: '',
        motherInfo: {
            name:       user?.sex === 'Female' ? userFullName : '',
            age:        user?.sex === 'Female' ? userAge : '',  
            occupation: ''
        },

        //father's Information — pre-filled only if logged-in user is Male
        fatherName:       user?.sex === 'Male' ? userFullName : '',
        fatherAge:        user?.sex === 'Male' ? userAge : '', 
        fatherOccupation: '',
        fatherInfo: {
            name:       user?.sex === 'Male' ? userFullName : '',
            age:        user?.sex === 'Male' ? userAge : '',
            occupation: ''
        },

        //contact details from user profile
        contactNumber: user?.contactNumber || '',
        address:       user?.address       || '',
        religion:      user?.religion      || '',

        //appointment fields — left blank for the user to fill
        preferredDate:  '',
        preferredTime:  '',
        reasonForVisit: '',
        status:         'Pending',
    };

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
        fetchMyAppointments,
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

    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '', status: string = '') => {
        try {
            await fetchMyAppointments({ page, limit, search, status });
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, [fetchMyAppointments]);

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

    const handleStatusChange = useCallback((status: string) => {
        setStatusFilter(status);
        fetchData(1, storePagination?.itemsPerPage || 10, searchTerm, status);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

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
        navigate(`/user/appointments/details/${appointment.id}`)
    }

    const handleSubmitAdd = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding appointment')
            return
        }

        const { id: _, ...appointmentData } = data as AppointmentFormData & { id?: string };

        try {
            await addAppointment(appointmentData as AppointmentFormData)

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
                            {appointment.firstName} {appointment.lastName} {appointment.suffix}
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
                        disabled={['Scheduled', 'Cancelled', 'Completed'].includes(appointment.status)}
                        className={`${styles.actionBtn} ${styles.update} ${
                            ['Scheduled', 'Cancelled', 'Completed'].includes(appointment.status)
                                ? styles.disabled
                                : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModalUpdate(appointment);
                        }}
                    >
                        Update
                    </button>
                   <button
                        type='button'
                        disabled={appointment.status === 'Cancelled'}
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            updateAppointmentStatus(appointment.id, 'Cancelled').then(() => {
                                fetchData(
                                    storePagination?.currentPage || 1,
                                    storePagination?.itemsPerPage || 10,
                                    searchTerm,
                                    statusFilter
                                );
                            });
                        }}
                    >
                        Cancel
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

                    <div className={styles.selectControl}>
                        <label htmlFor="statusFilter">Status:</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={loading}
                            className={styles.selectOption}
                        >
                            <option value="">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Referred">Referred</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Rebooked">Rebooked</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className={styles.selectControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.selectOption}
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
                    onSubmit={handleSubmitAdd}
                    isProcessing={submitLoading}
                    editData={userDefaultFormData as AppointmentFormData}
                    isNewRecord={true}
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