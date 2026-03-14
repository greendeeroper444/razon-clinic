import { useEffect } from 'react'
import styles from './AppointmentDetailsPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Notebook, MapPin, Cake, Venus, ArrowLeft, Edit, CheckCircle, Ruler, Weight, Users, Hand, Thermometer, HeartPulse, XCircle, AlertTriangle } from 'lucide-react';
import { calculateAge, formatBirthdate, formatDate, formatTime, getStatusClass, getLoadingText, formatDateTime } from '../../../utils';
import { Main, Header, Modal, SubmitLoading } from '../../../components';
import { AppointmentFormData, FormDataType } from '../../../types';
import { useAppointmentStore } from '../../../stores';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

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
        approveCancellation,
        rejectCancellation,
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
        return () => {
            clearCurrentAppointment();
        };
    }, [appointmentId]);

    const handleUpdateStatusClick = () => {
        if (currentAppointment) {
            openModalStatus(currentAppointment);
        }
    };

    const handleAppointmentUpdateClick = () => {
        if (currentAppointment) {
            openModalUpdate(currentAppointment);
        }
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedAppointment?.id) {
            console.error('Invalid data or missing appointment ID');
            return;
        }
        const appointmentData = data as AppointmentFormData;
        await updateAppointmentData(selectedAppointment.id, appointmentData);
    };

    const handleSubmitStatusUpdate = async (data: string | FormDataType | { status: any }): Promise<void> => {
        if (typeof data === 'string' || !('status' in data)) {
            console.error('Invalid status data');
            return;
        }
        if (!appointmentId) {
            console.error('Missing appointment ID');
            return;
        }
        await updateAppointmentStatus(appointmentId, data.status);

        // if (data.status === 'Referred' && currentAppointment) {
        //     setTimeout(() => {
        //         navigate('/admin/patients', {
        //             state: {
        //                 highlightPatient: {
        //                     firstName: currentAppointment.firstName,
        //                     lastName: currentAppointment.lastName,
        //                     birthdate: currentAppointment.birthdate
        //                 }
        //             }
        //         });
        //     }, 1000);
        // }

        setTimeout(() => {
            navigate('/admin/appointments');
        }, 1000);
    };

    const handleApproveCancellation = async () => {
        if (!appointmentId) return;
        await approveCancellation(appointmentId);
    };

    const handleRejectCancellation = async () => {
        if (!appointmentId) return;
        // Revert to Scheduled by default; adjust if you store the previous status
        await rejectCancellation(appointmentId, 'Scheduled');
    };

    if (!currentAppointment) {
        return null;
    }

    const isCancelled = currentAppointment.status === 'Cancelled';
    const isCancellationRequested = currentAppointment.status === 'CancellationRequested';

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
                    {currentAppointment.status === 'CancellationRequested' ? 'Cancellation Requested' : currentAppointment.status}
                </div>
            </div>

            {/* Cancellation approval banner — shown to admin when user has requested cancellation */}
            {isCancellationRequested && (
                <div className={styles.cancellationRequestBanner}>
                    <div className={styles.cancellationRequestBannerIcon}>
                        <AlertTriangle size={22} />
                    </div>
                    <div className={styles.cancellationRequestBannerContent}>
                        <span className={styles.cancellationRequestBannerTitle}>
                            Patient Requested Cancellation
                        </span>
                        {currentAppointment.cancellationReason && (
                            <span className={styles.cancellationRequestBannerReason}>
                                Reason: {currentAppointment.cancellationReason}
                            </span>
                        )}
                        <div className={styles.cancellationRequestActions}>
                            <button
                                className={styles.approveCancelBtn}
                                onClick={handleApproveCancellation}
                                disabled={submitLoading}
                            >
                                <CheckCircle size={15} />
                                Approve Cancellation
                            </button>
                            <button
                                className={styles.rejectCancelBtn}
                                onClick={handleRejectCancellation}
                                disabled={submitLoading}
                            >
                                <XCircle size={15} />
                                Reject &amp; Revert to Scheduled
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing cancellation reason banner for already-cancelled appointments */}
            {isCancelled && currentAppointment.cancellationReason && (
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
            )}

            <div className={styles.detailsCard}>
                <div className={styles.cardHeader}>
                    <Calendar className={styles.cardIcon} />
                    <h2>Complete Appointment Details</h2>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.detailsTable}>

                        {/* Appointment information */}
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
                            {/* <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <Clock /> Preferred Time:
                                </span>
                                <span className={styles.tableValue}>{formatTime(currentAppointment.preferredTime)}</span>
                            </div> */}
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
                            {currentAppointment.updatedAt !== currentAppointment.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {formatDateTime(String(currentAppointment.updatedAt))}
                                    </span>
                                </div>
                            )}
                            {isCancelled && currentAppointment.cancellationReason && (
                                <div className={`${styles.tableRow} ${styles.cancellationRow}`}>
                                    <span className={`${styles.tableLabel} ${styles.cancellationLabel}`}>
                                        <XCircle size={14} /> Cancellation Reason:
                                    </span>
                                    <span className={`${styles.tableValue} ${styles.cancellationValue}`}>
                                        {currentAppointment.cancellationReason}
                                    </span>
                                </div>
                            )}
                            {isCancellationRequested && currentAppointment.cancellationReason && (
                                <div className={`${styles.tableRow} ${styles.cancellationRow}`}>
                                    <span className={`${styles.tableLabel} ${styles.cancellationLabel}`}>
                                        <AlertTriangle size={14} /> Requested Cancellation Reason:
                                    </span>
                                    <span className={`${styles.tableValue} ${styles.cancellationValue}`}>
                                        {currentAppointment.cancellationReason}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Child information */}
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
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <Hand /> Religion:
                                </span>
                                {currentAppointment?.religion || 'N/A'}
                            </div>
                        </div>

                        {/* Medical information */}
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

                        {/* Family information */}
                        <div className={styles.tableSection}>
                            <h3 className={styles.sectionTitle}>
                                <Users /> Family Information
                            </h3>
                            <div className={styles.familySubSection}>
                                <h4 className={styles.familyTitle}>Mother's Information</h4>
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}><User /> Name:</span>
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
                            <div className={styles.familySubSection}>
                                <h4 className={styles.familyTitle}>Father's Information</h4>
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}><User /> Name:</span>
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

            {isModalStatusOpen && (
                <Modal
                    isOpen={isModalStatusOpen}
                    onClose={closeModalStatus}
                    modalType='status'
                    onSubmit={handleSubmitStatusUpdate}
                    editData={selectedAppointment}
                    isProcessing={submitLoading}
                />
            )}

            {isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType="appointment"
                    onSubmit={handleSubmitUpdate}
                    editData={selectedAppointment}
                    isProcessing={submitLoading}
                />
            )}

            <SubmitLoading
                isLoading={submitLoading}
                loadingText={getLoadingText(currentOperation, 'appointment')}
                size='medium'
                variant='overlay'
            />
        </Main>
    );
};

export default AppointmentDetailsPage;