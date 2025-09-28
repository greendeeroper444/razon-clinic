import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, User, Phone, MapPin, Calendar, Eye, ArrowLeft } from 'lucide-react'
import styles from './CalendarDateDetailsPage.module.css'
import { getAppointmentsByDate } from '../../../services'
import { Appointment, AppointmentDataCalendar, AppointmentFormData } from '../../../types'
import { formatDateWithDay, formatTime, getStatusColor } from '../../../utils'
import { Header, Main } from '../../../components'

const CalendarDateDetailsPage: React.FC = () => {
    const [appointmentData, setAppointmentData] = useState<AppointmentDataCalendar | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

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

            if (response.success) {
                const mappedTimeSlots: { [key: string]: Appointment[] } = {};
                Object.entries(response.data.timeSlots).forEach(([slot, appointments]) => {
                    mappedTimeSlots[slot] = (appointments as AppointmentFormData[]).map((appointment: any) => ({
                        ...appointment,
                        middleName: appointment.middleName ?? undefined,
                    }));
                });

                setAppointmentData({
                    success: true,
                    timeSlots: mappedTimeSlots,
                    totalAppointments: response.data.totalAppointments,
                    availableTimeSlots: response.data.availableTimeSlots,
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

    const handleViewAppointment = (appointmentId: string): void => {
        navigate(`/admin/appointments/details/${appointmentId}`);
    };

    const backButton = {
        icon: <ArrowLeft />,
        onClick: () => window.history.back()
    };

    return (
        <Main loading={loading} error={error} loadingMessage='Loading calendar details...'>
            <Header
                title='Calendar Details'
                backButton={backButton}
            />

            <div className={styles.dateHeader}>
                <div className={styles.dateIcon}>
                    <Calendar size={24} />
                </div>
                <div className={styles.dateInfo}>
                    <h2 className={styles.selectedDate}>
                        {formatDateWithDay(selectedDate!)}
                    </h2>
                    <p className={styles.appointmentSummary}>
                        {appointmentData?.totalAppointments || 0} appointment(s) scheduled
                    </p>
                </div>
            </div>

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
                                        {appointmentData.timeSlots[timeSlot]?.length || 0} appointment(s)
                                    </span>
                                </div>
                                
                                <div className={styles.appointmentsList}>
                                    {
                                        appointmentData.timeSlots[timeSlot]?.map((appointment: Appointment) => (
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
                                                               APT #{appointment.appointmentNumber}
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
                                                </div>
                                                {/* {
                                                    appointment.patientId && (
                                                        <div className={styles.detailRow}>
                                                            <strong>User sdsdID:</strong> 
                                                            <span>{appointment.patientId.patientNumber}</span>
                                                        </div>
                                                    )
                                                } */}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
        </Main>
    )
}

export default CalendarDateDetailsPage