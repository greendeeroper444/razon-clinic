import React, { useState, useEffect } from 'react'
import styles from './AppointmentForm.module.css'
import { getAppointments } from '../../../../services'
import { convertTo12HourFormat, generateTimeSlots } from '../../../../utils'
import { AppointmentFormData, AppointmentFormProps } from '../../../../types'
import Input from '../../../ui/Input/Input'
import Select, { SelectOption } from '../../../ui/Select/Select'
import TextArea from '../../../ui/TextArea/TextArea'

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
}) => {
    const [bookedSlots, setBookedSlots] = useState<{date: string, time: string, time12Hour?: string}[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    //fetch existing appointments to check for conflicts
    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const response = await getAppointments({ page: 0, limit: 0 });
                if (response.success) {
                    const appointments = response.data.appointments;
                    const slots = appointments
                        .filter((appointment: AppointmentFormData) => appointment.status !== 'Cancelled')
                        .map((appointment: AppointmentFormData) => ({
                            date: new Date(appointment.preferredDate).toISOString().split('T')[0],
                            time: appointment.preferredTime,
                            time12Hour: convertTo12HourFormat(appointment.preferredTime)
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
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
            
            const available = allTimes.filter(time => !bookedTimesForDate.includes(time));
            setAvailableTimes(available);
        } else {
            setAvailableTimes(generateTimeSlots());
        }
    }, [formData?.preferredDate, bookedSlots]);

    const getReasonError = () => {
        const reason = formData?.reasonForVisit || '';
        
        if (reason.length > 0 && reason.length < 5) {
            return 'Reason must be at least 5 characters long.';
        }
        
        if (reason.length > 200) {
            return 'Reason cannot exceed 200 characters.';
        }
        
        return undefined;
    };

    // check if a specific time is available for the selected date
    const isTimeAvailable = (time: string): boolean => {
        if (!formData?.preferredDate) return true;
        
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === formData.preferredDate)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
        
        return !bookedTimesForDate.includes(time);
    };

    const generateTimeOptions = (): SelectOption[] => {
        const allTimes = generateTimeSlots();
        
        return allTimes.map(time => {
            const isAvailable = isTimeAvailable(time);
            return {
                value: time,
                label: isAvailable ? time : `${time} (Booked)`,
                disabled: !isAvailable
            };
        });
    };

    const getTimeSelectError = () => {
        if (formData?.preferredDate && availableTimes.length === 0) {
            return 'No available times for this date. Please select another date.';
        }
        return undefined;
    };

    // check if a date has any available times
    const isDateAvailable = (dateString: string) => {
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === dateString)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
        
        const allTimes = generateTimeSlots();
        return allTimes.some(time => !bookedTimesForDate.includes(time));
    };

    //handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        
        //first update the date
        onChange(e);
        
        //clear the time if it's no longer available for the new date
        if (formData?.preferredTime && selectedDate) {
            const bookedTimesForDate = bookedSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
            
            if (bookedTimesForDate.includes(formData.preferredTime)) {
                //clear the time selection
                onChange({
                    target: {
                        name: 'preferredTime',
                        value: '',
                    }
                } as React.ChangeEvent<HTMLInputElement>);
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
        
        <Input
            type='text'
            label='First Name'
            name='firstName'
            placeholder="Patient's first name"
            value={formData?.firstName || ''}
            onChange={onChange}
        />

        <br />
        
        <Input
            type='text'
            label='Last Name'
            name='lastName'
            placeholder="Patient's last name"
            value={formData?.lastName || ''}
            onChange={onChange}
        />

        <br />

        <Input
            type='text'
            label='Middle Name (Optional)'
            name='middleName'
            placeholder="Patient's middle name (optional)"
            value={formData?.middleName || ''}
            onChange={onChange}
        />

        <br />

        <div className={styles.formRow}>
            <Input
                type='date'
                label='Birthday'
                name='birthdate'
                placeholder={formData?.birthdate ? undefined : 'Select your birthdate'}
                leftIcon='calendar'
                value={formData?.birthdate || ''}
                onChange={onChange}
                onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.type = 'date';
                }}
            />

            <Select
                label='Gender'
                name='sex'
                title='Select Gender'
                leftIcon='users'
                placeholder='Select Gender'
                value={formData?.sex || ''}
                onChange={onChange}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                ]}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                type='number'
                label='Height (cm)'
                name='height'
                placeholder="Height in cm"
                value={formData?.height || ''}
                onChange={onChange}
            />

            <Input
                type='number'
                label='Weight (kg)'
                name='weight'
                placeholder="Weight in kg"
                value={formData?.weight || ''}
                onChange={onChange}
            />
        </div>

        {/* mother's information */}
        <div className={styles.sectionDivider}>
            <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    type='text'
                    label="Name"
                    name='motherName'
                    placeholder="Mother's name"
                    value={formData?.motherName || ''}
                    onChange={onChange}
                />

                <Input
                    type='number'
                    label="Age"
                    name='motherAge'
                    placeholder="Mother's age"
                    value={formData?.motherAge || ''}
                    onChange={onChange}
                />
            </div>

            <Input
                type='text'
                label="Occupation"
                name='motherOccupation'
                placeholder="Mother's Occupation"
                value={formData?.motherOccupation || ''}
                onChange={onChange}
            />
        </div>

        <br />

        {/* father's information */}
        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    type='text'
                    label="Name"
                    name='fatherName'
                    placeholder="Father's Name"
                    value={formData?.fatherName || ''}
                    onChange={onChange}
                />
                <Input
                    type='number'
                    label="Age"
                    name='fatherAge'
                    placeholder="Father's Age"
                    value={formData?.fatherAge || ''}
                    onChange={onChange}
                />
            </div>

            <Input
                type='text'
                label="Occupation"
                name='fatherOccupation'
                placeholder="Father's Occupation"
                value={formData?.fatherOccupation || ''}
                onChange={onChange}
            />
        </div>

        <br />

        <Input
            type='tel'
            label="Contact"
            name='contactNumber'
            placeholder="Contact Number"
            value={formData?.contactNumber || ''}
            onChange={onChange}
        />

        <br />

        <TextArea
            name='address'
            placeholder='Full Address'
            leftIcon='map-pin'
            value={formData?.address || ''}
            onChange={onChange}
            rows={3}
            resize='vertical'
        />
        
        <br />

        <Input
            type='text'
            label="Religion"
            name='religion'
            placeholder="Religion"
            value={formData?.religion || ''}
            onChange={onChange}
        />

        <br />

        {/* appointment details */}
        <h4>Appointment Details</h4>
        <div className={styles.formRow}>
            <Input
                type="date"
                id="preferredDate"
                name="preferredDate"
                label="Preferred Date *"
                leftIcon="calendar"
                value={formData?.preferredDate || ''}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={isLoading}
                error={
                    formData?.preferredDate && !isDateAvailable(formData.preferredDate)
                        ? 'This date is fully booked. Please select another date.'
                        : undefined
                }
            />

            <Select
                id="preferredTime"
                name="preferredTime"
                label="Preferred Time *"
                leftIcon="clock"
                placeholder="Select Time"
                value={formData?.preferredTime || ''}
                onChange={handleTimeChange}
                options={generateTimeOptions()}
                required
                disabled={isLoading || !formData?.preferredDate}
                error={getTimeSelectError()}
            />
        </div>

        <TextArea
            id="reasonForVisit"
            name="reasonForVisit"
            label="Reason for Visit *"
            leftIcon="file-text"
            value={formData?.reasonForVisit || ''}
            onChange={onChange}
            rows={4}
            minLength={5}
            maxLength={200}
            placeholder="Please describe the reason for your visit (5-200 characters)"
            required
            disabled={isLoading}
            showCharCount={true}
            error={getReasonError()}
            resize="vertical"
        />
    </div>
  ) 
}

export default AppointmentForm