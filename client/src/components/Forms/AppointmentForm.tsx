import React, { useState, useEffect } from 'react'
import { AppointmentFormProps } from '../../types/appointment'
import styles from '../ModalComponent/ModalComponent.module.css'
import { getAppointments } from '../../pages/services/appoinmentService';

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
}) => {
    const [bookedSlots, setBookedSlots] = useState<{date: string, time: string, time12Hour?: string}[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    //convert 24-hour format to 12-hour format for comparison
    const convertTo12HourFormat = (time24: string) => {
        if (!time24 || !time24.includes(':')) return time24;
        
        const [hourStr, minuteStr] = time24.split(':');
        let hour = parseInt(hourStr);
        const minute = minuteStr || '00';
        
        if (hour === 0) {
            return `12:${minute} AM`;
        } else if (hour < 12) {
            return `${hour}:${minute} AM`;
        } else if (hour === 12) {
            return `12:${minute} PM`;
        } else {
            return `${hour - 12}:${minute} PM`;
        }
    };

    //convert 12-hour format to 24-hour format for comparison
    const convertTo24HourFormat = (time12: string) => {
        if (!time12 || !time12.includes(' ')) return time12;
        
        const [timeStr, period] = time12.split(' ');
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr);
        const minute = minuteStr || '00';
        
        if (period === 'AM') {
            if (hour === 12) hour = 0;
        } else {
            if (hour !== 12) hour += 12;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    };

    //generate available time slots (8:00 AM to 5:00 PM)
    const generateTimeSlots = () => {
        const slots = [];
        
        //generate AM slots (8:00 AM to 11:00 AM)
        for (let hour = 8; hour <= 11; hour++) {
            slots.push(`${hour}:00 AM`);
        }
        
        slots.push(`12:00 PM`); //noon

        //generate PM slots (1:00 PM to 5:00 PM)
        for (let hour = 1; hour <= 5; hour++) {
            slots.push(`${hour}:00 PM`);
        }
        
        return slots;
    };

    //fetch existing appointments to check for conflicts
    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const response = await getAppointments();
                if (response.data.success) {
                    const appointments = response.data.data;
                    const slots = appointments
                        .filter(apt => apt.status !== 'Cancelled') //exclude cancelled appointments
                        .map(apt => ({
                            date: new Date(apt.preferredDate).toISOString().split('T')[0],
                            time: apt.preferredTime,
                            time12Hour: convertTo12HourFormat(apt.preferredTime) //convert to 12-hour format
                        }));
                    setBookedSlots(slots);
                }
            } catch (error) {
                console.error('Error fetching booked slots:', error);
            }
        };

        fetchBookedSlots();
    }, []);

    //update available times when date changes
    useEffect(() => {
        if (formData?.preferredDate) {
            const selectedDate = formData.preferredDate;
            const allTimes = generateTimeSlots();
            
            //filter out booked times for the selected date
            const bookedTimesForDate = bookedSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); //12-hour format for comparison
            
            const available = allTimes.filter(time => !bookedTimesForDate.includes(time));
            setAvailableTimes(available);
        } else {
            setAvailableTimes(generateTimeSlots());
        }
    }, [formData?.preferredDate, bookedSlots]);

    //check if a date has any available times
    const isDateAvailable = (dateString: string) => {
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === dateString)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); //12-hour format
        
        const allTimes = generateTimeSlots();
        return allTimes.some(time => !bookedTimesForDate.includes(time));
    };

    //check if a specific time is available for the selected date
    const isTimeAvailable = (time: string) => {
        if (!formData?.preferredDate) return true;
        
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === formData.preferredDate)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); //12-hour format for comparison
        
        return !bookedTimesForDate.includes(time);
    };

    //handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        
        //first update the date
        onChange(e);
        
        //check if the selected date has available times
        if (selectedDate && !isDateAvailable(selectedDate)) {
            //don't prevent the change, just show warning
            return;
        }
        
        //clear the time if it's no longer available for the new date
        if (formData?.preferredTime && selectedDate) {
            const bookedTimesForDate = bookedSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); //12-hour format
            
            if (bookedTimesForDate.includes(formData.preferredTime)) {
                //clear the time selection
                onChange({ target: { name: 'preferredTime', value: '' } } as any);
            }
        }
    };

    //handle time change - prevent selection of unavailable times
    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTime = e.target.value;
        
        //if the selected time is not available, don't allow the change
        if (selectedTime && !isTimeAvailable(selectedTime)) {
            e.preventDefault();
            return;
        }
        
        onChange(e);
    };

  return (
    <div className={styles.sectionDivider}>
        <h4>Patient Information</h4>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='firstName'>First Name *</label>
                <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={formData?.firstName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Patient's first name"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='lastName'>Last Name *</label>
                <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={formData?.lastName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Patient's last name"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='middleName'>Middle Name (Optional)</label>
                <input
                    type='text'
                    id='middleName'
                    name='middleName'
                    value={formData?.middleName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Patient's middle name (optional)"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='birthdate'>Birth Date *</label>
                <input
                    type='date'
                    id='birthdate'
                    name='birthdate'
                    value={formData?.birthdate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='sex'>Sex *</label>
                <select
                    id='sex'
                    name='sex'
                    value={formData?.sex || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                >
                    <option value=''>Select Sex</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                </select>
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='height'>Height (cm)</label>
                <input
                    type='number'
                    id='height'
                    name='height'
                    value={formData?.height || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={30}
                    max={300}
                    placeholder="Height in cm"
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='weight'>Weight (kg)</label>
                <input
                    type='number'
                    id='weight'
                    name='weight'
                    value={formData?.weight || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={1}
                    max={500}
                    placeholder="Weight in kg"
                    disabled={isLoading}
                />
            </div>
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='religion'>Religion</label>
            <input
                type='text'
                id='religion'
                name='religion'
                value={formData?.religion || ''}
                onChange={onChange}
                className={styles.formControl}
                maxLength={30}
                placeholder="Religion (optional)"
                disabled={isLoading}
            />
        </div>

        {/* mother's information */}
        <div className={styles.sectionDivider}>
            <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='motherName'>Mother's Name</label>
                    <input
                        type='text'
                        id='motherName'
                        name='motherName'
                        value={formData?.motherName || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        maxLength={50}
                        placeholder="Mother's full name"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='motherAge'>Mother's Age</label>
                    <input
                        type='number'
                        id='motherAge'
                        name='motherAge'
                        value={formData?.motherAge || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        min={15}
                        max={120}
                        placeholder="Age"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='motherOccupation'>Mother's Occupation</label>
                <input
                    type='text'
                    id='motherOccupation'
                    name='motherOccupation'
                    value={formData?.motherOccupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    maxLength={50}
                    placeholder="Mother's occupation"
                    disabled={isLoading}
                />
            </div>
        </div>

        {/* father's information */}
        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='fatherName'>Father's Name</label>
                    <input
                        type='text'
                        id='fatherName'
                        name='fatherName'
                        value={formData?.fatherName || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        maxLength={50}
                        placeholder="Father's full name"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='fatherAge'>Father's Age</label>
                    <input
                        type='number'
                        id='fatherAge'
                        name='fatherAge'
                        value={formData?.fatherAge || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        min={15}
                        max={120}
                        placeholder="Age"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='fatherOccupation'>Father's Occupation</label>
                <input
                    type='text'
                    id='fatherOccupation'
                    name='fatherOccupation'
                    value={formData?.fatherOccupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    maxLength={50}
                    placeholder="Father's occupation"
                    disabled={isLoading}
                />
            </div>
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='contactNumber'>Contact Number *</label>
            <input
                type='number'
                id='contactNumber'
                name='contactNumber'
                value={formData?.contactNumber || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                disabled={isLoading}
                placeholder='Enter contact number'
            />
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='address'>Address *</label>
            <input
                type='text'
                id='address'
                name='address'
                value={formData?.address || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                disabled={isLoading}
                placeholder="Enter address"
                title="Address"
            />
        </div>

        {/* appointment details */}
        <h4>Appointment Details</h4>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='preferredDate'>Preferred Date *</label>
                <input
                    type='date'
                    id='preferredDate'
                    name='preferredDate'
                    value={formData?.preferredDate || ''}
                    onChange={handleDateChange}
                    className={styles.formControl}
                    min={new Date().toISOString().split('T')[0]} //prevent past dates
                    required
                    disabled={isLoading}
                />
                {
                    formData?.preferredDate && !isDateAvailable(formData.preferredDate) && (
                        <small style={{ color: 'red' }}>
                            This date is fully booked. Please select another date.
                        </small>
                    )
                }
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='preferredTime'>Preferred Time *</label>
                <select
                    id='preferredTime'
                    name='preferredTime'
                    value={formData?.preferredTime || ''}
                    onChange={handleTimeChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading || !formData?.preferredDate}
                    style={{
                        position: 'relative'
                    }}
                >
                    <option value=''>Select Time</option>
                    {
                        generateTimeSlots().map(time => {
                            const isAvailable = isTimeAvailable(time);
                            return (
                                <option 
                                    key={time} 
                                    value={time}
                                    disabled={!isAvailable}
                                    style={{
                                        color: isAvailable ? 'inherit' : '#999',
                                        backgroundColor: isAvailable ? 'inherit' : '#f5f5f5',
                                        cursor: isAvailable ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {time} {!isAvailable ? '(Not Available)' : ''}
                                </option>
                            );
                        })
                    }
                </select>
                {
                    formData?.preferredDate && availableTimes.length === 0 && (
                        <small style={{ color: 'red' }}>
                            No available times for this date.
                        </small>
                    )
                }
            </div>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor='reasonForVisit'>Reason for Visit *</label>
            <textarea
                id='reasonForVisit'
                name='reasonForVisit'
                value={formData?.reasonForVisit || ''}
                onChange={onChange}
                className={styles.formControl}
                rows={4}
                minLength={5}
                maxLength={200}
                placeholder="Please describe the reason for your visit (5-200 characters)"
                required
                disabled={isLoading}
            ></textarea>
            <small className={styles.charCount}>
                {(formData?.reasonForVisit || '').length}/200 characters
            </small>
        </div>

        {/* add custom styles for better visual feedback */}
        <style jsx>{`
            select option:disabled {
                color: #999 !important;
                background-color: #f5f5f5 !important;
                font-style: italic;
            }
            
            select:focus option:disabled {
                color: #999 !important;
                background-color: #f5f5f5 !important;
            }
        `}</style>
    </div>
  )
}

export default AppointmentForm