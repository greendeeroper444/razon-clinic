import React from 'react'
import styles from './PatientForm.module.css'
import { PatientFormProps } from '../../../../types';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import TextArea from '../../../ui/TextArea/TextArea';
import { usePatientStore } from '../../../../stores';
import useScrollToError from '../../../../hooks/useScrollToError';
import { getFieldError } from '../../../../utils';

const PatientForm: React.FC<PatientFormProps> = ({
    formData,
    onChange
}) => {
    const validationErrors = usePatientStore((state) => state.validationErrors);
    
    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'firstName',
            'lastName',
            'middleName',
            'email',
            'contactNumber',
            'birthdate',
            'sex',
            'address',
            'religion',
            'motherInfo.name',
            'motherInfo.age',
            'motherInfo.occupation',
            'fatherInfo.name',
            'fatherInfo.age',
            'fatherInfo.occupation'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });


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
  return (
    <>
        <Input
            ref={(el) => { fieldRefs.current['firstName'] = el; }}
            type='text'
            label='First Name'
            name='firstName'
            placeholder="Patient's first name"
            value={formData?.firstName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors, 'firstName')}
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
            error={getFieldError(validationErrors, 'lastName')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['middleName'] = el; }}
            type='text'
            label='Middle Name'
            name='middleName'
            placeholder="Patient's middle name"
            value={formData?.middleName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors, 'middleName')}
        />

        <br />

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['email'] = el; }}
                type='email'
                label='Email Address (Optional)'
                name='email'
                placeholder="Email Address (optional)"
                value={formData?.email || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'email')}
            />

            <Input
                ref={(el) => { fieldRefs.current['contactNumber'] = el; }}
                type='tel'
                label='Contact Number'
                name='contactNumber'
                placeholder="Contact Number"
                value={formData?.contactNumber || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'contactNumber')}
            />
        </div>

        <div className={styles.formRow}>
            <Input
                ref={(el) => { fieldRefs.current['birthdate'] = el; }}
                type='date'
                label='Birthday'
                name='birthdate'
                placeholder={formData.birthdate ? undefined : 'Select your birthdate'}
                leftIcon='calendar'
                value={formData.birthdate || ''}
                onChange={onChange}
                onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.type = 'date';
                }}
                error={getFieldError(validationErrors, 'birthdate')}
            />

            <Select
                ref={(el) => { fieldRefs.current['sex'] = el; }}
                name='sex'
                label='Gender'
                title='Select Gender'
                leftIcon='users'
                placeholder='Select Gender'
                value={formData.sex || ''}
                onChange={onChange}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                ]}
                error={getFieldError(validationErrors, 'sex')}
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
            error={getFieldError(validationErrors, 'address')}
        />

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

        {/* mother's information section */}
        <div className={styles.sectionDivider}>
           <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['motherInfo.name'] = el; }}
                    type='text'
                    label="Name"
                    name='motherInfo.name'
                    placeholder="Mother's name"
                    value={formData.motherInfo?.name || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors, 'motherInfo.name')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['motherInfo.age'] = el; }}
                    type='number'
                    label="Age"
                    name='motherInfo.age'
                    placeholder="Mother's age"
                    value={formData.motherInfo?.age || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors, 'motherInfo.age')}
                />
            </div>

            <Input
                ref={(el) => { fieldRefs.current['motherInfo.occupation'] = el; }}
                type='text'
                label="Occupation"
                name='motherInfo.occupation'
                placeholder="Mother's Occupation"
                value={formData.motherInfo?.occupation || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'motherInfo.occupation')}
            />
        </div>

        <br />

        {/* father's information section */}
        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    ref={(el) => { fieldRefs.current['fatherInfo.name'] = el; }}
                    type='text'
                    label="Name"
                    name='fatherInfo.name'
                    placeholder="Father's name"
                    value={formData.fatherInfo?.name || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors, 'fatherInfo.name')}
                />

                <Input
                    ref={(el) => { fieldRefs.current['fatherInfo.age'] = el; }}
                    type='number'
                    label="Age"
                    name='fatherInfo.age'
                    placeholder="Father's age"
                    value={formData.fatherInfo?.age || ''}
                    onChange={onChange}
                    error={getFieldError(validationErrors, 'fatherInfo.age')}
                />
            </div>

            <Input
                ref={(el) => { fieldRefs.current['fatherInfo.occupation'] = el; }}
                type='text'
                label="Occupation"
                name='fatherInfo.occupation'
                placeholder="Father's Occupation"
                value={formData.fatherInfo?.occupation || ''}
                onChange={onChange}
                error={getFieldError(validationErrors, 'fatherInfo.occupation')}
            />
        </div>
    </>
  )
}

export default PatientForm