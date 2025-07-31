import { useState, useEffect, useCallback } from 'react'
import styles from './AppointmentDetailsPage.module.css'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faCalendarAlt, 
    faClock, 
    faUser,
    faPhone, 
    faNotesMedical, 
    faMapMarkerAlt, 
    faBirthdayCake, 
    faVenusMars,
    faArrowLeft,
    faEdit,
    faRulerVertical,
    faWeight,
    faUsers,
    faPray
} from '@fortawesome/free-solid-svg-icons'
import { getAppointmentDetails, getMyAppointment, updateAppointment } from '../../../services'
import { calculateAge, formatBirthdate, formatDate, getAppointmentStatusClass, getMiddleNameInitial } from '../../../utils'
import { Appointment, AppointmentFormData, AppointmentResponse } from '../../../types'
import { Header, Main, Modal } from '../../../components'
import { toast } from 'sonner'

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFormData & { id?: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [patients, setPatients] = useState<Array<{ id: string; firstName: string }>>([]);
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
                                firstName: appointment.patientId.firstName
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

    const handleUpdateClick = (appointment: Appointment | AppointmentResponse) => {
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

    const headerActions = [
        {
            label: 'Edit',
            icon: faEdit,
            onClick: () => handleUpdateClick(appointment),
            type: 'primary' as const
        }
    ];

    const backButton = {
        icon: faArrowLeft,
        onClick: () => window.history.back()
    };

  return (
    <Main loading={loading} error={error} loadingMessage='Loading appointment details...'>
        <Header
            title='Appointment Details'
            backButton={backButton}
            actions={headerActions}
        />

        <div className={styles.appStatusBanner}>
            <div className={styles.appointmentNumber}>
                Appointment #{appointment.appointmentNumber}
            </div>
            <div className={`${styles.statusBadge} ${getAppointmentStatusClass(appointment.status, styles)}`}>
                {appointment.status}
            </div>
        </div>

        {/* single comprehensive appointment details table */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.cardIcon} />
                <h2>Complete Appointment Details</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    {/* appointment sex */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Appointment Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faCalendarAlt} /> Preferred Date:
                            </span>
                            <span className={styles.tableValue}>{formatDate(appointment.preferredDate)}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faClock} /> Preferred Time:
                            </span>
                            <span className={styles.tableValue}>{appointment.preferredTime}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faNotesMedical} /> Reason for Visit:
                            </span>
                            <span className={styles.tableValue}>{appointment.reasonForVisit}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Created On:</span>
                            <span className={styles.tableValue}>
                                {new Date(appointment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        {
                            appointment.updatedAt !== appointment.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {new Date(appointment.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            )
                        }
                    </div>

                    {/* patient details information */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <FontAwesomeIcon icon={faUser} /> Patient Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faUser} /> Full Name:
                            </span>
                            <span className={styles.tableValue}>
                                {appointment.firstName}, {appointment.lastName}
                                {appointment.middleName ? `, ${getMiddleNameInitial(appointment.middleName)}` : ''}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faBirthdayCake} /> Birthdate:
                            </span>
                            <span className={styles.tableValue}>
                                {formatBirthdate(appointment.birthdate)} 
                                <span className={styles.ageLabel}>({calculateAge(appointment.birthdate)} years)</span>
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faVenusMars} /> Sex:
                            </span>
                            <span className={styles.tableValue}>{appointment.sex}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faPhone} /> Contact Number:
                            </span>
                            <span className={styles.tableValue}>{appointment.contactNumber}</span>
                        </div>
                        
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                            </span>
                            <span className={styles.tableValue}>{appointment.address}</span>
                        </div>
                    </div>

                    {/* medical informations sec*/}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <FontAwesomeIcon icon={faNotesMedical} /> Medical Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faRulerVertical} /> Height:
                            </span>
                            <span className={styles.tableValue}>{appointment.height} cm</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faWeight} /> Weight:
                            </span>
                            <span className={styles.tableValue}>{appointment.weight} kg</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faPray} /> Religion:
                            </span>
                            <span className={styles.tableValue}>{appointment.religion}</span>
                        </div>
                    </div>

                    {/* family info sex */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <FontAwesomeIcon icon={faUsers} /> Family Information
                        </h3>
                        
                        {/* mother's info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Mother's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <FontAwesomeIcon icon={faUser} /> Name:
                                </span>
                                <span className={styles.tableValue}>{appointment.motherInfo?.name}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{appointment.motherInfo?.age} years</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>
                                    {appointment.motherInfo?.occupation === 'n/a' ? 'Not specified' : appointment.motherInfo?.occupation}
                                </span>
                            </div>
                        </div>
                        
                        {/* father info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Father's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <FontAwesomeIcon icon={faUser} /> Name:
                                </span>
                                <span className={styles.tableValue}>{appointment.fatherInfo?.name}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{appointment.fatherInfo?.age} years</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>{appointment.fatherInfo?.occupation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    modalType="appointment"
                    onSubmit={handleSubmitUpdate}
                    patients={patients}
                    editData={selectedAppointment}
                />
            )
        }
    </Main>
  )
}

export default AppointmentDetailsPage