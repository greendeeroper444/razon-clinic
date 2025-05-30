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
import { getAppointmentDetails, updateAppointmentStatus, updateAppointment, getMyAppointment } from '../../services/appoinmentService';
import { calculateAge, formatBirthdate, formatDate } from '../../../utils/formatDateTime';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import { toast } from 'sonner';
import { Appointment, AppointmentFormData } from '../../../types/appointment';
import { getMiddleNameInitial } from '../../../utils/user';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<AppointmentFormData & { id?: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [patients, setPatients] = useState<Array<{ id: string; fullName: string }>>([]);

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

    const fetchPatients = useCallback(async () => {
        try {
            //for admin, we might need a different endpoint to get all patients
            //for now, using the same endpoint but this should be updated based on your API
            const response = await getMyAppointment();
            if (response.data.success) {
                //extract unique patients from appointments for the modal dropdown
                const uniquePatients = Array.from(
                    new Map(
                        response.data.data
                            .filter(appointment => appointment.patientId?.id) 
                            .map(appointment => [
                                appointment.patientId.id,
                                {
                                    id: appointment.patientId.id,
                                    fullName: appointment.patientId.fullName || appointment.fullName || 'N/A',
                                    patientNumber: appointment.patientId.patientNumber || 'N/A'
                                }
                            ])
                    ).values()
                );
                setPatients(uniquePatients);
            } else {
                console.error('Failed to fetch patients list');
            }
        } catch (err) {
            console.error('Error fetching patients list:', err);
        }
    }, []);

    useEffect(() => {
        fetchAppointmentDetails();
        fetchPatients();
    }, [fetchAppointmentDetails, fetchPatients]);

    //function to create a custom event for appointment refresh
    const createRefreshEvent = () => {
        //create a custom event to trigger refresh
        const refreshEvent = new CustomEvent('appointment-refresh');
        window.dispatchEvent(refreshEvent);
    };

    const handleStatusClick = () => {
        if (appointment) {
            setSelectedAppointment(appointment);
            setIsStatusModalOpen(true);
        }
    };

    const handleEditClick = () => {
        if (appointment) {
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
                birthdate: appointment.birthdate ? appointment.birthdate.split('T')[0] : undefined,
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
        
            setSelectedAppointmentForEdit(formData);
            setIsEditModalOpen(true);
        }
    };

    const handleStatusModalClose = () => {
        setIsStatusModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedAppointmentForEdit(null);
    };

    const handleSubmitStatusUpdate = async (data: { status: string }) => {
        try {
            setIsUpdating(true);
            
            const response = await updateAppointmentStatus(appointmentId as string, data.status);
            
            if (response.data && response.data.success) {
                //update the local state to reflect the change
                if (appointment) {
                    setAppointment({
                        ...appointment,
                        status: data.status,
                        updatedAt: new Date().toISOString()
                    });
                }
                toast.success('Status updated successfully');
                setIsStatusModalOpen(false);
            } else {
                throw new Error(response.data?.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            setError('Failed to update appointment status');
            toast.error('Failed to update appointment status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitAppointmentUpdate = async (formData: AppointmentFormData) => {
        try {
            setIsUpdating(true);
            
            if (selectedAppointmentForEdit?.id) {
                await updateAppointment(selectedAppointmentForEdit.id, formData);
                
                //refetch appointment details
                await fetchAppointmentDetails();
                
                //create refresh event for other components
                createRefreshEvent();
                
                toast.success('Updated appointment successfully!');
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment');
        } finally {
            setIsUpdating(false);
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
                {/* <button type='button' className={styles.btnOutline}>
                    <FontAwesomeIcon icon={faPrint} /> Print
                </button> */}
                <button 
                    type='button' 
                    className={styles.btnPrimary}
                    onClick={handleEditClick}
                    disabled={isUpdating}
                >
                    <FontAwesomeIcon icon={faEdit} /> 
                    {isUpdating ? 'Updating...' : 'Edit'}
                </button>
                <button 
                    type='button' 
                    className={styles.btnOutline}
                    onClick={handleStatusClick}
                    disabled={isUpdating}
                >
                    <FontAwesomeIcon icon={faCheckCircle} /> 
                    {isUpdating ? 'Updating...' : 'Status'}
                </button>
                {/* {
                    
                    appointment.patientId && (
                        <button 
                            type='button' 
                            className={styles.btnOutline}
                            onClick={handleStatusClick}
                            disabled={isUpdating}
                        >
                            <FontAwesomeIcon icon={faCheckCircle} /> 
                            {isUpdating ? 'Updating...' : 'Status'}
                        </button>
                    )
                
                } */}
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
                        {appointment.updatedAt !== appointment.createdAt && (
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Last Updated:</span>
                                <span className={styles.tableValue}>
                                    {new Date(appointment.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
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
                            <span className={styles.tableValue}>{appointment.patientId.address}</span>
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
        
        {/* update appointment status modal */}
        {
            isStatusModalOpen && (
                <ModalComponent
                    isOpen={isStatusModalOpen}
                    onClose={handleStatusModalClose}
                    modalType='status'
                    onSubmit={handleSubmitStatusUpdate}
                    editData={selectedAppointment}
                    isProcessing={isUpdating}
                />
            )
        }

        {/* update appointment modal */}
        {
            isEditModalOpen && (
                <ModalComponent
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    modalType="appointment"
                    onSubmit={handleSubmitAppointmentUpdate}
                    patients={patients}
                    editData={selectedAppointmentForEdit}
                    isProcessing={isUpdating}
                />
            )
        }

    </div>
  )
}

export default AppointmentDetailsPage