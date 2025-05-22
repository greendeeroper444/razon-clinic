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

export interface NotificationComponentProps {
  isVisible: boolean;
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