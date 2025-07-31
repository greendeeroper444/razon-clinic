import { useEffect } from 'react'
import styles from './AppointmentDetailsPage.module.css';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    faCheckCircle,
    faRulerVertical,
    faWeight,
    faUsers,
    faPray
} from '@fortawesome/free-solid-svg-icons';
import { calculateAge, formatBirthdate, formatDate, formatTime, getAppointmentStatusClass, getMiddleNameInitial } from '../../../utils';
import { Main, Header, Modal } from '../../../components';
import { AppointmentFormData, FormDataType } from '../../../types';
import { useAppointmentStore } from '../../../stores';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams()
    
    //zustand store selectors
    const {
        currentAppointment,
        patients,
        loading,
        error,
        selectedAppointment,
        isModalOpen,
        isStatusModalOpen,
        fetchAppointmentById,
        fetchMyAppointments,
        updateAppointmentData,
        updateAppointmentStatus,
        openUpdateModal,
        closeUpdateModal,
        openStatusModal,
        closeStatusModal,
        clearCurrentAppointment
    } = useAppointmentStore()

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentById(appointmentId)
            fetchMyAppointments() //for patient dropdown in modal
        }

        //cleanup when component unmounts
        // return () => {
        //     clearCurrentAppointment()
        // }
    }, [appointmentId, fetchAppointmentById, fetchMyAppointments, clearCurrentAppointment])

    const handleUpdateStatusClick = () => {
        if (currentAppointment) {
            openStatusModal(currentAppointment);
        }
    };

    const handleAppointmentUpdateClick = () => {
        if (currentAppointment) {
            openUpdateModal(currentAppointment)
        }
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID')
            return
        }

        //assertion since we know it's AppointmentFormData in this context
        const appointmentData = data as AppointmentFormData

        await updateAppointmentData(selectedAppointment.id, appointmentData)
    }
    

    const handleSubmitStatusUpdate = async (data: { status: string }): Promise<void> => {
        if (!appointmentId) {
            console.error('Missing appointment ID')
            return
        }

        await updateAppointmentStatus(appointmentId, data.status);
    };

    //don't render if appointment is still loading
    if (!currentAppointment) {
        return null
    }

    const headerActions = [
        {
            label: 'Edit',
            icon: faEdit,
            onClick: handleAppointmentUpdateClick,
            type: 'primary' as const
        },
        {
            label: 'Status',
            icon: faCheckCircle,
            onClick: handleUpdateStatusClick,
            type: 'outline' as const
        }
    ];

    const backButton = {
        icon: faArrowLeft,
        onClick: () => window.history.back()
    };

  return (
    <Main loading={loading} loadingType='spinner' error={error} loadingMessage='Loading appointment details...'>
        <Header
            title='Appointment Details'
            backButton={backButton}
            actions={headerActions}
        />

        <div className={styles.appStatusBanner}>
            <div className={styles.appointmentNumber}>
                Appointment #{currentAppointment.appointmentNumber}
            </div>
            <div className={`${styles.statusBadge} ${getAppointmentStatusClass(currentAppointment.status, styles)}`}>
                {currentAppointment.status}
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
                            <span className={styles.tableValue}>{formatDate(currentAppointment.preferredDate)}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faClock} /> Preferred Time:
                            </span>
                            <span className={styles.tableValue}>{formatTime(currentAppointment.preferredTime)}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faNotesMedical} /> Reason for Visit:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.reasonForVisit}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Created On:</span>
                            <span className={styles.tableValue}>
                                {new Date(String(currentAppointment.createdAt)).toLocaleString()}
                            </span>
                        </div>
                        {
                            currentAppointment.updatedAt !== currentAppointment.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {new Date(String(currentAppointment.updatedAt)).toLocaleString()}
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
                                {currentAppointment.firstName}, {currentAppointment.lastName}
                                {currentAppointment.middleName ? `, ${getMiddleNameInitial(currentAppointment.middleName)}` : ''}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faBirthdayCake} /> Birthdate:
                            </span>
                            <span className={styles.tableValue}>
                                {formatBirthdate(String(currentAppointment.birthdate))} 
                                <span className={styles.ageLabel}>({calculateAge(String(currentAppointment.birthdate))} years)</span>
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faVenusMars} /> Sex:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.sex}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faPhone} /> Contact Number:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.contactNumber}</span>
                        </div>
                        
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.address}</span>
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
                            <span className={styles.tableValue}>{currentAppointment.height} cm</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faWeight} /> Weight:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.weight} kg</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faPray} /> Religion:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.religion}</span>
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
                                <span className={styles.tableValue}>{currentAppointment.motherInfo?.name}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{currentAppointment.motherInfo?.age} years</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>
                                    {currentAppointment.motherInfo?.occupation === 'n/a' ? 'Not specified' : currentAppointment.motherInfo?.occupation}
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
                                <span className={styles.tableValue}>{currentAppointment.fatherInfo?.name}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{currentAppointment.fatherInfo?.age} years</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>{currentAppointment.fatherInfo?.occupation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* update appointment status modal */}
        {
            isStatusModalOpen && (
                <Modal
                    isOpen={isStatusModalOpen}
                    onClose={closeStatusModal}
                    modalType='status'
                    onSubmit={handleSubmitStatusUpdate}
                    editData={selectedAppointment}
                    isProcessing={loading}
                />
            )
        }


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
                />
            )
        }

    </Main>
  )
}

export default AppointmentDetailsPage