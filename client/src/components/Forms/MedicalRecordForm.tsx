import React, { useState, useEffect, useRef } from 'react'
import styles from '../ModalComponent/ModalComponent.module.css'
import { searchAppointmentsByName, getAppointmentForAutofill } from '../../pages/services/medicalRecordService';
import { Appointment, MedicalRecordFormProps } from '../../types';


const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({formData, onChange, isLoading, onAutofill}) => {
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    //handle search input change
    const handleSearchChange = async (e: any) => {
        const value = e.target.value;
        
        //update the form data immediately
        onChange({
            target: {
                name: 'fullName',
                value: value
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>);

        //clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        //don't search if less than 2 characters
        if (value.length < 2) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        //debounce search
        searchTimeoutRef.current = window.setTimeout(async () => {
            try {
                setSearchLoading(true);
                const response = await searchAppointmentsByName(value);
                
                const results = response.data || [];
                setSearchResults(results);
                setShowSearchDropdown(true);
                
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
                setShowSearchDropdown(false);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    //helper function to update form field
    const updateFormField = (fieldName: string, value: string | number) => {
        onChange({
            target: {
                name: fieldName,
                value: value
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    //handle selection from search results
    const handleSelectAppointment = async (appointment: Appointment) => {
        try {
            setSearchLoading(true);
            console.log('Selected appointment data:', appointment);
            
            //hide dropdown immediately
            setShowSearchDropdown(false);
            setSearchResults([]);

            //first, try to get full appointment data for autofill
            let autofillSuccessful = false;
            
            if (onAutofill) {
                try {
                    const response = await getAppointmentForAutofill(String(appointment.id));
                    const autofillData = response.data;
                    console.log('Autofill API response:', autofillData);

                    //call the parent's autofill function
                    onAutofill(autofillData);
                    autofillSuccessful = true;
                } catch (autofillError) {
                    console.log('Autofill API not available, falling back to direct field updates');
                }
            }
            
            //if autofill API fails or doesn't exist, update fields directly
            if (!autofillSuccessful) {
                //format date properly for date input (YYYY-MM-DD)
                let formattedDate = '';
                if (appointment.dateOfBirth) {
                    const date = new Date(appointment.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0];
                    }
                }
                
                //create the data object with all available fields
                const fieldsToUpdate = {
                    fullName: appointment.fullName || 
                    `${appointment.firstName || ''} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName || ''}`.trim(),
                    dateOfBirth: formattedDate,
                    gender: appointment.gender || '',
                    phone: appointment.phone || '',
                    address: appointment.address || '',
                    email: appointment.email || '',
                    height: appointment.height ? appointment.height.toString() : '',
                    weight: appointment.weight ? appointment.weight.toString() : '',
                    bloodType: appointment.bloodType || ''
                };

                //update each field individually with a small delay to ensure proper state updates
                Object.entries(fieldsToUpdate).forEach(([fieldName, fieldValue], index) => {
                    if (fieldValue !== '' && fieldValue !== null && fieldValue !== undefined) {
                        setTimeout(() => {
                        updateFormField(fieldName, fieldValue);
                        }, index * 10); //small delay between updates
                    }
                });
            }

            } catch (error) {
            console.error('Error selecting appointment:', error);
            //even if there's an error, still update the name field
            const fallbackName = appointment.fullName || 
                                `${appointment.firstName || ''} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName || ''}`.trim();
            if (fallbackName) {
                updateFormField('fullName', fallbackName);
            }
        } finally {
            setSearchLoading(false);
        }
    };

    //handle input focus to show dropdown if there are results
    const handleInputFocus = () => {
        if (searchResults.length > 0 && formData?.fullName && formData.fullName.length >= 2) {
        setShowSearchDropdown(true);
        }
    };

    //close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    //cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    //calculate BMI when height or weight changes
    useEffect(() => {
        const height = parseFloat(formData?.height !== undefined && formData?.height !== null ? String(formData.height) : '');
        const weight = parseFloat(formData?.weight !== undefined && formData?.weight !== null ? String(formData.weight) : '');
        
        if (height && weight && height > 0) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            
            //update BMI in form data
            updateFormField('bmi', bmi);
        }
    }, [formData?.height, formData?.weight]);


  return (
    <div className={styles.sectionDivider}>
        {/* ersonal details section*/}
        <h4>Personal Details</h4>
        <div className={styles.formRow}>
            <div className={styles.searchContainer} ref={dropdownRef}>
                <label htmlFor='fullName'>Full Name *</label>
                <input
                    type='text'
                    id='fullName'
                    name='fullName'
                    value={formData?.fullName || ''}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Start typing patient's name to search..."
                    autoComplete="off"
                />
                
                {/* search dropdown */}
                {
                    showSearchDropdown && (
                        <div className={styles.searchDropdown}>
                        {
                            searchLoading ? (
                                <div className={styles.searchLoading}>Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((appointment: Appointment) => (
                                <div
                                    key={appointment.id}
                                    className={styles.searchItem}
                                    onClick={() => handleSelectAppointment(appointment)}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLDivElement).style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLDivElement).style.backgroundColor = 'white';
                                    }}
                                >
                                    <div><strong>
                                        {appointment.fullName || 
                                        `${appointment.firstName || ''} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName || ''}`.trim() ||
                                        'Unknown Name'}
                                    </strong></div>
                                    <div className={styles.appointmentBirthGender}>
                                        {appointment.dateOfBirth && new Date(appointment.dateOfBirth).toLocaleDateString()} 
                                        {appointment.gender && ` • ${appointment.gender}`}
                                    </div>
                                    {
                                        appointment.phone && (
                                            <div className={styles.appointmentContact}>{appointment.phone}</div>
                                        )
                                    }
                                    {
                                        appointment.address && (
                                            <div className={styles.appointmentContact}>{appointment.address}</div>
                                        )
                                    }
                                </div>
                                ))
                            ) : formData?.fullName && formData.fullName.length >= 2 && !searchLoading ? (
                                <div className={styles.noResults}>No appointments found</div>
                            ) : null
                        }
                        </div>
                    )
                }
            </div>
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='dateOfBirth'>Date of Birth *</label>
                <input
                    type='date'
                    id='dateOfBirth'
                    name='dateOfBirth'
                    value={formData?.dateOfBirth || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='gender'>Gender *</label>
                <select
                    id='gender'
                    name='gender'
                    value={formData?.gender || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                >
                    <option value=''>Select Gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                </select>
            </div>
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='bloodType'>Blood Type</label>
                <select
                    id='bloodType'
                    name='bloodType'
                    value={formData?.bloodType || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    required
                >
                    <option value=''>Select Blood Type</option>
                    <option value='A+'>A+</option>
                    <option value='A-'>A-</option>
                    <option value='B+'>B+</option>
                    <option value='B-'>B-</option>
                    <option value='AB+'>AB+</option>
                    <option value='AB-'>AB-</option>
                    <option value='O+'>O+</option>
                    <option value='O-'>O-</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='phone'>Phone Number *</label>
                <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData?.phone || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder='Enter contact number'
                />
            </div>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor='address'>Address</label>
            <textarea
            id='address'
            name='address'
            value={formData?.address || ''}
            onChange={onChange}
            className={styles.formControl}
            disabled={isLoading}
            placeholder="Enter address"
            />
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='email'>Email</label>
                <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData?.email || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Enter email address"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='emergencyContact'>Emergency Contact</label>
                <input
                    type='text'
                    id='emergencyContact'
                    name='emergencyContact'
                    value={formData?.emergencyContact || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Emergency contact person"
                />
            </div>
        </div>

        {/* medical history section */}
        <div className={styles.sectionDivider}>
            <h4>Medical History</h4>
            
            <div className={styles.formGroup}>
                <label htmlFor='allergies'>Known Allergies</label>
                <textarea
                    id='allergies'
                    name='allergies'
                    value={formData?.allergies || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="List any known allergies"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='chronicConditions'>Chronic Conditions</label>
                <textarea
                    id='chronicConditions'
                    name='chronicConditions'
                    value={formData?.chronicConditions || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="List any chronic conditions"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='previousSurgeries'>Previous Surgeries</label>
                <textarea
                    id='previousSurgeries'
                    name='previousSurgeries'
                    value={formData?.previousSurgeries || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="List any previous surgeries"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='familyHistory'>Family Medical History</label>
                <textarea
                    id='familyHistory'
                    name='familyHistory'
                    value={formData?.familyHistory || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Relevant family medical history"
                />
            </div>
        </div>

        {/* growth milestone section */}
        <div className={styles.sectionDivider}>
            <h4>Pediatric Growth Monitor</h4>
            
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

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='bmi'>BMI (Auto-calculated)</label>
                    <input
                        type='number'
                        id='bmi'
                        name='bmi'
                        value={formData?.bmi || ''}
                        className={styles.formControl}
                        step='0.1'
                        placeholder="BMI (calculated automatically)"
                        disabled={true}
                        readOnly
                    />
                </div>
                <div className={styles.formGroup}>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='growthNotes'>Growth Notes</label>
                <textarea
                    id='growthNotes'
                    name='growthNotes'
                    value={formData?.growthNotes || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Additional growth-related notes"
                />
            </div>
        </div>

        {/* current symptoms section */}
        <div className={styles.sectionDivider}>
            <h4>Current Symptoms</h4>
            
            <div className={styles.formGroup}>
                <label htmlFor='chiefComplaint'>Chief Complaint *</label>
                <input
                    type='text'
                    id='chiefComplaint'
                    name='chiefComplaint'
                    value={formData?.chiefComplaint || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Main reason for visit"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='symptomsDescription'>Symptoms Description *</label>
                <textarea
                    id='symptomsDescription'
                    name='symptomsDescription'
                    value={formData?.symptomsDescription || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Detailed description of symptoms"
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='symptomsDuration'>Duration of Symptoms</label>
                    <input
                    type='text'
                    id='symptomsDuration'
                    name='symptomsDuration'
                    value={formData?.symptomsDuration || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="e.g., 3 days, 2 weeks"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='painScale'>Pain Scale (1-10)</label>
                    <input
                    type='number'
                    id='painScale'
                    name='painScale'
                    value={formData?.painScale || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={1}
                    max={10}
                    placeholder="Rate pain 1-10"
                    disabled={isLoading}
                    />
                </div>
            </div>
        </div>

        {/* adddictional medical information */}
        <div className={styles.sectionDivider}>
            <h4>Additional Information</h4>
            
            <div className={styles.formGroup}>
                <label htmlFor='vaccinationHistory'>Vaccination History</label>
                <textarea
                    id='vaccinationHistory'
                    name='vaccinationHistory'
                    value={formData?.vaccinationHistory || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Recent vaccinations or immunization history"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='diagnosis'>Diagnosis</label>
                <textarea
                    id='diagnosis'
                    name='diagnosis'
                    value={formData?.diagnosis || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Medical diagnosis (to be filled by healthcare provider)"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='treatmentPlan'>Treatment Plan</label>
                <textarea
                    id='treatmentPlan'
                    name='treatmentPlan'
                    value={formData?.treatmentPlan || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Recommended treatment plan"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='prescribedMedications'>Prescribed Medications</label>
                <textarea
                    id='prescribedMedications'
                    name='prescribedMedications'
                    value={formData?.prescribedMedications || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="List of prescribed medications"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='consultationNotes'>Consultation Notes</label>
                <textarea
                    id='consultationNotes'
                    name='consultationNotes'
                    value={formData?.consultationNotes || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Additional notes from consultation"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='followUpDate'>Follow-up Date</label>
                <input
                    type='date'
                    id='followUpDate'
                    name='followUpDate'
                    value={formData?.followUpDate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                />
            </div>
        </div>
    </div>
  )
}

export default MedicalRecordForm