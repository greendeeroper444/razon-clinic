import { NotificationType, NotificationUIMapping } from '../types';
import { 
    faCalendar, 
    faNotesMedical, 
    faUser, 
    faBoxOpen,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';


export const notificationTypeMapping: Record<NotificationType, NotificationUIMapping> = {
    AppointmentReminder: {
        icon: faCalendar,
        color: '#4299e1',
        displayName: 'Appointment Reminder'
    },
    AppointmentCreated: {
        icon: faCalendar,
        color: '#48bb78',
        displayName: 'New Appointment'
    },
    AppointmentUpdated: {
        icon: faCalendar,
        color: '#ecc94b', 
        displayName: 'Appointment Update'
    },
    AppointmentCancelled: {
        icon: faCalendar,
        color: '#f56565',
        displayName: 'Appointment Cancelled'
    },
    PatientCreated: {
        icon: faUser,
        color: '#48bb78',
        displayName: 'New Patient'
    },
    MedicalRecordUpdated: {
        icon: faNotesMedical,
        color: '#805ad5',
        displayName: 'Medical Record Update'
    },
    LowStock: {
        icon: faBoxOpen,
        color: '#ed8936',
        displayName: 'Low Stock Alert'
    },
    ExpiredItem: {
        icon: faExclamationTriangle,
        color: '#f56565',
        displayName: 'Item Expired'
    }
};

//format notification date for display
export const formatNotificationDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    //calculate the difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    //less than a minute
    if (diffSecs < 60) {
        return 'Just now';
    }
    //less than an hour
    else if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    }
    //less than a day
    else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    //less than a week
    else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    //otherwise, display formatted date
    else {
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
};