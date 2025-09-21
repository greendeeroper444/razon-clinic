
import React, { useState, useEffect } from 'react'
import styles from './AppointmentForm.module.css'
import { getAppointments } from '../../../../services'
import { convertTo12HourFormat, generateTimeSlots } from '../../../../utils'
import { AppointmentFormProps } from '../../../../types'
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
    const [additionalPatients, setAdditionalPatients] = useState<any[]>([]);

    //fetch existing appointments to check for conflicts
    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const response = await getAppointments();
                if (response.data.success) {
                    const appointments = response.data.data;
                    const slots = appointments
                        .filter(apt => apt.status !== 'Cancelled') // exclude cancelled appointments
                        .map(apt => ({
                            date: new Date(apt.preferredDate).toISOString().split('T')[0],
                            time: apt.preferredTime,
                            time12Hour: convertTo12HourFormat(apt.preferredTime) // convert to 12-hour format
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
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); // 12-hour format for comparison
            
            const available = allTimes.filter(time => !bookedTimesForDate.includes(time));
            setAvailableTimes(available);
        } else {
            setAvailableTimes(generateTimeSlots());
        }
    }, [formData?.preferredDate, bookedSlots]);

    //update formData when patients change
    useEffect(() => {
        if (additionalPatients.length > 0) {
            //create patients array including primary patient
            const primaryPatient = {
                firstName: formData?.firstName || '',
                lastName: formData?.lastName || '',
                middleName: formData?.middleName || '',
                birthdate: formData?.birthdate || '',
                sex: formData?.sex || '',
                height: formData?.height || '',
                weight: formData?.weight || ''
            };
            
            const allPatients = [primaryPatient, ...additionalPatients];
            
            //update formData with patients array
            onChange({
                target: {
                    name: 'patients',
                    value: allPatients
                }
            } as any);
        }
    }, [additionalPatients, formData?.firstName, formData?.lastName, formData?.middleName, formData?.birthdate, formData?.sex, formData?.height, formData?.weight]);


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


    const generateTimeOptions = (): SelectOption[] => {
        return generateTimeSlots().map(time => {
            const isAvailable = isTimeAvailable(time);
            return {
                value: time,
                label: `${time}${!isAvailable ? ' (Not Available)' : ''}`,
                disabled: !isAvailable
            };
        });
    };

    const getTimeSelectError = () => {
        if (formData?.preferredDate && availableTimes.length === 0) {
            return 'No available times for this date.';
        }
        return undefined;
    };


    // check if a date has any available times
    const isDateAvailable = (dateString: string) => {
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === dateString)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); // 12-hour format
        
        const allTimes = generateTimeSlots();
        return allTimes.some(time => !bookedTimesForDate.includes(time));
    };

    //check if a specific time is available for the selected date
    const isTimeAvailable = (time: string) => {
        if (!formData?.preferredDate) return true;
        
        const bookedTimesForDate = bookedSlots
            .filter(slot => slot.date === formData.preferredDate)
            .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); // 12-hour format for comparison
        
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
                .map(slot => slot.time12Hour || convertTo12HourFormat(slot.time)); // 12-hour format
            
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

    //add new patient
    const addPatient = () => {
        const newPatient = {
            firstName: '',
            lastName: '',
            middleName: '',
            birthdate: '',
            sex: '',
            height: '',
            weight: '',
        };
        setAdditionalPatients([...additionalPatients, newPatient]);
    };

    //remove patient
    const removePatient = (index: number) => {
        const updatedPatients = additionalPatients.filter((_, i) => i !== index);
        setAdditionalPatients(updatedPatients);
    };

    //handle additional patient data change
    const handleAdditionalPatientChange = (index: number, field: string, value: string) => {
        const updatedPatients = [...additionalPatients];
        updatedPatients[index] = { ...updatedPatients[index], [field]: value };
        setAdditionalPatients(updatedPatients);
    };

    //handle primary patient change
    const handlePrimaryPatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange(e);
    };

    //render patient information form
    const renderPatientForm = (patient: any, index: number, isAdditional: boolean = false) => {
        const fieldPrefix = isAdditional ? `additional_${index}_` : '';
        const patientData = isAdditional ? patient : formData;
        const handleChange = isAdditional 
            ? (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
                handleAdditionalPatientChange(index, e.target.name.replace(fieldPrefix, ''), e.target.value)
            : handlePrimaryPatientChange;

        return (
            <div key={isAdditional ? `additional_${index}` : 'primary'}>
                <h4>{isAdditional ? `Patient ${index + 2} Information` : 'Patient Information'}</h4>
                <div className={styles.removePatientContainer}>
                   
                    {
                        isAdditional && (
                            <button
                                type="button"
                                onClick={() => removePatient(index)}
                                className={styles.removePatient}
                                disabled={isLoading}
                            >
                                Remove Patient
                            </button>
                        )
                    }
                </div>
                
                <Input
                    type='text'
                    label='First Name'
                    name={`${fieldPrefix}firstName`}
                    placeholder="Patient's first name"
                    value={patientData?.firstName || ''}
                    onChange={handleChange}
                />

                <br />
                
                <Input
                    type='text'
                    label='Last Name'
                    name={`${fieldPrefix}lastName`}
                    placeholder="Patient's last name"
                    value={patientData?.lastName || ''}
                    onChange={handleChange}
                />

                <br />

                <Input
                    type='text'
                    label='Middle Name (Optional)'
                    name={`${fieldPrefix}middleName`}
                    placeholder="Patient's middle name (optional)"
                    value={patientData?.middleName || ''}
                    onChange={handleChange}
                />

                <br />

                <div className={styles.formRow}>

                    <Input
                        type='date'
                        name={`${fieldPrefix}birthdate`}
                        placeholder={patientData.birthdate ? undefined : 'Select your birthdate'}
                        leftIcon='calendar'
                        value={patientData.birthdate || ''}
                        onChange={handleChange}
                        onFocus={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.type = 'date';
                        }}
                    />

                    <Select
                        name={`${fieldPrefix}sex`}
                        title='Select Gender'
                        leftIcon='users'
                        placeholder='Select Gender'
                        value={patientData.sex || ''}
                        onChange={handleChange}
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
                        name={`${fieldPrefix}height`}
                        placeholder="Height in cm"
                        value={patientData?.height || ''}
                        onChange={handleChange}
                    />

                    <Input
                        type='number'
                        label='Weight (cm)'
                        name={`${fieldPrefix}weight`}
                        placeholder="Weight in cm"
                        value={patientData?.weight || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        );
    };

  return (
    <div className={styles.sectionDivider}>
        {/* primary patient information */}
        {renderPatientForm(null, 0, false)}

        {/* additional patients */}
        {
            additionalPatients.map((patient, index) => (
                <div key={index} className={styles.sectionDivider}>
                    {renderPatientForm(patient, index, true)}
                </div>
            ))
        }

        {/* add patient button */}
        <div className={styles.addPatientContainer}>
            <button
                type="button"
                onClick={addPatient}
                disabled={isLoading}
                className={styles.addPatient}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                + Add Another Patient
            </button>
            {
                additionalPatients.length > 0 && (
                    <p className={styles.totalPatient}>
                        Total patients: {additionalPatients.length + 1}
                    </p>
                )
            }
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
            type='number'
            label="Contact"
            name='contactNumber'
            placeholder="Contact Number"
            value={formData?.contactNumber || ''}
            onChange={onChange}
        />

        <br />

        <Input
            type='text'
            label="Address"
            name='address'
            placeholder="Address"
            value={formData?.address || ''}
            onChange={onChange}
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
                min={new Date().toISOString().split('T')[0]} // prevent past dates
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