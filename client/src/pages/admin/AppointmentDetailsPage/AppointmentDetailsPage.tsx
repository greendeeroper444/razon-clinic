import { useEffect } from 'react'
import styles from './AppointmentDetailsPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Notebook, MapPin, Cake, Venus, ArrowLeft, Edit, CheckCircle, Ruler, Weight, Users, Hand, Thermometer, HeartPulse } from 'lucide-react';
import { calculateAge, formatBirthdate, formatDate, formatTime, getStatusClass, getLoadingText, formatDateTime } from '../../../utils';
import { Main, Header, Modal, SubmitLoading } from '../../../components';
import { AppointmentFormData, FormDataType } from '../../../types';
import { useAppointmentStore } from '../../../stores';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    //zustand store selectors
    const {
        currentAppointment,
        submitLoading,
        loading,
        error,
        selectedAppointment,
        isModalUpdateOpen,
        isModalStatusOpen,
        fetchAppointmentById,
        updateAppointmentData,
        updateAppointmentStatus,
        openModalUpdate,
        closeModalUpdate,
        openModalStatus,
        closeModalStatus,
        clearCurrentAppointment,
        currentOperation
    } = useAppointmentStore();

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentById(appointmentId);
        }

        //cleanup when component unmounts
        return () => {
            clearCurrentAppointment()
        }
    }, [appointmentId])

    const handleUpdateStatusClick = () => {
        if (currentAppointment) {
            openModalStatus(currentAppointment);
        }
    };

    const handleAppointmentUpdateClick = () => {
        if (currentAppointment) {
            openModalUpdate(currentAppointment)
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
    

    const handleSubmitStatusUpdate = async (data: string | FormDataType | { status: any }): Promise<void> => {
        if (typeof data === 'string' || !('status' in data)) {
            console.error('Invalid status data')
            return
        }

        if (!appointmentId) {
            console.error('Missing appointment ID')
            return
        }

        await updateAppointmentStatus(appointmentId, data.status);

        if (data.status === 'Referred' && currentAppointment) {
            // setTimeout(() => {
            //     navigate('/admin/patients');
            // }, 1000);
            setTimeout(() => {
                navigate('/admin/patients', {
                    state: {
                        highlightPatient: {
                            firstName: currentAppointment.firstName,
                            lastName: currentAppointment.lastName,
                            birthdate: currentAppointment.birthdate
                        }
                    }
                });
            }, 1000);
        }
    };

    //don't render if appointment is still loading
    if (!currentAppointment) {
        return null
    }

    const headerActions = [
        {
            label: 'Edit',
            icon: <Edit />,
            onClick: handleAppointmentUpdateClick,
            type: 'primary' as const
        },
        {
            label: 'Status',
            icon: <CheckCircle />,
            onClick: handleUpdateStatusClick,
            type: 'outline' as const
        }
    ];

    const backButton = {
        icon: <ArrowLeft />,
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
            <div className={`${styles.statusBadge} ${getStatusClass(currentAppointment.status, styles)}`}>
                {currentAppointment.status}
            </div>
        </div>

        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <Calendar className={styles.cardIcon} />
                <h2>Complete Appointment Details</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    {/* appointment sex */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Calendar /> Appointment Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Calendar /> Preferred Date:
                            </span>
                            <span className={styles.tableValue}>{formatDate(currentAppointment.preferredDate)}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Clock/> Preferred Time:
                            </span>
                            <span className={styles.tableValue}>{formatTime(currentAppointment.preferredTime)}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Notebook /> Reason for Visit:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.reasonForVisit}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Created On:</span>
                            <span className={styles.tableValue}>
                                {formatDateTime(String(currentAppointment.createdAt))}
                            </span>
                        </div>
                        {
                            currentAppointment.updatedAt !== currentAppointment.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {formatDateTime(String(currentAppointment.updatedAt))}
                                    </span>
                                </div>
                            )
                        }
                    </div>

                    {/* patient details information */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <User /> Child Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <User /> Full Name:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment.firstName}, {currentAppointment.lastName},
                                {/* {currentAppointment.middleName ? `, ${getMiddleNameInitial(currentAppointment.middleName)}` : ''} */} {currentAppointment.middleName} {currentAppointment.suffix}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Cake /> Birthdate:
                            </span>
                            <span className={styles.tableValue}>
                                {formatBirthdate(String(currentAppointment.birthdate))} 
                                <span className={styles.ageLabel}>({calculateAge(String(currentAppointment.birthdate))} years)</span>
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Venus /> Sex:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.sex}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Phone /> Contact Number:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.contactNumber}</span>
                        </div>
                        
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <MapPin /> Address:
                            </span>
                            <span className={styles.tableValue}>{currentAppointment.address}</span>
                        </div>

                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Hand /> Religion:
                            </span>
                            {currentAppointment?.religion || 'N/A'}
                        </div>
                    </div>

                    {/* medical informations sec*/}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Notebook /> Medical Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Ruler /> Height:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.height ? `${currentAppointment.height} cm` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Weight /> Weight:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.weight ? `${currentAppointment.weight} kg` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Thermometer /> Temperature:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.temperature ? `${currentAppointment.temperature} °C` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <HeartPulse /> Blood Pressure:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.bloodPressure?.systolic && currentAppointment?.bloodPressure?.diastolic
                                    ? `${currentAppointment.bloodPressure.systolic}/${currentAppointment.bloodPressure.diastolic} mmHg`
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* family info sex */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Users /> Family Information
                        </h3>
                        
                        {/* mother's info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Mother's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                {currentAppointment?.motherInfo?.name || 'N/A'}
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                {currentAppointment?.motherInfo?.age || 'N/A'}
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                {currentAppointment?.motherInfo?.occupation || 'N/A'}
                            </div>
                        </div>
                        
                        {/* father info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Father's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                {currentAppointment?.fatherInfo?.name || 'N/A'}
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                {currentAppointment?.fatherInfo?.age || 'N/A'}
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                {currentAppointment?.fatherInfo?.occupation || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {
            isModalStatusOpen && (
                <Modal
                    isOpen={isModalStatusOpen}
                    onClose={closeModalStatus}
                    modalType='status'
                    onSubmit={handleSubmitStatusUpdate}
                    editData={selectedAppointment}
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

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'appointment')}
            size='medium'
            variant='overlay'
        />

    </Main>
  )
}

export default AppointmentDetailsPage