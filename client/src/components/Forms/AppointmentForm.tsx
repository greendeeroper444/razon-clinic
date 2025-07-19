
import React, { useState, useEffect } from 'react'
import styles from '../ModalComponent/ModalComponent.module.css'
import { getAppointments } from '../../pages/services/appoinmentService'
import { convertTo12HourFormat, generateTimeSlots } from '../../utils'
import { AppointmentFormProps } from '../../types'

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>{isAdditional ? `Patient ${index + 2} Information` : 'Patient Information'}</h4>
                    {
                        isAdditional && (
                            <button
                                type="button"
                                onClick={() => removePatient(index)}
                                style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                                disabled={isLoading}
                            >
                                Remove Patient
                            </button>
                        )
                    }
                </div>
                
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}firstName`}>First Name *</label>
                        <input
                            type='text'
                            id={`${fieldPrefix}firstName`}
                            name={`${fieldPrefix}firstName`}
                            value={patientData?.firstName || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            required
                            disabled={isLoading}
                            placeholder="Patient's first name"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}lastName`}>Last Name *</label>
                        <input
                            type='text'
                            id={`${fieldPrefix}lastName`}
                            name={`${fieldPrefix}lastName`}
                            value={patientData?.lastName || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            required
                            disabled={isLoading}
                            placeholder="Patient's last name"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}middleName`}>Middle Name (Optional)</label>
                        <input
                            type='text'
                            id={`${fieldPrefix}middleName`}
                            name={`${fieldPrefix}middleName`}
                            value={patientData?.middleName || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            disabled={isLoading}
                            placeholder="Patient's middle name (optional)"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}birthdate`}>Birth Date *</label>
                        <input
                            type='date'
                            id={`${fieldPrefix}birthdate`}
                            name={`${fieldPrefix}birthdate`}
                            value={patientData?.birthdate || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}sex`}>Sex *</label>
                        <select
                            id={`${fieldPrefix}sex`}
                            name={`${fieldPrefix}sex`}
                            value={patientData?.sex || ''}
                            onChange={handleChange}
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
                        <label htmlFor={`${fieldPrefix}height`}>Height (cm)</label>
                        <input
                            type='number'
                            id={`${fieldPrefix}height`}
                            name={`${fieldPrefix}height`}
                            value={patientData?.height || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            min={30}
                            max={300}
                            placeholder="Height in cm"
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`${fieldPrefix}weight`}>Weight (kg)</label>
                        <input
                            type='number'
                            id={`${fieldPrefix}weight`}
                            name={`${fieldPrefix}weight`}
                            value={patientData?.weight || ''}
                            onChange={handleChange}
                            className={styles.formControl}
                            min={1}
                            max={500}
                            placeholder="Weight in kg"
                            disabled={isLoading}
                        />
                    </div>
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
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
                type="button"
                onClick={addPatient}
                disabled={isLoading}
                style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                + Add Another Patient
            </button>
            {
                additionalPatients.length > 0 && (
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                        Total patients: {additionalPatients.length + 1}
                    </p>
                )
            }
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
        <div className={styles.formGroup}>
            <label htmlFor='religion'>Religion *</label>
            <input
                type='text'
                id='religion'
                name='religion'
                value={formData?.religion || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                disabled={isLoading}
                placeholder="Enter religion"
                title="Religion"
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


        <style>{`
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