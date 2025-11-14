import React, { useState, useEffect } from 'react'
import styles from './AppointmentForm.module.css'
import { getAppointments } from '../../../../services'
import { convertTo12HourFormat, generateTimeSlots } from '../../../../utils'
import { AppointmentFormData, AppointmentFormProps } from '../../../../types'
import Input from '../../../ui/Input/Input'
import Select, { SelectOption } from '../../../ui/Select/Select'
import TextArea from '../../../ui/TextArea/TextArea'
import { useAppointmentStore } from '../../../../stores'
import { useScrollToError } from '../../../../hooks/useScrollToError'

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
}) => {
    const [bookedSlots, setBookedSlots] = useState<{date: string, time: string, time12Hour?: string}[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    const validationErrors = useAppointmentStore((state) => state.validationErrors);

    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'firstName',
            'lastName',
            'middleName',
            'birthdate',
            'sex',
            'height',
            'weight',
            'motherName',
            'motherAge',
            'motherOccupation',
            'fatherName',
            'fatherAge',
            'fatherOccupation',
            'contactNumber',
            'address',
            'religion',
            'preferredDate',
            'preferredTime',
            'reasonForVisit'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });

    const getFieldError = (fieldName: string): string | undefined => {
        const errors = validationErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : undefined;
    };

    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const response = await getAppointments({ page: 1, limit: 1000 });
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

    useEffect(() => {
        if (formData?.preferredDate) {
            const selectedDate = formData.preferredDate;
            const allTimes = generateTimeSlots();
            
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
        
        const apiError = getFieldError('reasonForVisit');
        if (apiError) return apiError;
        
        if (reason.length > 0 && reason.length < 5) {
            return 'Reason must be at least 5 characters long.';
        }
        
        if (reason.length > 200) {
            return 'Reason cannot exceed 200 characters.';
        }
        
        return undefined;
    };

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
        const apiError = getFieldError('preferredTime');
        if (apiError) return apiError;
        
        if (formData?.preferredDate && availableTimes.length === 0) {
            return 'No available times for this date. Please select another date.';
        }
        return undefined;
    };

    const isDateAvailable = (dateString: string) => {
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === dateString)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
        
        const allTimes = generateTimeSlots();
        return allTimes.some(time => !bookedTimesForDate.includes(time));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        onChange(e);
        
        if (formData?.preferredTime && selectedDate) {
            const bookedTimesForDate = bookedSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
            
            if (bookedTimesForDate.includes(formData.preferredTime)) {
                onChange({
                    target: {
                        name: 'preferredTime',
                        value: '',
                    }
                } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTime = e.target.value;
        
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
            ref={(el) => { fieldRefs.current['firstName'] = el; }}
            type='text'
            label='First Name'
            name='firstName'
            placeholder="Patient's first name"
            value={formData?.firstName || ''}
            onChange={onChange}
            error={getFieldError('firstName')}
        />

        <br />
        
        <Input
            ref={(el) => { fieldRefs.current['lastName'] = el; }}
            type='text'
            label='Last Name'
            name='lastName'
            placeholder="Patient's last name"
            value={formData?.lastName || ''}
            onChange={onChange}
            error={getFieldError('lastName')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['middleName'] = el; }}
            type='text'
            label='Middle Name (Optional)'
            name='middleName'
            placeholder="Patient's middle name (optional)"
            value={formData?.middleName || ''}
            onChange={onChange}
            error={getFieldError('middleName')}
        />

        <br />

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['birthdate'] = el; }}
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
                error={getFieldError('birthdate')}
            />

            <Select
                ref={(el) => { fieldRefs.current['sex'] = el; }}
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
                error={getFieldError('sex')}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['height'] = el; }}
                type='number'
                label='Height (cm) (Optional)'
                name='height'
                placeholder="Height in cm (optional)"
                value={formData?.height || ''}
                onChange={onChange}
                error={getFieldError('height')}
            />

            <Input
                ref={(el) => { fieldRefs.current['weight'] = el; }}
                type='number'
                label='Weight (kg) (Optional)'
                name='weight'
                placeholder="Weight in kg (optional)"
                value={formData?.weight || ''}
                onChange={onChange}
                error={getFieldError('weight')}
            />
        </div>

        <div className={styles.sectionDivider}>
            <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['motherName'] = el; }}
                    type='text'
                    label="Name"
                    name='motherName'
                    placeholder="Mother's name"
                    value={formData?.motherName || ''}
                    onChange={onChange}
                    error={getFieldError('motherName')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['motherAge'] = el; }}
                    type='number'
                    label="Age"
                    name='motherAge'
                    placeholder="Mother's age"
                    value={formData?.motherAge || ''}
                    onChange={onChange}
                    error={getFieldError('motherAge')}
                />
            </div>

            <Input
                ref={(el) => { fieldRefs.current['motherOccupation'] = el; }}
                type='text'
                label="Occupation"
                name='motherOccupation'
                placeholder="Mother's Occupation"
                value={formData?.motherOccupation || ''}
                onChange={onChange}
                error={getFieldError('motherOccupation')}
            />
        </div>

        <br />

        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['fatherName'] = el; }}
                    type='text'
                    label="Name"
                    name='fatherName'
                    placeholder="Father's Name"
                    value={formData?.fatherName || ''}
                    onChange={onChange}
                    error={getFieldError('fatherName')}
                />
                <Input
                    ref={(el) => { fieldRefs.current['fatherAge'] = el; }}
                    type='number'
                    label="Age"
                    name='fatherAge'
                    placeholder="Father's Age"
                    value={formData?.fatherAge || ''}
                    onChange={onChange}
                    error={getFieldError('fatherAge')}
                />
            </div>

            <Input
                ref={(el) => { fieldRefs.current['fatherOccupation'] = el; }}
                type='text'
                label="Occupation"
                name='fatherOccupation'
                placeholder="Father's Occupation"
                value={formData?.fatherOccupation || ''}
                onChange={onChange}
                error={getFieldError('fatherOccupation')}
            />
        </div>

        <br />

        <Input
            ref={(el) => { fieldRefs.current['contactNumber'] = el; }}
            type='tel'
            label="Contact"
            name='contactNumber'
            placeholder="Contact Number"
            value={formData?.contactNumber || ''}
            onChange={onChange}
            error={getFieldError('contactNumber')}
        />

        <br />

        <TextArea
            ref={(el) => { fieldRefs.current['address'] = el; }}
            name='address'
            placeholder='Full Address'
            leftIcon='map-pin'
            value={formData?.address || ''}
            onChange={onChange}
            rows={3}
            resize='vertical'
            error={getFieldError('address')}
        />
        
        <br />

        <Input
            ref={(el) => { fieldRefs.current['religion'] = el; }}
            type='text'
            label="Religion"
            name='religion'
            placeholder="Religion"
            value={formData?.religion || ''}
            onChange={onChange}
            error={getFieldError('religion')}
        />

        <br />

        <h4>Appointment Details</h4>
        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['preferredDate'] = el; }}
                type="date"
                id="preferredDate"
                name="preferredDate"
                label="Preferred Date *"
                leftIcon="calendar"
                value={formData?.preferredDate || ''}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
                error={
                    getFieldError('preferredDate') ||
                    (formData?.preferredDate && !isDateAvailable(formData.preferredDate)
                        ? 'This date is fully booked. Please select another date.'
                        : undefined)
                }
            />

            <Select
                ref={(el) => { fieldRefs.current['preferredTime'] = el; }}
                id="preferredTime"
                name="preferredTime"
                label="Preferred Time *"
                leftIcon="clock"
                placeholder="Select Time"
                value={formData?.preferredTime || ''}
                onChange={handleTimeChange}
                options={generateTimeOptions()}
                disabled={isLoading || !formData?.preferredDate}
                error={getTimeSelectError()}
            />
        </div>

        <TextArea
            ref={(el) => { fieldRefs.current['reasonForVisit'] = el; }}
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
            disabled={isLoading}
            showCharCount={true}
            error={getReasonError()}
            resize="vertical"
        />
    </div>
  ) 
}

export default AppointmentForm