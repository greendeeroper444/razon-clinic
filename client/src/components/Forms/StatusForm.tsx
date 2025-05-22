import React from 'react'
import styles from '../ModalComponent/ModalComponent.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCalendarCheck, 
  faCheckCircle, 
  faTimes, 
  faRedo,
  faClock
} from '@fortawesome/free-solid-svg-icons'

interface StatusFormProps {
  currentStatus?: string;
  onStatusChange: (status: string) => void;
}

const StatusForm: React.FC<StatusFormProps> = ({currentStatus, onStatusChange}) => {
    const statusOptions = [
        {
            value: 'Pending',
            label: 'Pending',
            icon: faClock,
            color: '#8B5CF6',
            description: 'Appointment is awaiting confirmation'
        },
        {
            value: 'Scheduled',
            label: 'Scheduled',
            icon: faCalendarCheck,
            color: '#3B82F6',
            description: 'Appointment is scheduled and confirmed'
        },
        {
            value: 'Completed',
            label: 'Completed',
            icon: faCheckCircle,
            color: '#10B981',
            description: 'Appointment has been completed successfully'
        },
        {
            value: 'Cancelled',
            label: 'Cancelled',
            icon: faTimes,
            color: '#EF4444',
            description: 'Appointment has been cancelled'
        },
        {
            value: 'Rebooked',
            label: 'Rebooked',
            icon: faRedo,
            color: '#F59E0B',
            description: 'Appointment has been rescheduled'
        }
    ];

  return (
    <div className={styles.statusFormContainer}>
        <div className={styles.statusFormHeader}>
            <h3>Update Appointment Status</h3>
            <p>Select the new status for this appointment</p>
        </div>
        
        <div className={styles.statusOptionsGrid}>
            {
                statusOptions.map((option) => (
                    <div
                        key={option.value}
                        className={`
                            ${styles.statusOption} 
                            ${currentStatus === option.value ? styles.statusOptionActive : ''}
                            ${currentStatus === option.value ? styles[`statusOptionColor${option.value}`] : ''}
                        `}
                        onClick={() => onStatusChange(option.value)}
                    >
                        <div className={styles.statusOptionHeader}>
                            <FontAwesomeIcon 
                                icon={option.icon} 
                                className={styles.statusOptionIcon}
                                style={{ color: option.color }}
                            />
                            <span 
                                className={`
                                    ${styles.statusOptionLabel} 
                                    ${currentStatus === option.value ? styles.statusOptionLabelActive : styles.statusOptionLabelInactive}
                                `}
                                data-status-color={option.color}
                            >
                                {option.label}
                            </span>
                        </div>
                        <p className={styles.statusOptionDescription}>
                            {option.description}
                        </p>
                    </div>
                ))
            }
        </div>
        
        {
            
            currentStatus && (
                <div className={styles.currentStatusIndicator}>
                    <span>Current Status: </span>
                    <strong
                        className={
                            currentStatus
                                ? styles[`statusColor${currentStatus}`]
                                : ''
                        }
                    >
                        {currentStatus}
                    </strong>
                </div>
            )
        }
    </div>
  )
}

export default StatusForm