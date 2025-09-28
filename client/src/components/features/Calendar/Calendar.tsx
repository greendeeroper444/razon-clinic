import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './Calendar.module.css'
import { getCalendarAppointments } from '../../../services'
import { Appointment, AppointmentCounts } from '../../../types'

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentCounts, setAppointmentCounts] = useState<AppointmentCounts>({});
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const months: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekdays: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    useEffect(() => {
        fetchAppointments();
    }, [currentDate]);

    const fetchAppointments = async (): Promise<void> => {
        try {
            setLoading(true);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const fromDate = startOfMonth.toISOString().split('T')[0];
            const toDate = endOfMonth.toISOString().split('T')[0];

            const response = await getCalendarAppointments(fromDate, toDate);
            
            if (response.success) {
                const appointmentData = response.data.appointments || [];
                setAppointments(appointmentData);
                calculateAppointmentCounts(appointmentData);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAppointmentCounts = (appointmentData: Appointment[]): void => {
        const counts: AppointmentCounts = {};
        
        appointmentData.forEach(appointment => {
            const dateString = String(appointment.preferredDate).split('T')[0];
          
            if (counts[dateString]) {
                counts[dateString]++;
            } else {
                counts[dateString] = 1;
            }
        });
        
        setAppointmentCounts(counts);
    };

    const getDaysInMonth = (date: Date): (number | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        //get the day of the week for the first day (0 = sunday, 1 = monday, etc.)
        // convert to monday = 0, sunday = 6
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
        
        const days: (number | null)[] = [];
        
        //empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        
        //days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    };

    const navigateMonth = (direction: number): void => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getDateKey = (day: number | null): string | null => {
        if (!day) return null;
        
        //create date in local timezone to avoid timezone conversion issues
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, day);
        
        //format as yyyy-mm-dd
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        return dateKey;
    };

    const hasAppointments = (day: number | null): boolean => {
        const dateKey = getDateKey(day);
        return dateKey !== null && appointmentCounts[dateKey] > 0;
    };

    const getAppointmentCount = (day: number | null): number => {
        const dateKey = getDateKey(day);
        return dateKey ? appointmentCounts[dateKey] || 0 : 0;
    };

    const handleDateClick = (day: number | null): void => {
        if (!day) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        navigate(`/admin/calendar-date-details?date=${dateString}`);
    };

    const days = getDaysInMonth(currentDate);

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarTitle}>
                Appointment Calendar
            </div>
            
            <div className={styles.calendarHeader}>
                <button
                    onClick={() => navigateMonth(-1)}
                    className={styles.navButton}
                    disabled={loading}
                    type="button"
                    title='Prev Button'
                >
                    <ChevronLeft size={16} />
                </button>
                
                <h2 className={styles.monthTitle}>
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                    onClick={() => navigateMonth(1)}
                    className={styles.navButton}
                    disabled={loading}
                    type="button"
                    title='Next Button'
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className={styles.weekdayGrid}>
                {
                    weekdays.map((day) => (
                        <div key={day} className={styles.weekdayCell}>
                            {day}
                        </div>
                    ))
                }
            </div>

            <div className={styles.calendarGrid}>
                {
                    days.map((day, index) => {
                        const appointmentCount = getAppointmentCount(day);
                        const hasAppointment = hasAppointments(day);
                        
                        return (
                            <div
                                key={index}
                                className={`${styles.dayCell} ${
                                    !day 
                                        ? styles.emptyCell 
                                        : hasAppointment
                                            ? styles.appointmentDay
                                            : styles.normalDay
                                } ${day ? styles.clickableDay : ''}`}
                                onClick={() => handleDateClick(day)}
                                style={{ cursor: day ? 'pointer' : 'default' }}
                                role={day ? 'button' : undefined}
                                tabIndex={day ? 0 : undefined}
                                onKeyDown={(e) => {
                                    if (day && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        handleDateClick(day);
                                    }
                                }}
                            >
                                {
                                    day && (
                                        <>
                                            <span className={styles.dayNumber}>{day}</span>
                                            {
                                                appointmentCount > 0 && (
                                                    <div className={styles.appointmentCount}>
                                                        {appointmentCount}
                                                    </div>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>
                        );
                    })
                }
            </div>

            {
                loading && (
                    <div className={styles.loadingState}>
                        Loading...
                    </div>
                )
            }
        </div>
    )
}

export default Calendar