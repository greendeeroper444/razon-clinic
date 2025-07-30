import React from 'react'
import styles from './DeleteForm.module.css'
import { DeleteFormProps } from '../../../../types'
import Button from '../../../ui/Button/Button'

const DeleteForm: React.FC<DeleteFormProps> = ({
    itemName,
    itemType,
    onCancel,
    onConfirm,
    isDeleting = false
}) => {
  return (
    <div className={styles.deleteFormContainer}>
        <div className={styles.deleteWarningIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM26 34H22V30H26V34ZM26 26H22V14H26V26Z" fill="#FF4D4F"/>
            </svg>
        </div>
        
        <h3 className={styles.deleteTitle}>Delete {itemType}</h3>
        
        <p className={styles.deleteMessage}>
            Are you sure you want to delete <strong>{itemName}</strong>? 
            This action cannot be undone.
        </p>
        
        <div className={styles.deleteActions}>
            <Button
                variant='secondary'
                type='button'
                onClick={onCancel}
                disabled={isDeleting}
            >
                Cancel
            </Button>
            <Button
                variant='delete'
                type='button'
                onClick={onConfirm}
                isLoading={isDeleting}
                loadingText="Deleting..."
            >
                Delete
            </Button>
        </div>
    </div>
  )
}

export default DeleteForm