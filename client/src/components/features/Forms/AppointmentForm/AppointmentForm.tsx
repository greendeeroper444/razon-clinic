import React, { useState, useEffect, useRef } from 'react'
import styles from './AppointmentForm.module.css'
import { getAppointments } from '../../../../services'
import { convertTo12HourFormat, generateTimeSlots, getFieldError } from '../../../../utils'
import { AppointmentFormData, AppointmentFormProps } from '../../../../types'
import Input from '../../../ui/Input/Input'
import Select, { SelectOption } from '../../../ui/Select/Select'
import TextArea from '../../../ui/TextArea/TextArea'
import { useAppointmentStore, useAuthenticationStore, useBlockedTimeSlotStore } from '../../../../stores'
import { useScrollToError } from '../../../../hooks/useScrollToError'
import { Info } from 'lucide-react'

const getDateOffset = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const toDateOnly = (dateString: string): Date => {
    const d = new Date(dateString);
    d.setHours(0, 0, 0, 0);
    return d;
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
}) => {
    const [bookedSlots, setBookedSlots] = useState<{date: string, time: string, time12Hour?: string}[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    //ref to ensure auto-fill only runs once per form mount, not on every re-render
    const hasAutoFilled = useRef(false);

    const validationErrors = useAppointmentStore((state) => state.validationErrors);
    const blockedTimeSlots = useBlockedTimeSlotStore((state) => state.blockedTimeSlots);
    const fetchBlockedTimeSlots = useBlockedTimeSlotStore((state) => state.fetchBlockedTimeSlots);

    //get the logged-in user from auth store
    const user = useAuthenticationStore((state) => state.user);

    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'firstName',
            'lastName',
            'middleName',
            'suffix',
            'birthdate',
            'sex',
            'height',
            'weight',
            'temperature',
            'bloodPressureSystolic',
            'bloodPressureDiastolic',
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

    //auto-fill form with user profile data.
    //conditions:
    //   - user must be loaded
    //   - must be a NEW appointment (no formData.id)
    //   - must not have already run (hasAutoFilled ref)
    useEffect(() => {
        if (user && !formData?.id && !hasAutoFilled.current) {
            hasAutoFilled.current = true;

            const fieldsToAutoFill = [
                { name: 'firstName',     value: user.firstName     || '' },
                { name: 'lastName',      value: user.lastName      || '' },
                { name: 'middleName',    value: user.middleName    || '' },
                { name: 'contactNumber', value: user.contactNumber || '' },
                { name: 'sex',           value: user.sex           || '' },
                { name: 'address',       value: user.address       || '' },
                { name: 'religion',      value: user.religion      || '' },
                {
                    name: 'birthdate',
                    value: user.birthdate ? user.birthdate.split('T')[0] : ''
                },
            ];

            fieldsToAutoFill.forEach(({ name, value }) => {
                if (value) {
                    onChange({
                        target: { name, value }
                    } as React.ChangeEvent<HTMLInputElement>);
                }
            });
        }
    //we intentionally only re-run when `user` becomes available.
    //the ref prevents duplicate fills if this effect re-runs.
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        fetchBlockedTimeSlots({ page: 1, limit: 1000 });
    }, [fetchBlockedTimeSlots]);

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

    //helper function to check if a time has passed for today
    const isTimePassed = (timeString: string, dateString: string): boolean => {
        const today = new Date();
        const selectedDate = new Date(dateString);
        
        //only check for passed times if the selected date is today
        if (selectedDate.toDateString() !== today.toDateString()) {
            return false;
        }

        //convert 12-hour format time to 24-hour format for comparison
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12;
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0;
        }

        const timeDate = new Date();
        timeDate.setHours(hour24, minutes, 0, 0);

        return timeDate <= today;
    };

    // ─── NEW: check if a date violates the 1-day-before rule ─────────────────────
    // Rule: preferred date must be at least 2 days from today.
    // i.e., the patient must book BEFORE the day prior to their appointment.
    // Today → cannot book today or tomorrow. Earliest allowed = day after tomorrow.
    const isTooSoon = (dateString: string): boolean => {
        if (!dateString) return false;
        const minAllowed = toDateOnly(getDateOffset(2)); // today + 2 days
        const selected   = toDateOnly(dateString);
        return selected < minAllowed;
    };

    const isDateBlocked = (dateString: string): boolean => {
        if (!blockedTimeSlots || blockedTimeSlots.length === 0) return false;

        const checkDate = toDateOnly(dateString);

        return blockedTimeSlots.some(slot => {
            if (!slot.isActive) return false;

            const startDate = toDateOnly(slot.startDate);
            const endDate   = toDateOnly(slot.endDate);

            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    const getBlockedDateReason = (dateString: string): string | null => {
        if (!blockedTimeSlots || blockedTimeSlots.length === 0) return null;

        const checkDate = toDateOnly(dateString);

        const blockedSlot = blockedTimeSlots.find(slot => {
            if (!slot.isActive) return false;

            const startDate = toDateOnly(slot.startDate);
            const endDate   = toDateOnly(slot.endDate);

            return checkDate >= startDate && checkDate <= endDate;
        });

        if (blockedSlot) {
            return blockedSlot.customReason || blockedSlot.reason || 'Date is blocked';
        }

        return null;
    };

    useEffect(() => {
        if (formData?.preferredDate) {
            const selectedDate = formData.preferredDate;
            const allTimes = generateTimeSlots();
            
            const bookedTimesForDate = bookedSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
            
            //filter out both booked times and passed times
            const available = allTimes.filter(time => 
                !bookedTimesForDate.includes(time) && 
                !isTimePassed(time, selectedDate)
            );
            setAvailableTimes(available);
        } else {
            setAvailableTimes(generateTimeSlots());
        }
    }, [formData?.preferredDate, bookedSlots]);

    const getReasonError = () => {
        const reason = formData?.reasonForVisit || '';
        
        const apiError = getFieldError(validationErrors,'reasonForVisit');
        if (apiError) return apiError;
        
        if (reason.length > 0 && reason.length < 5) {
            return 'Reason must be at least 5 characters long.';
        }
        
        if (reason.length > 200) {
            return 'Reason cannot exceed 200 characters.';
        }
        
        return undefined;
    };

    //check if time is available (not booked and not passed)
    const isTimeAvailable = (time: string): boolean => {
        if (!formData?.preferredDate) return true;
        
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === formData.preferredDate)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
        
        const isBooked = bookedTimesForDate.includes(time);
        const isPassed = isTimePassed(time, formData.preferredDate);
        
        return !isBooked && !isPassed;
    };

    //generate time options with proper labels for passed times
    const generateTimeOptions = (): SelectOption[] => {
        const allTimes = generateTimeSlots();
        
        return allTimes.map(time => {
            const isBooked = !formData?.preferredDate || 
                bookedSlots
                    .filter(slot => slot.date === formData.preferredDate)
                    .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time))
                    .includes(time);
            
            const isPassed = formData?.preferredDate && isTimePassed(time, formData.preferredDate);
            const isAvailable = isTimeAvailable(time);
            
            let label = time;
            if (isPassed) {
                label = `${time} (Passed)`;
            } else if (isBooked && !isPassed) {
                label = `${time} (Booked)`;
            }
            
            return {
                value: time,
                label: label,
                disabled: !isAvailable
            };
        });
    };

    const getTimeSelectError = () => {
        const apiError = getFieldError(validationErrors,'preferredTime');
        if (apiError) return apiError;
        
        if (formData?.preferredDate && availableTimes.length === 0) {
            return 'No available times for this date. Please select another date.';
        }
        return undefined;
    };

    // ─── UPDATED: isDateAvailable now also rejects dates that are too soon ────────
    const isDateAvailable = (dateString: string) => {
        // Reject dates that don't satisfy the 1-day-before booking rule
        if (isTooSoon(dateString)) {
            return false;
        }

        if (isDateBlocked(dateString)) {
            return false;
        }

        const allTimes = generateTimeSlots();
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === dateString)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time));
        
        //check if there's at least one time that is not booked and not passed
        return allTimes.some(time => 
            !bookedTimesForDate.includes(time) && 
            !isTimePassed(time, dateString)
        );
    };

    // ─── UPDATED: getDateError now shows a clear message for too-soon dates ───────
    const getDateError = () => {
        const apiError = getFieldError(validationErrors,'preferredDate');
        if (apiError) return apiError;

        if (formData?.preferredDate) {
            // Check the 1-day-before rule first
            if (isTooSoon(formData.preferredDate)) {
                return 'Appointments must be booked at least 1 day before your preferred schedule. Please select a date at least 2 days from today.';
            }

            if (isDateBlocked(formData.preferredDate)) {
                const reason = getBlockedDateReason(formData.preferredDate);
                return `This date is blocked: ${reason}`;
            }

            if (!isDateAvailable(formData.preferredDate)) {
                return 'This date is fully booked. Please select another date.';
            }
        }

        return undefined;
    };

    const handleReligionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'religion') {
            if (value !== 'Others') {
                onChange({
                    target: {
                        name: 'religionOther',
                        value: ''
                    }
                } as React.ChangeEvent<HTMLInputElement>);
            }
            onChange(e);
        } else if (name === 'religionOther') {
            onChange(e);
            onChange({
                target: {
                    name: 'religion',
                    value: value
                }
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const predefinedReligions = [
        'Roman Catholic', 'Islam', 'Iglesia ni Cristo', 'Evangelical / Born Again',
        'Seventh-day Adventist', 'Protestant', 'Baptist', 'Buddhism', 'Non-religious'
    ];

    //clear preferred time if it becomes unavailable (booked or passed)
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        onChange(e);
        
        if (formData?.preferredTime && selectedDate) {
            const isCurrentTimeUnavailable = !isTimeAvailable(formData.preferredTime);
            
            if (isCurrentTimeUnavailable) {
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
        <h4>Child Information</h4>
        
        <Input
            ref={(el) => { fieldRefs.current['firstName'] = el; }}
            type='text'
            label='First Name *'
            name='firstName'
            placeholder="Child's first name"
            value={formData?.firstName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors,'firstName')}
        />

        <br />
        
        <Input
            ref={(el) => { fieldRefs.current['lastName'] = el; }}
            type='text'
            label='Last Name *'
            name='lastName'
            placeholder="Child's last name"
            value={formData?.lastName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors,'lastName')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['middleName'] = el; }}
            type='text'
            label='Middle Name (Optional)'
            name='middleName'
            placeholder="Child's middle name (optional)"
            value={formData?.middleName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors,'middleName')}
        />

        <br />

        <Select
            ref={(el) => { fieldRefs.current['suffix'] = el; }}
            name='suffix'
            leftIcon='user'
            placeholder='Suffix (Optional)'
            value={formData?.suffix || ''}
            onChange={onChange}
            error={getFieldError(validationErrors,'suffix')}
            options={[
                { value: '', label: 'None' },
                { value: 'Jr.', label: 'Jr.' },
                { value: 'Sr.', label: 'Sr.' },
                { value: 'II', label: 'II' },
                { value: 'III', label: 'III' },
                { value: 'IV', label: 'IV' },
                { value: 'V', label: 'V' }
            ]}
        />

        <br />

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['birthdate'] = el; }}
                type='date'
                label='Birthday *'
                name='birthdate'
                placeholder={formData?.birthdate ? undefined : 'Select your birthdate'}
                leftIcon='calendar'
                value={formData?.birthdate || ''}
                onChange={onChange}
                onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.type = 'date';
                }}
                error={getFieldError(validationErrors,'birthdate')}
            />

            <Select
                ref={(el) => { fieldRefs.current['sex'] = el; }}
                label='Sex *'
                name='sex'
                title='Select Sex'
                leftIcon='users'
                placeholder='Select Sex'
                value={formData?.sex || ''}
                onChange={onChange}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    // { value: 'Other', label: 'Other' }
                ]}
                error={getFieldError(validationErrors,'sex')}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['height'] = el; }}
                type='number'
                label='Height (cm) (Optional)'
                name='height'
                placeholder="e.g. 120"
                value={formData?.height || ''}
                onChange={onChange}
                error={getFieldError(validationErrors,'height')}
            />

            <Input
                ref={(el) => { fieldRefs.current['weight'] = el; }}
                type='number'
                label='Weight (kg) (Optional)'
                name='weight'
                placeholder="e.g. 25"
                value={formData?.weight || ''}
                onChange={onChange}
                error={getFieldError(validationErrors,'weight')}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['temperature'] = el; }}
                type='number'
                label='Temperature (°C) (Optional)'
                name='temperature'
                placeholder="e.g. 36.5"
                value={formData?.temperature || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'temperature')}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['bloodPressureSystolic'] = el; }}
                type='number'
                label='Blood Pressure - Systolic (mmHg) (Optional)'
                name='bloodPressure.systolic'
                placeholder="e.g. 120"
                value={formData?.bloodPressure?.systolic || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'bloodPressure.systolic')}
            />

            <Input
                ref={(el) => { fieldRefs.current['bloodPressureDiastolic'] = el; }}
                type='number'
                label='Blood Pressure - Diastolic (mmHg) (Optional)'
                name='bloodPressure.diastolic'
                placeholder="e.g. 80"
                value={formData?.bloodPressure?.diastolic || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'bloodPressure.diastolic')}
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
                    error={getFieldError(validationErrors,'motherName')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['motherAge'] = el; }}
                    type='number'
                    label="Age"
                    name='motherAge'
                    placeholder="Mother's age"
                    value={formData?.motherAge || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors,'motherAge')}
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
                error={getFieldError(validationErrors,'motherOccupation')}
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
                    error={getFieldError(validationErrors,'fatherName')}
                />
                <Input
                    ref={(el) => { fieldRefs.current['fatherAge'] = el; }}
                    type='number'
                    label="Age"
                    name='fatherAge'
                    placeholder="Father's Age"
                    value={formData?.fatherAge || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors,'fatherAge')}
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
                error={getFieldError(validationErrors,'fatherOccupation')}
            />
        </div>

        <br />

        <Input
            ref={(el) => { fieldRefs.current['contactNumber'] = el; }}
            type='tel'
            label="Contact Number *"
            name='contactNumber'
            placeholder="Contact Number"
            value={formData?.contactNumber || ''}
            onChange={onChange}
            error={getFieldError(validationErrors,'contactNumber')}
        />

        <br />

        <TextArea
            ref={(el) => { fieldRefs.current['address'] = el; }}
            label='Address *'
            name='address'
            placeholder='Full Address'
            leftIcon='map-pin'
            value={formData?.address || ''}
            onChange={onChange}
            rows={3}
            resize='vertical'
            error={getFieldError(validationErrors,'address')}
        />
        
        <br />

        <Select
            ref={(el) => { fieldRefs.current['religion'] = el; }}
            label='Religion'
            name='religion'
            leftIcon='users'
            placeholder='Select Religion'
            value={formData?.religion && predefinedReligions.includes(formData.religion) 
                ? formData.religion 
                : formData?.religion && !predefinedReligions.includes(formData.religion)
                ? 'Others'
                : ''}
            onChange={handleReligionChange}
            options={[
                { value: 'Roman Catholic', label: 'Roman Catholic' },
                { value: 'Islam', label: 'Islam' },
                { value: 'Iglesia ni Cristo', label: 'Iglesia ni Cristo' },
                { value: 'Evangelical / Born Again', label: 'Evangelical / Born Again' },
                { value: 'Seventh-day Adventist', label: 'Seventh-day Adventist' },
                { value: 'Protestant', label: 'Protestant' },
                { value: 'Baptist', label: 'Baptist' },
                { value: 'Buddhism', label: 'Buddhism' },
                { value: 'Non-religious', label: 'Non-religious' },
                { value: 'Others', label: 'Others (Please specify)' },
            ]}
            error={getFieldError(validationErrors,'religion')}
        />

        {
            (formData?.religion === 'Others' || 
            (formData?.religion && 
            !['Roman Catholic', 'Islam', 'Iglesia ni Cristo', 'Evangelical / Born Again', 
                'Seventh-day Adventist', 'Protestant', 'Baptist', 'Buddhism', 'Non-religious'].includes(formData.religion))) && (
                <Input
                    type='text'
                    name='religionOther'
                    placeholder='Please specify your religion'
                    leftIcon='church'
                    value={formData?.religionOther || (formData?.religion !== 'Others' ? formData?.religion : '')}
                    onChange={handleReligionChange}
                    error={getFieldError(validationErrors,'religion')}
                />
            )
        }

        <br />

        <h4>Appointment Details</h4>

        <div className={styles.modalNote}>
            <Info className={styles.modalNoteIcon} size={16} />
            <span>
                Appointments must be booked <strong>at least 1 day before</strong> your preferred schedule.
                The earliest available date is <strong>{getDateOffset(2)}</strong> (day after tomorrow).
            </span>
        </div>

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
                // ─── CHANGED: was today (offset 0), now today + 2 ───────────────
                min={getDateOffset(2)}
                disabled={isLoading}
                error={getDateError()}
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
                disabled={isLoading || !formData?.preferredDate || isDateBlocked(formData?.preferredDate || '')}
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