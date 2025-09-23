import React from 'react'
import styles from './PatientForm.module.css'
import { PatientFormProps } from '../../../../types';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import TextArea from '../../../ui/TextArea/TextArea';

const PatientForm: React.FC<PatientFormProps> = ({
    formData,
    onChange
}) => {
  return (
    <>
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
            label='Middle Name'
            name='middleName'
            placeholder="Patient's middle name"
            value={formData?.middleName || ''}
            onChange={onChange}
        />

        <br />

        <div className={styles.formRow}>
            <Input
                type='email'
                label='Email Address (Optional)'
                name='email'
                placeholder="Email Address (Optional)"
                value={formData?.email || ''}
                onChange={onChange}
            />

            <Input
                type='tel'
                label='Contact Number'
                name='contactNumber'
                placeholder="Contact Number"
                value={formData?.contactNumber || ''}
                onChange={onChange}
            />
        </div>

        <div className={styles.formRow}>
            <Input
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
            />

            <Select
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
            />
        </div>

        <TextArea
            name='address'
            label='Address'
            placeholder='Address'
            leftIcon='map-pin'
            value={formData?.address || ''}
            onChange={onChange}
            rows={3}
            resize='vertical'
        />

        <Input
            type='text'
            label="Religion"
            name='religion'
            placeholder="Religion"
            value={formData?.religion || ''}
            onChange={onChange}
        />

        <br />

        {/* mother's information section */}
        <div className={styles.sectionDivider}>
           <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    type='text'
                    label="Name"
                    name='motherInfo.name'
                    placeholder="Mother's name"
                    value={formData.motherInfo?.name || ''}
                    onChange={onChange}
                />

                <Input
                    type='number'
                    label="Age"
                    name='motherInfo.age'
                    placeholder="Mother's age"
                    value={formData.motherInfo?.age || ''}
                    onChange={onChange}
                />
            </div>

            <Input
                type='text'
                label="Occupation"
                name='motherInfo.occupation'
                placeholder="Mother's Occupation"
                value={formData.motherInfo?.occupation || ''}
                onChange={onChange}
            />
        </div>

        <br />

        {/* father's information section */}
        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <Input
                    type='text'
                    label="Name"
                    name='fatherInfo.name'
                    placeholder="Father's name"
                    value={formData.fatherInfo?.name || ''}
                    onChange={onChange}
                />

                <Input
                    type='number'
                    label="Age"
                    name='fatherInfo.age'
                    placeholder="Father's age"
                    value={formData.fatherInfo?.age || ''}
                    onChange={onChange}
                />
            </div>

            <Input
                type='text'
                label="Occupation"
                name='fatherInfo.occupation'
                placeholder="Father's Occupation"
                value={formData.fatherInfo?.occupation || ''}
                onChange={onChange}
            />
        </div>
    </>
  )
}

export default PatientForm