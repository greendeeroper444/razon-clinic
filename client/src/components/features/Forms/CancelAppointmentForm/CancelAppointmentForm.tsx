import React, { ChangeEvent } from 'react'

interface CancelAppointmentFormProps {
    reason: string
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

const CancelAppointmentForm: React.FC<CancelAppointmentFormProps> = ({ reason, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                Please provide a reason for cancelling this appointment.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                    htmlFor="cancellationReason"
                    style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}
                >
                    Reason for Cancellation <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                    id="cancellationReason"
                    name="cancellationReason"
                    value={reason}
                    onChange={onChange}
                    placeholder="Enter reason for cancellation..."
                    maxLength={500}
                    rows={4}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    autoFocus
                />
                <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'flex-end' }}>
                    {reason.length}/500
                </span>
            </div>
        </div>
    )
}

export default CancelAppointmentForm