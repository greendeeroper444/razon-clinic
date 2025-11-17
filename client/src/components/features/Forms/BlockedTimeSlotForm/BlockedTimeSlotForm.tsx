import React from 'react'
import { BlockedTimeSlotFormProps } from '../../../../types';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import useScrollToError from '../../../../hooks/useScrollToError';
import { useBlockedTimeSlotStore } from '../../../../stores';

const BlockedTimeSlotForm: React.FC<BlockedTimeSlotFormProps> = ({
    formData,
    onChange
}) => {
    const validationErrors = useBlockedTimeSlotStore((state) => state.validationErrors);

    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'startDate',
            'endDate',
            'startTime',
            'endTime',
            'reason',
            'customReason'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });

    const getFieldError = (fieldName: string): string | undefined => {
        const errors = validationErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : undefined;
    };

    const today = new Date().toISOString().split('T')[0];

    const formatTimeToInterval = (timeString: string): string => {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) return '';
        
        const roundedMinutes = Math.round(minutes / 15) * 15;
        
        let finalHours = hours;
        let finalMinutes = roundedMinutes;
        
        if (finalMinutes === 60) {
            finalHours = (hours + 1) % 24;
            finalMinutes = 0;
        }
        
        const formattedHours = String(finalHours).padStart(2, '0');
        const formattedMinutes = String(finalMinutes).padStart(2, '0');
        
        return `${formattedHours}:${formattedMinutes}`;
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        const formattedTime = formatTimeToInterval(value);
        
        const formattedEvent = {
            ...e,
            target: {
                ...e.target,
                name,
                value: formattedTime
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(formattedEvent);
    };

  return (
    <>
        <Input
            ref={(el) => { fieldRefs.current['startDate'] = el; }}
            type='date'
            label='Start Date'
            name='startDate'
            value={formData?.startDate || ''}
            onChange={onChange}
            leftIcon='calendar'
            min={today}
            error={getFieldError('startDate')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['endDate'] = el; }}
            type='date'
            label='End Date'
            name='endDate'
            value={formData?.endDate || ''}
            onChange={onChange}
            leftIcon='calendar'
            min={formData?.startDate || today}
            error={getFieldError('endDate')}
        />

        <br />

        {/* <Input
            ref={(el) => { fieldRefs.current['startTime'] = el; }}
            type='time'
            label='Start Time'
            name='startTime'
            value={formData?.startTime || ''}
            onChange={handleTimeChange}
            leftIcon='clock'
            step="900"
            error={getFieldError('startTime')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['endTime'] = el; }}
            type='time'
            label='End Time'
            name='endTime'
            value={formData?.endTime || ''}
            onChange={handleTimeChange}
            leftIcon='clock'
            step="900"
            error={getFieldError('endTime')}
        /> */}

        <br />

        <Select
            ref={(el) => { fieldRefs.current['reason'] = el; }}
            name='reason'
            label='Reason'
            title='Select Reason'
            leftIcon='info'
            placeholder='Select Reason'
            value={formData?.reason || ''}
            onChange={onChange}
            options={[
                { value: 'Meeting', label: 'Meeting' },
                { value: 'Holiday', label: 'Holiday' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Emergency', label: 'Emergency' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Other', label: 'Other' }
            ]}
            error={getFieldError('reason')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['customReason'] = el; }}
            type='textarea'
            label='Additional Details (Optional)'
            name='customReason'
            placeholder='Enter additional details or explanation...'
            value={formData?.customReason || ''}
            onChange={onChange}
            rows={3}
            error={getFieldError('customReason')}
        />
    </>
  )
}

export default BlockedTimeSlotForm