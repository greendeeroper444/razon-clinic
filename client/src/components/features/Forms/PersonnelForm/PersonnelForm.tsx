import React from 'react'
import { PersonnelFormProps } from '../../../../types';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import useScrollToError from '../../../../hooks/useScrollToError';
import { usePersonnelStore } from '../../../../stores';
import { getFieldError } from '../../../../utils';

const PersonnelForm: React.FC<PersonnelFormProps> = ({
    formData,
    onChange
}) => {
    const validationErrors = usePersonnelStore((state) => state.validationErrors);

    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'firstName',
            'lastName',
            'middleName',
            'suffix',
            'contactNumber',
            'password',
            'birthdate',
            'sex',
            'address',
            'role'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });

    const isEditMode = !!formData?.id;

  return (
    <>
        <Input
            ref={(el) => { fieldRefs.current['firstName'] = el; }}
            type='text'
            label='First Name *'
            name='firstName'
            placeholder='Enter first name'
            value={formData?.firstName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors, 'firstName')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['lastName'] = el; }}
            type='text'
            label='Last Name *'
            name='lastName'
            placeholder='Enter last name'
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
            placeholder='Enter middle name (optional)'
            value={formData?.middleName || ''}
            onChange={onChange}
            error={getFieldError(validationErrors, 'middleName')}
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

        <Input
            ref={(el) => { fieldRefs.current['contactNumber'] = el; }}
            type='text'
            label='Contact Number *'
            name='contactNumber'
            placeholder='Contact number'
            value={formData?.contactNumber || ''}
            onChange={onChange}
            leftIcon='phone'
            error={getFieldError(validationErrors, 'contactNumber')}
        />

        <br />

        {
            !isEditMode && (
                <>
                    <Input
                        ref={(el) => { fieldRefs.current['password'] = el; }}
                        type='password'
                        label='Password *'
                        name='password'
                        placeholder='Enter password'
                        value={formData?.password || ''}
                        onChange={onChange}
                        leftIcon='lock'
                        error={getFieldError(validationErrors, 'password')}
                    />

                    <br />
                </>
            )
        }

        <Input
            ref={(el) => { fieldRefs.current['birthdate'] = el; }}
            type='date'
            label='Birthdate *'
            name='birthdate'
            value={formData?.birthdate || ''}
            onChange={onChange}
            leftIcon='calendar'
            error={getFieldError(validationErrors, 'birthdate')}
        />

        <br />

        <Select
            ref={(el) => { fieldRefs.current['sex'] = el; }}
            name='sex'
            label='Sex *'
            title='Select Sex'
            leftIcon='user'
            placeholder='Select Sex'
            value={formData?.sex || ''}
            onChange={onChange}
            options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
            ]}
            error={getFieldError(validationErrors, 'sex')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['address'] = el; }}
            type='text'
            label='Address *'
            name='address'
            placeholder='Enter complete address'
            value={formData?.address || ''}
            onChange={onChange}
            leftIcon='home'
            error={getFieldError(validationErrors, 'address')}
        />

        <br />

        <Select
            ref={(el) => { fieldRefs.current['role'] = el; }}
            name='role'
            label='Role *'
            title='Select Role'
            leftIcon='briefcase'
            placeholder='Select Role'
            value={formData?.role || ''}
            onChange={onChange}
            options={[
                { value: 'Doctor', label: 'Doctor' },
                { value: 'Staff', label: 'Staff' }
            ]}
            error={getFieldError(validationErrors, 'role')}
        />
    </>
  )
}

export default PersonnelForm