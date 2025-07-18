export interface Notification {
    id: string;
    sourceId?: string;
    sourceType: 'Patient' | 'Doctor' | 'Secretary' | 'System';
    type: NotificationType;
    entityId?: string;
    entityType?: 'Appointment' | 'Patient' | 'MedicalRecord' | 'Inventory';
    message: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export type NotificationType = 
    'AppointmentReminder' | 
    'AppointmentCreated' |
    'AppointmentUpdated' |
    'AppointmentCancelled' |
    'PatientCreated' |
    'MedicalRecordUpdated' |
    'LowStock' | 
    'ExpiredItem';

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification[];
    unreadCount?: number;
}

// export interface NotificationComponentProps {
//   isVisible: boolean;
// }
export interface NotificationComponentProps {
    isVisible: boolean;
    onUnreadCountChange?: (count: number) => void;
    onClose: () => void;
}


//for mapping notification types to UI categories
export const NotificationTypeToUICategory = {
    'AppointmentReminder': 'appointment',
    'AppointmentCreated': 'appointment',
    'AppointmentUpdated': 'appointment',
    'AppointmentCancelled': 'appointment',
    'PatientCreated': 'patient',
    'MedicalRecordUpdated': 'medical',
    'LowStock': 'inventory',
    'ExpiredItem': 'inventory'
};

export interface NotificationFilters {
    recipientType?: 'Patient' | 'Doctor' | 'Secretary' | 'System';
    recipientId?: string;
    type?: NotificationType;
    isRead?: boolean;
    entityType?: 'Appointment' | 'Patient' | 'MedicalRecord' | 'Inventory';
    entityId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}


export type NotificationUIMapping = {
    icon: any;
    color: string;
    displayName: string;
};