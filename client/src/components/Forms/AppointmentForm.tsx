import { AppointmentFormProps } from '../../types/appointment'
import styles from '../ModalComponent/ModalComponent.module.css'
import { useAuth } from '../../hooks/usesAuth';
import { useEffect, useState } from 'react';

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
    patients
}) => {
    const { currentUser } = useAuth();
    const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);

    //helper function to format date for HTML date input
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            
            //format as YYYY-MM-DD
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    //handle patient selection change and populate patient info
    const handlePatientChange = (e) => {
        const selectedPatientId = e.target.value;
        console.log('Selected patient ID:', selectedPatientId);
        
        //find selected patient's info
        const selectedPatient = patients?.find(patient => patient.id === selectedPatientId);
        setSelectedPatientInfo(selectedPatient);
        
        //create an event object for the patient selection
        const patientEvent = {
            target: {
                name: 'patientId',
                value: selectedPatientId
            }
        };
        
        //call the parent onChange with the patient selection
        onChange(patientEvent);
        
        //if patient is found, populate the form with patient data
        if (selectedPatient) {
            //create events for each field to populate
            const fieldsToPopulate = [
                { name: 'fullName', value: selectedPatient.fullName || '' },
                { name: 'birthdate', value: formatDateForInput(selectedPatient.birthdate) },
                { name: 'sex', value: selectedPatient.sex || '' },
                { name: 'height', value: selectedPatient.height || '' },
                { name: 'weight', value: selectedPatient.weight || '' },
                { name: 'religion', value: selectedPatient.religion || '' },
                //handle nested mother info
                { name: 'motherName', value: selectedPatient.motherInfo?.name || '' },
                { name: 'motherAge', value: selectedPatient.motherInfo?.age || '' },
                { name: 'motherOccupation', value: selectedPatient.motherInfo?.occupation || '' },
                //handle nested father info
                { name: 'fatherName', value: selectedPatient.fatherInfo?.name || '' },
                { name: 'fatherAge', value: selectedPatient.fatherInfo?.age || '' },
                { name: 'fatherOccupation', value: selectedPatient.fatherInfo?.occupation || '' }
            ];
            
            //populate each field
            fieldsToPopulate.forEach(field => {
                const fieldEvent = {
                    target: {
                        name: field.name,
                        value: field.value
                    }
                };
                onChange(fieldEvent);
            });
        } else if (selectedPatientId === '') {
            // Clear form fields when no patient is selected (for walk-ins)
            const fieldsToClear = [
                'fullName', 'birthdate', 'sex', 'height', 'weight', 'religion',
                'motherName', 'motherAge', 'motherOccupation',
                'fatherName', 'fatherAge', 'fatherOccupation'
            ];
            
            fieldsToClear.forEach(fieldName => {
                const fieldEvent = {
                    target: {
                        name: fieldName,
                        value: ''
                    }
                };
                onChange(fieldEvent);
            });
        }
    };

    //load patient info when form loads (for existing appointments or patient users)
    useEffect(() => {
        if (formData?.patientId && patients) {
            const patient = patients.find(p => p.id === formData.patientId);
            setSelectedPatientInfo(patient);
            
            //auto-populate fields if patient data exists and form fields are empty
            if (patient) {
                const fieldsToCheck = [
                    { name: 'fullName', value: patient.fullName },
                    { name: 'birthdate', value: formatDateForInput(patient.birthdate) },
                    { name: 'sex', value: patient.sex },
                    { name: 'height', value: patient.height },
                    { name: 'weight', value: patient.weight },
                    { name: 'religion', value: patient.religion },
                    //handle nested mother info
                    { name: 'motherName', value: patient.motherInfo?.name },
                    { name: 'motherAge', value: patient.motherInfo?.age },
                    { name: 'motherOccupation', value: patient.motherInfo?.occupation },
                    //handle nested father info
                    { name: 'fatherName', value: patient.fatherInfo?.name },
                    { name: 'fatherAge', value: patient.fatherInfo?.age },
                    { name: 'fatherOccupation', value: patient.fatherInfo?.occupation }
                ];
                
                fieldsToCheck.forEach(field => {
                    //only populate if the form field is empty and patient has the data
                    if (!formData[field.name] && field.value) {
                        const fieldEvent = {
                            target: {
                                name: field.name,
                                value: field.value
                            }
                        };
                        onChange(fieldEvent);
                    }
                });
            }
        }
    }, [formData?.patientId, patients]);

    //auto-populate for patient users on initial load
    useEffect(() => {
        if (currentUser && currentUser.role === 'Patient' && !formData?.patientId) {
            //auto-select current user as patient
            const patientEvent = {
                target: {
                    name: 'patientId',
                    value: currentUser.id
                }
            };
            onChange(patientEvent);
            
            //auto-populate patient fields if available
            const fieldsToPopulate = [
                { name: 'fullName', value: currentUser.fullName || '' },
                { name: 'birthdate', value: formatDateForInput(currentUser.birthdate) },
                { name: 'sex', value: currentUser.sex || '' },
                { name: 'height', value: currentUser.height || '' },
                { name: 'weight', value: currentUser.weight || '' },
                { name: 'religion', value: currentUser.religion || '' },
                //handle nested mother info from currentUser
                { name: 'motherName', value: currentUser.motherInfo?.name || '' },
                { name: 'motherAge', value: currentUser.motherInfo?.age || '' },
                { name: 'motherOccupation', value: currentUser.motherInfo?.occupation || '' },
                //handle nested father info from currentUser
                { name: 'fatherName', value: currentUser.fatherInfo?.name || '' },
                { name: 'fatherAge', value: currentUser.fatherInfo?.age || '' },
                { name: 'fatherOccupation', value: currentUser.fatherInfo?.occupation || '' }
            ];
            
            fieldsToPopulate.forEach(field => {
                if (field.value) {
                    const fieldEvent = {
                        target: {
                            name: field.name,
                            value: field.value
                        }
                    };
                    onChange(fieldEvent);
                }
            });
        }
    }, [currentUser]);

  return (
    <>
        <div className={styles.formGroup}>
            <label htmlFor='patientId'>Patient</label>
                    
            {
                currentUser && (currentUser.role === 'Doctor' || currentUser.role === 'Staff') ? (
                    //doctor/staff view - show all patients with option for walk-ins
                    <select
                        id='patientId'
                        name='patientId'
                        value={formData?.patientId || ''}
                        onChange={handlePatientChange}
                        className={styles.formControl}
                        disabled={isLoading}
                    >
                        <option value=''>Walk-in Patient (Enter details below)</option>
                        {
                            isLoading ? (
                                <option value='' disabled>Loading patients...</option>
                            ) : (
                                patients && patients.length > 0 ? (
                                    patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.fullName} (ID: {patient.patientNumber})
                                        </option>
                                    ))
                                ) : (
                                    <option value='' disabled>No registered patients available</option>
                                )
                            )
                        }
                    </select>
                ) : (
                    //patient view - show only their own information
                    <select
                        id='patientId'
                        name='patientId'
                        value={formData?.patientId || currentUser?.id || ''}
                        onChange={handlePatientChange}
                        className={styles.formControl}
                        required
                        disabled={isLoading}
                    >
                        {
                            currentUser ? (
                                <option key={currentUser.id} value={currentUser.id}>
                                    {currentUser.fullName} (You)
                                </option>
                            ) : (
                                <option value='' disabled>No patient data available</option>
                            )
                        }
                    </select>
                )
            }
        </div>

        {/* patient information section - now shows for both registered patients and walk-ins */}
        {
            (currentUser && (currentUser.role === 'Doctor' || currentUser.role === 'Staff')) || formData?.patientId ? (
                <div className={styles.sectionDivider}>
                    <h4>Patient Information</h4>
                    <small style={{ color: '#666', fontStyle: 'italic' }}>
                        {formData?.patientId ? 
                            'Information auto-populated from patient record. You can edit as needed.' :
                            'Please enter patient information for walk-in appointment.'
                        }
                    </small>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor='fullName'>Full Name *</label>
                            <input
                                type='text'
                                id='fullName'
                                name='fullName'
                                value={formData?.fullName || ''}
                                onChange={onChange}
                                className={styles.formControl}
                                required
                                disabled={isLoading}
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
                                <option value='Other'>Other</option>
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

                    {/* mother's information*/}
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
                </div>
            ) : null
        }

        {/* Appointment Details Section */}
        <div className={styles.sectionDivider}>
            <h4>Appointment Details</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='preferredDate'>Preferred Date *</label>
                    <input
                        type='date'
                        id='preferredDate'
                        name='preferredDate'
                        value={formData?.preferredDate || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        min={new Date().toISOString().split('T')[0]} //prevent past dates
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='preferredTime'>Preferred Time *</label>
                    <input
                        type='time'
                        id='preferredTime'
                        name='preferredTime'
                        value={formData?.preferredTime || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        required
                        disabled={isLoading}
                    />
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
        </div>
    </>
  )
}

export default AppointmentForm;