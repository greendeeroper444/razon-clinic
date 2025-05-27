import { useState, useEffect, useCallback } from 'react'
import styles from './AppointmentDetailsPage.module.css'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, 
    faClock, 
    faUser,
    faEnvelope, 
    faPhone, 
    faNotesMedical, 
    faMapMarkerAlt, 
    faBirthdayCake, 
    faVenusMars,
    faArrowLeft,
    faPrint,
    faEdit,
    faCheckCircle,
    faRulerVertical,
    faWeight,
    faUsers,
    faPray
} from '@fortawesome/free-solid-svg-icons';
import { getAppointmentDetails, getMyAppointment, updateAppointment } from '../../services/appoinmentService';
import { calculateAge, formatBirthdate, formatDate } from '../../../utils/formatDateTime';
import { Appointment, AppointmentFormData, AppointmentResponse } from '../../../types/appointment';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import { toast } from 'sonner';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFormData & { id?: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [patients, setPatients] = useState<Array<{ id: string; fullName: string }>>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);

    //extract appointment details fetching into a separate function
    const fetchAppointmentDetails = useCallback(async () => {
        if (!appointmentId) {
            setError('No appointment ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Fetching appointment details for ID:", appointmentId);
            const response = await getAppointmentDetails(appointmentId as string);
            console.log("API Response:", response);
            
            if (response.data && response.data.success) {
                setAppointment(response.data.data);
                setError(null);
            } else {
                setError('Failed to load appointment details: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error fetching appointment details:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const errorObj = err as { response?: { data?: { message?: string } }, message?: string };
                setError(`Failed to load appointment details: ${errorObj.response?.data?.message || errorObj.message}`);
            } else if (err instanceof Error) {
                setError(`Failed to load appointment details: ${err.message}`);
            } else {
                setError('Failed to load appointment details: Unknown error');
            }
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    const fetchAppointments = useCallback(async () => {
        try {
            const response = await getMyAppointment();
            if (response.data.success) {
                setAppointments(response.data.data);
                
                //extract unique patients from appointments for the modal dropdown
                const uniquePatients = Array.from(
                    new Map(
                        response.data.data.map(appointment => [
                            appointment.patientId.id,
                            {
                                id: appointment.patientId.id,
                                fullName: appointment.patientId.fullName
                            }
                        ])
                    ).values()
                );
                setPatients(uniquePatients);
            } else {
                console.error('Failed to fetch appointments for patient list');
            }
        } catch (err) {
            console.error('Error fetching appointments for patient list:', err);
        }
    }, []);

    //initial load
    useEffect(() => {
        fetchAppointmentDetails();
        fetchAppointments();
    }, [fetchAppointmentDetails, fetchAppointments]);

    //function to create a custom event for appointment refresh
    const createRefreshEvent = () => {
        //create a custom event to trigger refresh
        const refreshEvent = new CustomEvent('appointment-refresh');
        window.dispatchEvent(refreshEvent);
    };

    const handleUpdateClick = (appointment: AppointmentResponse) => {
        //convert the appointment response to form data format
        const formData: AppointmentFormData & { id?: string } = {
            id: appointment.id,
            patientId: appointment.patientId.id,
            preferredDate: appointment.preferredDate.split('T')[0],
            preferredTime: appointment.preferredTime,
            reasonForVisit: appointment.reasonForVisit,
            status: appointment.status,
            
            //patient information fields
            birthdate: appointment.birthdate ? appointment.birthdate.split('T')[0] : undefined,
            sex: appointment.sex,
            address: appointment.address,
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
        };
    
        setSelectedAppointment(formData);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleSubmitUpdate = async (formData: AppointmentFormData) => {
        try {
            setLoading(true);
            
            if (selectedAppointment?.id) {
                await updateAppointment(selectedAppointment.id, formData);
                
                //refetch both the appointment details AND the appointments list
                await Promise.all([
                    fetchAppointmentDetails(),
                    fetchAppointments()
                ]);
                
                //create refresh event for other components
                createRefreshEvent();
                
                toast.success('Updated appointment successfully!');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment');
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading appointment details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    type='button'
                    className={styles.btnPrimary}
                    onClick={() => window.history.back()}
                    title="Go Back"
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Go Back
                </button>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>Appointment not found</p>
                <button type='button' className={styles.btnPrimary} onClick={() => window.history.back()}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Go Back
                </button>
            </div>
        );
    }

    //get status class
    const getStatusClass = (status: string) => {
        switch (status) {
        case 'Pending':
            return styles.statusPending;
        case 'Scheduled':
            return styles.statusScheduled;
        case 'Completed':
            return styles.statusCompleted;
        case 'Cancelled':
            return styles.statusCancelled;
        case 'Rebooked':
            return styles.statusRebooked;
        default:
            return '';
        }
    };

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <div className={styles.headerLeft}>
                <button type='button' className={styles.btnBack} onClick={() => window.history.back()}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className={styles.contentTitle}>Appointment Details</h1>
            </div>
            <div className={styles.contentActions}>
                <button type='button' className={styles.btnPrimary}  onClick={() => handleUpdateClick(appointment)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
            </div>
        </div>

        <div className={styles.appStatusBanner}>
            <div className={styles.appointmentNumber}>
                Appointment #{appointment.appointmentNumber}
            </div>
            <div className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                {appointment.status}
            </div>
        </div>

        <div className={styles.appointmentDetailsGrid}>
            {/* appointment detail card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.cardIcon} />
                    <h2>Appointment Information</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Preffered Date:
                        </span>
                        <span className={styles.infoValue}>{formatDate(appointment.preferredDate)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faClock} /> Preffered Time:
                        </span>
                        <span className={styles.infoValue}>{appointment.preferredTime}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faNotesMedical} /> Reason for Visit:
                        </span>
                        <span className={styles.infoValue}>{appointment.reasonForVisit}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Created On:</span>
                        <span className={styles.infoValue}>
                            {new Date(appointment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    {
                        appointment.updatedAt !== appointment.createdAt && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Last Updated:</span>
                                <span className={styles.infoValue}>
                                {new Date(appointment.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* patient contact information card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faUser} className={styles.cardIcon} />
                    <h2>Patient Information</h2>
                </div>
                <div className={styles.cardContent}>
                    {appointment.fullName && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faUser} /> Name:
                            </span>
                            <span className={styles.infoValue}>{appointment.fullName}</span>
                        </div>
                    )}
                    {appointment.patientId.email && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faEnvelope} /> Email:
                            </span>
                            <span className={styles.infoValue}>{appointment.patientId.email}</span>
                        </div>
                    )}
                    {appointment.patientId.contactNumber && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faPhone} /> Contact:
                            </span>
                            <span className={styles.infoValue}>{appointment.patientId.contactNumber}</span>
                        </div>
                    )}
                    {appointment.patientId.address && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                            </span>
                            <span className={styles.infoValue}>{appointment.patientId.address}</span>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faBirthdayCake} /> Birthdate:
                        </span>
                        <span className={styles.infoValue}>
                            {formatBirthdate(appointment.birthdate)} 
                            <span className={styles.ageLabel}>({calculateAge(appointment.birthdate)} years)</span>
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faVenusMars} /> Sex:
                        </span>
                        <span className={styles.infoValue}>{appointment.sex}</span>
                    </div>
                </div>
            </div>

            {/* patient medical information card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faNotesMedical} className={styles.cardIcon} />
                    <h2>Medical Information</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faRulerVertical} /> Height:
                        </span>
                        <span className={styles.infoValue}>{appointment.height} cm</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faWeight} /> Weight:
                        </span>
                        <span className={styles.infoValue}>{appointment.weight} kg</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faPray} /> Religion:
                        </span>
                        <span className={styles.infoValue}>{appointment.religion}</span>
                    </div>
                </div>
            </div>

            {/* family information card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faUsers} className={styles.cardIcon} />
                    <h2>Family Information</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.familySection}>
                        <h3 className={styles.familyTitle}>Mother's Information</h3>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faUser} /> Name:
                            </span>
                            <span className={styles.infoValue}>{appointment.motherInfo.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Age:</span>
                            <span className={styles.infoValue}>{appointment.motherInfo.age} years</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Occupation:</span>
                            <span className={styles.infoValue}>
                                {appointment.motherInfo.occupation === 'n/a' ? 'Not specified' : appointment.motherInfo.occupation}
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.familySection}>
                        <h3 className={styles.familyTitle}>Father's Information</h3>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faUser} /> Name:
                            </span>
                            <span className={styles.infoValue}>{appointment.fatherInfo.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Age:</span>
                            <span className={styles.infoValue}>{appointment.fatherInfo.age} years</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Occupation:</span>
                            <span className={styles.infoValue}>{appointment.fatherInfo.occupation}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
    </div>
  )
}

export default AppointmentDetailsPage