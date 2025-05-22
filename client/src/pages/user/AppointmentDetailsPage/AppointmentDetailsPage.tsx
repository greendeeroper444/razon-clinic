import { useState, useEffect } from 'react'
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
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { getAppointmentDetails } from '../../services/appoinmentService';
import { Patient } from '../../../types/patient';
import { calculateAge, formatBirthdate, formatDate } from '../../../utils/formatDateTime';

type Appointment = {
  appointmentNumber: string;
  preferredDate: string;
  preferredTime: string;
  reasonForVisit: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  patientId: Patient;
};

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                setLoading(true);
                console.log("Fetching appointment details for ID:", appointmentId);
                const response = await getAppointmentDetails(appointmentId as string);
                console.log("API Response:", response);
                
                if (response.data && response.data.success) {
                    setAppointment(response.data.data);
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
        };

        if (appointmentId) {
            fetchAppointmentDetails();
        } else {
            setError('No appointment ID provided');
            setLoading(false);
        }
    }, [appointmentId]);

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
                {/* <button type='button' className={styles.btnOutline}>
                    <FontAwesomeIcon icon={faPrint} /> Print
                </button> */}
                <button type='button' className={styles.btnPrimary}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                {/* <button type='button' className={styles.btnOutline}>
                    <FontAwesomeIcon icon={faCheckCircle} /> Status
                </button> */}
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
            {/* appoint detail card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.cardIcon} />
                    <h2>Appointment Information</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Date:
                        </span>
                        <span className={styles.infoValue}>{formatDate(appointment.preferredDate)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faClock} /> Time:
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

            {/* patient details card */}
            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faUser} className={styles.cardIcon} />
                    <h2>Patient Information</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faUser} /> Name:
                        </span>
                        <span className={styles.infoValue}>{appointment.patientId.fullName}</span>
                    </div>
                    {
                        appointment.patientId.email && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faEnvelope} /> Email:
                                </span>
                                <span className={styles.infoValue}>{appointment.patientId.email}</span>
                            </div>
                        )
                    }
                    {
                        appointment.patientId.contactNumber && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                <FontAwesomeIcon icon={faPhone} /> Contact:
                                </span>
                                <span className={styles.infoValue}>{appointment.patientId.contactNumber}</span>
                            </div>
                        )
                    }
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faBirthdayCake} /> Birthdate:
                        </span>
                        <span className={styles.infoValue}>
                            {formatBirthdate(appointment.patientId.birthdate)} 
                            <span className={styles.ageLabel}>({calculateAge(appointment.patientId.birthdate)} years)</span>
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faVenusMars} /> Sex:
                        </span>
                        <span className={styles.infoValue}>{appointment.patientId.sex}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                        </span>
                        <span className={styles.infoValue}>{appointment.patientId.address}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AppointmentDetailsPage