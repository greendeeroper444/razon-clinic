import React, { useState, useEffect, useRef } from 'react'
import styles from './MedicalRecordForm.module.css'
import { searchAppointmentsByName, getAppointmentForAutofill } from '../../../../services';
import { Appointment, MedicalRecordFormProps } from '../../../../types';
import { convertTo12HourFormat, formatDate } from '../../../../utils';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import TextArea from '../../../ui/TextArea/TextArea';
import { useMedicalRecordStore } from '../../../../stores';
import useScrollToError from '../../../../hooks/useScrollToError';


const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({formData, onChange, isLoading, onAutofill}) => {
    const [searchResults, setSearchResults] = useState<any>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
    const searchTimeoutRef = useRef<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const validationErrors = useMedicalRecordStore((state) => state.validationErrors);
    
    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'fullName',
            'dateOfBirth',
            'gender',
            'bloodType',
            'phone',
            'address',
            'email',
            'emergencyContact',
            'allergies',
            'chronicConditions',
            'previousSurgeries',
            'familyHistory',
            'height',
            'weight',
            'growthNotes',
            'chiefComplaint',
            'symptomsDescription',
            'symptomsDuration',
            'painScale',
            'vaccinationHistory',
            'diagnosis',
            'treatmentPlan',
            'prescribedMedications',
            'consultationNotes',
            'followUpDate'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });

    const getFieldError = (fieldName: string): string | undefined => {
        const errors = validationErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : undefined;
    };

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
                
                const results = response.data?.appointments || [];
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
            
            //hide dropdown immediately
            setShowSearchDropdown(false);
            setSearchResults([]);

            //IMPORTANT: store the appointmentId
            const appointmentIdToStore = String(appointment.id || appointment.appointmentId);
            setSelectedAppointmentId(appointmentIdToStore);
            
            //Update the appointmentId in form data immediately
            updateFormField('appointmentId', appointmentIdToStore);

            //first, try to get full appointment data for autofill
            let autofillSuccessful = false;
            
            if (onAutofill) {
                try {
                    const response = await getAppointmentForAutofill(appointmentIdToStore);
                    const autofillData = response.data;

                    //add appointmentId to autofill data
                    const dataWithAppointmentId = {
                        ...autofillData,
                        appointmentId: appointmentIdToStore
                    };

                    //call the parent's autofill function
                    onAutofill(dataWithAppointmentId);
                    autofillSuccessful = true;
                } catch (autofillError) {
                    console.log('Autofill API not available, falling back to direct field updates', autofillError);
                }
            }
            
            //if autofill api fails or doesn't exist, update fields directly
            if (!autofillSuccessful) {
                //format date properly for date input (YYYY-MM-DD)
                let formattedDate = '';
                if (appointment.dateOfBirth) {
                    const date = new Date(appointment.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0];
                    }
                }
                
                //create the data object with all available fields INCLUDING appointmentId
                const fieldsToUpdate = {
                    appointmentId: appointmentIdToStore,
                    fullName: appointment.fullName || 
                    `${appointment.firstName || ''} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName || ''}`.trim(),
                    dateOfBirth: formattedDate,
                    gender: appointment.gender || '',
                    phone: appointment.phone || '',
                    address: appointment.address || '',
                    email: appointment.email || '',
                    height: appointment.height ? appointment.height.toString() : '',
                    weight: appointment.weight ? appointment.weight.toString() : '',
                    bloodType: appointment.bloodType || '',
                    preferredDate: appointment.preferredDate || '',
                    preferredTime: appointment.preferredTime || ''
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
            //even if there's an error, still update the name field and appointmentId
            const appointmentIdToStore = String(appointment.id || appointment.appointmentId);
            updateFormField('appointmentId', appointmentIdToStore);
            
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
        {
            selectedAppointmentId && (
                <input type="hidden" name="appointmentId" value={selectedAppointmentId} />
            )
        }

        <h4>Personal Details</h4>
        <div className={styles.formRow}>
            <div className={styles.searchContainer} ref={dropdownRef}>
                <Input
                    ref={(el) => { fieldRefs.current['fullName'] = el; }}
                    type='text'
                    label='Full Name'
                    name='fullName'
                    value={formData?.fullName || ''}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    disabled={isLoading}
                    placeholder="Start typing patient's name to search..."
                    autoComplete="off"
                    leftIcon="user"
                    error={getFieldError('fullName')}
                />
                
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
                                    <div>
                                        <strong>
                                            {appointment.fullName || 
                                            `${appointment.firstName || ''} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName || ''}`.trim() ||
                                            'Unknown Name'}
                                        </strong>
                                    </div>
                                    <div>
                                        Appointment Day: {formatDate(String(appointment.preferredDate))} - {convertTo12HourFormat(String(appointment.preferredTime))}
                                    </div>
                                    <div className={styles.appointmentBirthGender}>
                                         {appointment.gender}
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
            <Input
                ref={(el) => { fieldRefs.current['dateOfBirth'] = el; }}
                type='date'
                label='Date of Birth'
                name='dateOfBirth'
                placeholder={formData.dateOfBirth ? undefined : 'Select date of birth'}
                leftIcon='calendar'
                value={formData.dateOfBirth || ''}
                onChange={onChange}
                onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.type = 'date';
                }}
                disabled={isLoading}
                error={getFieldError('dateOfBirth')}
            />

           <Select
                ref={(el) => { fieldRefs.current['gender'] = el; }}
                name='gender'
                label='Gender'
                leftIcon='users'
                placeholder='Select Gender'
                value={formData.gender || ''}
                onChange={onChange}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                ]}
                error={getFieldError('gender')}
            />
        </div>

        <div className={styles.formRow}>
            <Select
                ref={(el) => { fieldRefs.current['bloodType'] = el; }}
                name='bloodType'
                label='Blood Type'
                leftIcon='users'
                placeholder='Select Blood Type'
                value={formData.bloodType || ''}
                onChange={onChange}
                options={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                ]}
                error={getFieldError('bloodType')}
            />

            <Input
                ref={(el) => { fieldRefs.current['phone'] = el; }}
                type='tel'
                label='Phone'
                name='phone'
                placeholder="Enter a phone number"
                value={formData?.phone || ''}
                onChange={onChange}
                disabled={isLoading}
                error={getFieldError('phone')}
            />
        </div>

        <TextArea
            ref={(el) => { fieldRefs.current['address'] = el; }}
            name='address'
            label='Address'
            placeholder='Address'
            leftIcon='map-pin'
            value={formData?.address || ''}
            onChange={onChange}
            rows={3}
            resize='vertical'
            disabled={isLoading}
            error={getFieldError('address')}
        />

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['email'] = el; }}
                type='email'
                label='Email Address'
                name='email'
                placeholder="Enter an email address"
                value={formData?.email || ''}
                onChange={onChange}
                disabled={isLoading}
                error={getFieldError('email')}
            />

            <Input
                ref={(el) => { fieldRefs.current['emergencyContact'] = el; }}
                type='text'
                label='Emergency Contact'
                name='emergencyContact'
                placeholder="Emergency contact person"
                value={formData?.emergencyContact || ''}
                onChange={onChange}
                disabled={isLoading}
                error={getFieldError('emergencyContact')}
            />
        </div>

        <div className={styles.sectionDivider}>
            <h4>Medical History</h4>
            
            <TextArea
                ref={(el) => { fieldRefs.current['allergies'] = el; }}
                name='allergies'
                label='Known Allergies'
                placeholder='List any known allergies'
                value={formData?.allergies || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('allergies')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['chronicConditions'] = el; }}
                name='chronicConditions'
                label='Chronic Conditions'
                placeholder='List any known chronic conditions'
                value={formData?.chronicConditions || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('chronicConditions')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['previousSurgeries'] = el; }}
                name='previousSurgeries'
                label='Previous Surgeries'
                placeholder='List any known previous surgeries'
                value={formData?.previousSurgeries || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('previousSurgeries')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['familyHistory'] = el; }}
                name='familyHistory'
                label='Family History'
                placeholder='List any known family history'
                value={formData?.familyHistory || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('familyHistory')}
            />
        </div>

        <div className={styles.sectionDivider}>
            <h4>Pediatric Growth Monitor</h4>
            
            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['height'] = el; }}
                    type='number'
                    label='Height (cm)'
                    name='height'
                    placeholder="Height in cm"
                    value={formData?.height || ''}
                    onChange={onChange}
                    min={30}
                    max={300}
                    disabled={isLoading}
                    error={getFieldError('height')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['weight'] = el; }}
                    type='number'
                    label='Weight (kg)'
                    name='weight'
                    placeholder="Weight in kg"
                    value={formData?.weight || ''}
                    onChange={onChange}
                    min={1}
                    max={300}
                    disabled={isLoading}
                    error={getFieldError('weight')}
                />
            </div>

            <div className={styles.formRow}>
                <Input
                    type='number'
                    label='BMI (Auto-calculated)'
                    name='bmi'
                    placeholder="BMI (calculated automatically)"
                    value={formData?.bmi || ''}
                    onChange={onChange}
                    step='0.1'
                    disabled={true}
                    readOnly
                />
            </div>

            <TextArea
                ref={(el) => { fieldRefs.current['growthNotes'] = el; }}
                name='growthNotes'
                label='Growth Notes'
                placeholder='Additional growth-related notes'
                value={formData?.growthNotes || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('growthNotes')}
            />
        </div>

        <div className={styles.sectionDivider}>
            <h4>Current Symptoms</h4>
            
            <Input
                ref={(el) => { fieldRefs.current['chiefComplaint'] = el; }}
                type='text'
                label='Chief Complaint'
                name='chiefComplaint'
                placeholder="Main reason for visit"
                value={formData?.chiefComplaint || ''}
                onChange={onChange}
                disabled={isLoading}
                error={getFieldError('chiefComplaint')}
            />

            <br />

            <TextArea
                ref={(el) => { fieldRefs.current['symptomsDescription'] = el; }}
                name='symptomsDescription'
                label='Symptoms Description'
                placeholder='Detailed description of symptoms'
                value={formData?.symptomsDescription || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('symptomsDescription')}
            />

            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['symptomsDuration'] = el; }}
                    type='text'
                    label='Duration of Symptoms'
                    name='symptomsDuration'
                    placeholder="e.g., 3 days, 2 weeks"
                    value={formData?.symptomsDuration || ''}
                    onChange={onChange}
                    disabled={isLoading}
                    error={getFieldError('symptomsDuration')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['painScale'] = el; }}
                    type='number'
                    label='Pain Scale (1-10)'
                    name='painScale'
                    placeholder="Rate pain 1-10"
                    value={formData?.painScale || ''}
                    onChange={onChange}
                    min={1}
                    max={10}
                    disabled={isLoading}
                    error={getFieldError('painScale')}
                />
            </div>
        </div>

        <div className={styles.sectionDivider}>
            <h4>Additional Information</h4>
            
            <TextArea
                ref={(el) => { fieldRefs.current['vaccinationHistory'] = el; }}
                name='vaccinationHistory'
                label='Vaccination History'
                placeholder='Recent vaccinations or immunization history'
                value={formData?.vaccinationHistory || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('vaccinationHistory')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['diagnosis'] = el; }}
                name='diagnosis'
                label='Diagnosis'
                placeholder='Medical diagnosis (to be filled by healthcare provider)'
                value={formData?.diagnosis || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('diagnosis')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['treatmentPlan'] = el; }}
                name='treatmentPlan'
                label='Treatment Plan'
                placeholder='Recommended treatment plan'
                value={formData?.treatmentPlan || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('treatmentPlan')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['prescribedMedications'] = el; }}
                name='prescribedMedications'
                label='Prescribed Medications'
                placeholder='List of prescribed medications'
                value={formData?.prescribedMedications || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('prescribedMedications')}
            />

            <TextArea
                ref={(el) => { fieldRefs.current['consultationNotes'] = el; }}
                name='consultationNotes'
                label='Consultation Notes'
                placeholder='Additional notes from consultation'
                value={formData?.consultationNotes || ''}
                onChange={onChange}
                rows={3}
                resize='vertical'
                disabled={isLoading}
                error={getFieldError('consultationNotes')}
            />

            <Input
                ref={(el) => { fieldRefs.current['followUpDate'] = el; }}
                type='date'
                label='Follow-up Date'
                name='followUpDate'
                value={formData?.followUpDate || ''}
                onChange={onChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
                leftIcon='calendar'
                error={getFieldError('followUpDate')}
            />
        </div>
    </div>
  )
}

export default MedicalRecordForm