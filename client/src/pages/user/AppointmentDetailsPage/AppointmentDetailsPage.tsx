import { useEffect } from 'react'
import styles from './AppointmentDetailsPage.module.css'
import { useParams } from 'react-router-dom'
import { Calendar, Clock, User, Phone, Notebook, MapPin, Cake, Venus, ArrowLeft, Edit, Ruler, Weight, Users, Hand, XCircle } from 'lucide-react';
import { calculateAge, formatBirthdate, formatDate, formatTime, getStatusClass, getLoadingText, formatDateTime } from '../../../utils'
import { AppointmentFormData, FormDataType } from '../../../types'
import { Header, Main, Modal, SubmitLoading } from '../../../components'
import { useAppointmentStore } from '../../../stores'

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();

    const {
        currentAppointment,
        submitLoading,
        loading,
        error,
        selectedAppointment,
        isModalUpdateOpen,
        isModalCancelOpen,
        cancelAppointmentData,
        fetchAppointmentById,
        fetchMyAppointments,
        updateAppointmentData,
        updateAppointmentStatus,
        openModalUpdate,
        openModalCancel,
        closeModalUpdate,
        closeModalCancel,
        clearCurrentAppointment,
        currentOperation
    } = useAppointmentStore();

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentById(appointmentId);
            fetchMyAppointments({});
        }
    }, [appointmentId, fetchAppointmentById, fetchMyAppointments, clearCurrentAppointment])

    const handleUpdateClick = () => {
        if (currentAppointment) {
            openModalUpdate(currentAppointment)
        }
    }

    const handleCancelClick = () => {
        if (currentAppointment) {
            openModalCancel(currentAppointment)
        }
    }

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID')
            return
        }
        const appointmentData = data as AppointmentFormData
        await updateAppointmentData(selectedAppointment.id, appointmentData)
    }

    const handleConfirmCancel = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !cancelAppointmentData?.id) {
            console.error('Invalid data or missing appointment ID');
            return;
        }
        const { cancellationReason } = data as { cancellationReason: string };
        await updateAppointmentStatus(cancelAppointmentData.id, 'Cancelled', cancellationReason);
        // refresh the appointment details after cancellation
        if (appointmentId) {
            fetchAppointmentById(appointmentId);
        }
    }

    if (!currentAppointment) {
        return null
    }

    const isCancelled = currentAppointment.status === 'Cancelled';
    const canEdit = !['Scheduled', 'Cancelled', 'Completed'].includes(currentAppointment.status);
    const canCancel = currentAppointment.status !== 'Cancelled';

    const headerActions = [
        ...(canEdit ? [{
            label: 'Edit',
            icon: <Edit />,
            onClick: handleUpdateClick,
            type: 'primary' as const
        }] : []),
        ...(canCancel ? [{
            label: 'Cancel Appointment',
            icon: <XCircle />,
            onClick: handleCancelClick,
            type: 'danger' as const
        }] : [])
    ];

    const backButton = {
        icon: <ArrowLeft />,
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
                Appointment #{currentAppointment.appointmentNumber}
            </div>
            <div className={`${styles.statusBadge} ${getStatusClass(currentAppointment.status, styles)}`}>
                {currentAppointment.status}
            </div>
        </div>

        {/* cancellation reason highlight banner */}
        {
            isCancelled && currentAppointment.cancellationReason && (
                <div className={styles.cancellationBanner}>
                    <div className={styles.cancellationBannerIcon}>
                        <XCircle size={20} />
                    </div>
                    <div className={styles.cancellationBannerContent}>
                        <span className={styles.cancellationBannerLabel}>Reason for Cancellation</span>
                        <span className={styles.cancellationBannerReason}>
                            {currentAppointment.cancellationReason}
                        </span>
                    </div>
                </div>
            )
        }

        {/* single comprehensive appointment details table */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <Calendar className={styles.cardIcon} />
                <h2>Complete Appointment Details</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>

                    {/* appointment information section */}
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
                                <Clock /> Preferred Time:
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
                        {/* inline cancellation reason inside the details table as well */}
                        {
                            isCancelled && currentAppointment.cancellationReason && (
                                <div className={`${styles.tableRow} ${styles.cancellationRow}`}>
                                    <span className={`${styles.tableLabel} ${styles.cancellationLabel}`}>
                                        <XCircle size={14} /> Cancellation Reason:
                                    </span>
                                    <span className={`${styles.tableValue} ${styles.cancellationValue}`}>
                                        {currentAppointment.cancellationReason}
                                    </span>
                                </div>
                            )
                        }
                    </div>

                    {/* patient details section */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <User /> Child Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <User /> Full Name:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment.firstName}, {currentAppointment.lastName},{' '}
                                {currentAppointment.middleName} {currentAppointment.suffix}
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
                    </div>

                    {/* medical information section */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Notebook /> Medical Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Ruler /> Height:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.height || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Weight /> Weight:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.weight || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Hand /> Religion:
                            </span>
                            <span className={styles.tableValue}>
                                {currentAppointment?.religion || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* family information section */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Users /> Family Information
                        </h3>

                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Mother's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.motherInfo?.name || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.motherInfo?.age || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.motherInfo?.occupation || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Father's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.fatherInfo?.name || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.fatherInfo?.age || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>
                                    {currentAppointment?.fatherInfo?.occupation || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

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
            isModalCancelOpen && cancelAppointmentData && (
                <Modal
                    isOpen={isModalCancelOpen}
                    onClose={closeModalCancel}
                    modalType="cancel"
                    onSubmit={handleConfirmCancel}
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