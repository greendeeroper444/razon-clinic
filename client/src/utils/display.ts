import { faPills, faSyringe, faTablets, faCapsules, faPrescriptionBottle, faCheck, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Appointment, ModalType, OperationType } from '../types';

export const getItemIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'vaccine':
            return faSyringe;
        case 'tablets':
            return faTablets;
        case 'capsules':
            return faCapsules;
        case 'medical supply':
            return faPrescriptionBottle;
        default:
            return faPills;
    }
};

export const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'critical';
    if (quantity <= 10) return 'low';
    if (quantity <= 50) return 'medium';
    return 'high';
};

export const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'good';
};



export const getAppointmentStatusClass = (status: string, styles: any) => {
    switch (status) {
        case 'Pending':
            return styles.statusPending;
        case 'Scheduled':
            return styles.statusScheduled;
        case 'Completed':
            return styles.statusCompleted;
        case 'Cancelled':
            return styles.statusCancelled;
        case 'Rebooked':
            return styles.statusRebooked;
        default:
            return '';
    }
};


export const getStatusColor = (status: Appointment['status']): string => {
    switch (status) {
        case 'Pending': 
            return 'var(--warning)';
        case 'Scheduled': 
            return 'var(--primary)';
        case 'Completed': 
            return 'var(--success)';
        case 'Cancelled': 
            return 'var(--danger)';
        case 'Rebooked': 
            return 'var(--appointment)';
        default: 
            return 'var(--gray)';
    }
};


export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Paid':
            return faCheck;
        case 'Pending':
            return faClock;
        case 'Unpaid':
            return faExclamationTriangle;
        default:
            return faClock;
    }
};

export const getPaymentStatusClass = (status: string, styles: any) => {
    switch (status) {
        case 'Paid':
            return styles.statusPaid;
        case 'Pending':
            return styles.statusPending;
        case 'Unpaid':
            return styles.statusUnpaid;
        default:
            return styles.statusPending;
    }
};


export const getLoadingText = (operation: OperationType, modalType: ModalType): string => {
    switch (operation) {
        case 'update':
            return `Updating ${modalType}...`;
        case 'delete':
            return `Deleting ${modalType}...`;
        case 'status':
            return 'Updating status...';
        case 'create':
            return `Creating ${modalType}...`;
        case 'fetch':
            return `Loading ${modalType}...`;
        default:
            return 'Processing...';
    }
}








//helper function to get medical record id as string (wait)
export const getMedicalRecordId = (medicalRecordId: any): string => {
    if (!medicalRecordId) return 'N/A';
    
    //if it's a string (ObjectId), return the last 8 characters
    if (typeof medicalRecordId === 'string') {
        return medicalRecordId.slice(-8).toUpperCase();
    }
    
    //if it's an object (populated), get the _id field
    if (typeof medicalRecordId === 'object' && medicalRecordId.id) {
        return medicalRecordId.id.toString().slice(-8).toUpperCase();
    }
    
    return 'N/A';
};