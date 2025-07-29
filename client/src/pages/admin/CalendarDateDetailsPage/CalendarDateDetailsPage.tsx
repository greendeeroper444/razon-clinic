import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, User, Phone, MapPin, Calendar, Eye, AlertCircle } from 'lucide-react'
import styles from './CalendarDateDetailsPage.module.css'
import { getAppointmentsByDate } from '../../../services'
import { Appointment, AppointmentDataCalendar } from '../../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { formatDateWithDay, formatTime, getStatusColor } from '../../../utils'


const CalendarDateDetailsPage: React.FC = () => {
    const [appointmentData, setAppointmentData] = useState<AppointmentDataCalendar | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    //get date from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const selectedDate: string | null = urlParams.get('date');

    useEffect(() => {
        if (selectedDate) {
            fetchAppointmentDetails();
        }
    }, [selectedDate]);

    const fetchAppointmentDetails = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getAppointmentsByDate(selectedDate!);

            if (response.data.success) {
                //map AppointmentResponse to Appointment (middleName: string | null -> string | undefined)
                const mappedTimeSlots: { [key: string]: Appointment[] } = {};
                Object.entries(response.data.timeSlots).forEach(([slot, appointments]) => {
                    mappedTimeSlots[slot] = appointments.map((appointment: any) => ({
                        ...appointment,
                        middleName: appointment.middleName ?? undefined,
                    }));
                });


                setAppointmentData({
                    ...response.data,
                    timeSlots: mappedTimeSlots,
                });
            } else {
                setError('Failed to fetch appointment details');
            }
        } catch (err) {
            console.error('Error fetching appointment details:', err);
            setError('Error loading appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = (): void => {
        navigate(-1);
    };

    const handleViewAppointment = (appointmentId: string): void => {
        navigate(`/admin/appointments/details/${appointmentId}`);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <AlertCircle size={48} />
                    <h3>Error Loading Appointments</h3>
                    <p>{error}</p>
                    <button 
                        type='button'
                        onClick={handleBack} className={styles.backButton}>
                        <ChevronLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedDate) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <AlertCircle size={48} />
                    <h3>Invalid Date</h3>
                    <p>No date selected. Please select a date to view appointments.</p>
                    <button 
                        type='button'
                        onClick={handleBack} className={styles.backButton}>
                        <ChevronLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
           <div className={styles.headerLeft}>
                <button
                    type='button'
                    className={styles.btnBack}
                    onClick={() => window.history.back()}
                    title='Go Back'
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className={styles.contentTitle}>Appointment Calendar Details</h1>
            </div>
        </div>

        {/* date header */}
        <div className={styles.dateHeader}>
            <div className={styles.dateIcon}>
                <Calendar size={24} />
            </div>
            <div className={styles.dateInfo}>
                <h2 className={styles.selectedDate}>
                    {formatDateWithDay(selectedDate)}
                </h2>
                <p className={styles.appointmentSummary}>
                    {appointmentData?.totalAppointments || 0} appointment(s) scheduled
                </p>
            </div>
        </div>

        {/* appoinment list */}
        <div className={styles.appointmentsContainer}>
            {
                appointmentData?.totalAppointments === 0 ? (
                    <div className={styles.noAppointments}>
                        <Calendar size={64} />
                        <h3>No appointments scheduled</h3>
                        <p>There are no appointments scheduled for this date.</p>
                    </div>
                ) : (
                    appointmentData?.availableTimeSlots.map((timeSlot: string) => (
                        <div key={timeSlot} className={styles.timeSlotSection}>
                            <div className={styles.timeSlotHeader}>
                                <div className={styles.timeSlotTitle}>
                                    <Clock size={18} />
                                    <h3>{formatTime(timeSlot)}</h3>
                                </div>
                                <span className={styles.appointmentCount}>
                                    {appointmentData.timeSlots[timeSlot].length} appointment(s)
                                </span>
                            </div>
                            
                            <div className={styles.appointmentsList}>
                                {
                                    appointmentData.timeSlots[timeSlot].map((appointment: Appointment) => (
                                        <div key={appointment.id} className={styles.appointmentCard}>
                                            <div className={styles.appointmentHeader}>
                                                <div className={styles.patientInfo}>
                                                    <div className={styles.patientAvatar}>
                                                        <User size={16} />
                                                    </div>
                                                    <div className={styles.patientDetails}>
                                                        <span className={styles.patientName}>
                                                            {appointment.firstName} {appointment.middleName} {appointment.lastName}
                                                        </span>
                                                        <span className={styles.appointmentNumber}>
                                                            #{appointment.appointmentNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.appointmentActions}>
                                                    <div 
                                                        className={styles.statusBadge}
                                                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                                                    >
                                                        {appointment.status}
                                                    </div>
                                                    <button 
                                                        type='button'
                                                        onClick={() => handleViewAppointment(appointment.id)}
                                                        className={styles.viewButton}
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className={styles.appointmentDetails}>
                                                <div className={styles.detailRow}>
                                                    <strong>Reason:</strong> 
                                                    <span>{appointment.reasonForVisit}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Phone size={14} />
                                                    <span>{appointment.contactNumber}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <MapPin size={14} />
                                                    <span>{appointment.address}</span>
                                                </div>
                                                {
                                                    appointment.patientId && (
                                                        <div className={styles.detailRow}>
                                                            <strong>User ID:</strong> 
                                                            <span>{appointment.patientId.patientNumber}</span>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    </div>
  )
}

export default CalendarDateDetailsPage