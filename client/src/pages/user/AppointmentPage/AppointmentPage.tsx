import React, { useState, useEffect, useCallback } from 'react'
import styles from './AppointmentPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { OpenModalProps } from '../../../hooks/hook'
import { getFirstLetterOfFirstAndLastName, formatDate, formatTime, openModalWithRefresh, getAppointmentStatusClass } from '../../../utils'
import { AppointmentFormData, AppointmentResponse, FormDataType, Patient } from '../../../types'
import { getMyAppointment, updateAppointment, deleteAppointment } from '../../../services'
import { ModalComponent } from '../../../components'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const AppointmentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFormData & { id?: string } | null>(null);
    const [deleteAppointmentData, setDeleteAppointmentData] = useState<{id: string, itemName: string, itemType: string} | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    //create a memoized fetchAppointments function using useCallback
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMyAppointment();
            if (response.data.success) {
                setAppointments(response.data.data);
                
                //extract unique patients from appointments for the modal dropdown
                const uniquePatients = Array.from(
                    new Map(
                        response.data.data.map(appointment => [
                            appointment.id,
                            {
                                id: appointment.id,
                                firstName: appointment.firstName,
                                appointmentNumber: appointment.appointmentNumber
                            }
                        ])
                    ).values()
                );
                setPatients(uniquePatients);
            } else {
                setError('Failed to fetch appointments');
            }
        } catch (err) {
            setError('An error occurred while fetching appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'appointment',
            openModal,
            onRefresh: fetchAppointments,
        });
    };


    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/user/appointments/details/${appointment.id}`);
    };

    const handleUpdateClick = (appointment: AppointmentResponse) => {
        //convert the appointment response to form data format
        const formData: AppointmentFormData & { id?: string } = {
            id: appointment.id,
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            middleName: appointment.middleName || null,
            preferredDate: appointment.preferredDate.split('T')[0],
            preferredTime: appointment.preferredTime,
            reasonForVisit: appointment.reasonForVisit,
            status: appointment.status,
            
            //patient information fields
            birthdate: appointment.birthdate,
            sex: appointment.sex,
            height: appointment.height,
            weight: appointment.weight,
            religion: appointment.religion,
            
            //map nested mother info to flat field names
            motherName: appointment.motherInfo?.name || '',
            motherAge: appointment.motherInfo?.age || '',
            motherOccupation: appointment.motherInfo?.occupation || '',
            
            //map nested father info to flat field names
            fatherName: appointment.fatherInfo?.name || '',
            fatherAge: appointment.fatherInfo?.age || '',
            fatherOccupation: appointment.fatherInfo?.occupation || '',
            
            //keep nested structure for backward compatibility if needed
            motherInfo: appointment.motherInfo ? {
                name: appointment.motherInfo.name,
                age: appointment.motherInfo.age,
                occupation: appointment.motherInfo.occupation,
            } : undefined,
            fatherInfo: appointment.fatherInfo ? {
                name: appointment.fatherInfo.name,
                age: appointment.fatherInfo.age,
                occupation: appointment.fatherInfo.occupation,
            } : undefined,
            contactNumber: appointment.contactNumber,
            address: appointment.address
        };
    
        setSelectedAppointment(formData);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (appointment: AppointmentResponse) => {
        setDeleteAppointmentData({
            id: appointment.id,
            itemName: `${appointment.firstName}'s appointment on ${formatDate(appointment.preferredDate)}`,
            itemType: 'Appointment'
        });
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setDeleteAppointmentData(null);
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing medical ID');
            return;
        }

        //asertion simce we know it's MedicalRecordFormData in this context
        const medicalData = data as AppointmentFormData;

        try {
            setLoading(true);
            
            if (selectedAppointment?.id) {

                await updateAppointment(selectedAppointment.id, medicalData);
                await fetchAppointments();
                
                toast.success('Updated appointment successfully!')
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment');
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }

        try {
            setIsProcessing(true);
            
            await deleteAppointment(data);
            await fetchAppointments();
            
            toast.success('Appointment deleted successfully!');
        } catch (error) {
            console.error('Error deleting appointment:', error);
            toast.error('Failed to delete appointment');
        } finally {
            setIsProcessing(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading && appointments.length === 0) {
        return (
            <div className={styles.content}>
                <div className={styles.loadingMessage}>Loading appointments...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.content}>
                <div className={styles.errorMessage}>{error}</div>
            </div>
        );
    }

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Appointments</h1>
            <div className={styles.contentActions}>
                <button 
                    type='button'
                    className={styles.btnPrimary} 
                    id='newAppointmentBtn' 
                    onClick={handleOpenModal}
                >
                    <FontAwesomeIcon icon={faPlus} /> New Appointment
                </button>
            </div>
        </div>

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
                                                    {getFirstLetterOfFirstAndLastName(appointment.firstName)}
                                                </div>
                                                <div>
                                                    <div className={styles.patientName}>
                                                        {appointment.firstName} {appointment.lastName}
                                                    </div>
                                                    <div className={styles.patientId}>
                                                        APT-ID: {appointment.appointmentNumber}
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
                                                onClick={() => handleUpdateClick(appointment)}
                                            >
                                                Update
                                            </button>
                                            <button 
                                                type='button' 
                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                onClick={() => handleDeleteClick(appointment)}
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
                <ModalComponent
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    modalType="appointment"
                    onSubmit={handleSubmitUpdate}
                    patients={patients}
                    editData={selectedAppointment}
                />
            )
        }

        {/* delete appointment modal */}
        {
            isDeleteModalOpen && deleteAppointmentData && (
                <ModalComponent
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteModalClose}
                    modalType="delete"
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteAppointmentData}
                    isProcessing={isProcessing}
                />
            )
        }
    </div>
  )
}

export default AppointmentPage