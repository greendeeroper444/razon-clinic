import React, { ChangeEvent } from 'react'
import styles from './CancelAppointmentForm.module.css'
import TextArea from '../../../ui/TextArea/TextArea'

interface CancelAppointmentFormProps {
    reason: string
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

const CancelAppointmentForm: React.FC<CancelAppointmentFormProps> = ({ reason, onChange }) => {
  return (
    <div className={styles.container}>
        <p className={styles.description}>
            Please provide a reason for cancelling this appointment.
        </p>
        <TextArea
            label="Reason for Cancellation *"
            id="cancellationReason"
            name="cancellationReason"
            value={reason}
            onChange={onChange}
            placeholder="Enter reason for cancellation..."
            maxLength={500}
            rows={4}
            resize="vertical"
            showCharCount={true}
            autoFocus
        />
    </div>
  )
}

export default CancelAppointmentForm