import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './CalendarComponent.module.css'
import { getAppointments } from '../../pages/services/appoinmentService'
import { Appointment, AppointmentCounts, AppointmentFilters } from '../../types'


const CalendarComponent: React.FC = () => {
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

        //polling every 10 seconds
        // const interval = setInterval(() => {
        //     fetchAppointments();
        // }, 10000); //10 seconds

        // //cleanup interval on unmount or when currentDate changes
        // return () => clearInterval(interval);
    }, [currentDate]);

    const fetchAppointments = async (): Promise<void> => {
        try {
            setLoading(true);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const filters: AppointmentFilters = {
                fromDate: startOfMonth.toISOString().split('T')[0],
                toDate: endOfMonth.toISOString().split('T')[0]
            };

            const response = await getAppointments(filters);
            
            if (response.data.success) {
                setAppointments(response.data.data);
                calculateAppointmentCounts(response.data.data);
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
            //extract just the date part from the ISO string to avoid timezone issues
            const dateString = String(appointment.preferredDate).split('T')[0];
          
            if (counts[dateString]) {
                counts[dateString]++;
            } else {
                counts[dateString] = 1;
            }
        });
        
        console.log('Final appointment counts:', counts);
        setAppointmentCounts(counts);
    };

    const getDaysInMonth = (date: Date): (number | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        //get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
        //convert to Monday = 0, Sunday = 6
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
        
        const days: (number | null)[] = [];
        
        // add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        
        //add days of the month
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
        
        //format as YYYY-MM-DD
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

    //handle date click to navigate to details page
    const handleDateClick = (day: number | null): void => {
        if (!day) return;
        
        //create date and format manually to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        console.log(`Clicked day ${day}, navigating to date:`, dateString);
        
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

        {/* weekday headers */}
        <div className={styles.weekdayGrid}>
            {
                weekdays.map((day) => (
                    <div key={day} className={styles.weekdayCell}>
                        {day}
                    </div>
                ))
            }
        </div>

        {/* calendar grid */}
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

        {/* loading state*/}
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

export default CalendarComponent