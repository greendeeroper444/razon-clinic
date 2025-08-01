import React, { useEffect } from 'react'
import styles from './AppointmentPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { OpenModalProps } from '../../../hooks/hook'
import { getFirstLetterOfFirstAndLastName, formatDate, formatTime, openModalWithRefresh, getAppointmentStatusClass, getLoadingText } from '../../../utils'
import { AppointmentFormData, AppointmentResponse, FormDataType } from '../../../types'
import { Main, Header, Modal, SubmitLoading } from '../../../components'
import { useNavigate } from 'react-router-dom'
import { useAppointmentStore } from '../../../stores'

const AppointmentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate()
    
    //zustand store selectors
    const {
        appointments,
        patients,
        submitLoading,
        loading,
        error,
        selectedAppointment,
        isModalOpen,
        isDeleteModalOpen,
        deleteAppointmentData,
        fetchAppointments,
        updateAppointmentData,
        deleteAppointment,
        openUpdateModal,
        openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        currentOperation
    } = useAppointmentStore()


    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'appointment',
            openModal,
            onRefresh: fetchAppointments,
        })
    }

    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`)
    }

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID')
            return
        }

        //asertion simce we know it's AppointmentFormData in this context
        const appointmentData = data as AppointmentFormData;

        await updateAppointmentData(selectedAppointment.id, appointmentData)
    }

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid appointment ID')
            return
        }

        await deleteAppointment(data)
    }

    const headerActions = [
        {
            id: 'newAppointmentBtn',
            label: 'New Appointment',
            icon: faPlus,
            onClick: handleOpenModal,
            type: 'primary' as const
        }
    ]

  return (
    <Main loading={loading} loadingType='spinner' error={error} loadingMessage='Loading appointments...'>
        <Header
            title='Appointments'
            actions={headerActions}
        />

        {/* appointments */}
        <div className={styles.appointmentsSection}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                    Appointments ({appointments.length})
                </h3>
                <div className={styles.sectionActions}>
                    <a href="#">
                        <span>View All</span>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </a>
                </div>
            </div>

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
                                    <td colSpan={6} className={styles.noData}>
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
            loadingText={getLoadingText(currentOperation)}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default AppointmentPage