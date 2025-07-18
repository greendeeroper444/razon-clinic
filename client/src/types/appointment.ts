import { ChangeEvent } from 'react'

export interface AppointmentFormProps {
    formData: AppointmentFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isLoading: boolean;
    patients: Array<{ id: string; firstName: string; lastName: string; middleName: string | null; patientNumber: string; }>;
}

export interface AppointmentFormData {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    preferredDate: string;
    preferredTime: string;
    reasonForVisit: string;
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    sex?: string;
    height?: number | string;
    weight?: number | string;
    religion?: string;
    birthdate: number | string | undefined;
    
    //flattened mother information
    motherName?: string;
    motherAge?: number | string;
    motherOccupation?: string;
    
    //flattened father information
    fatherName?: string;
    fatherAge?: number | string;
    fatherOccupation?: string;
    //nested structure for backward compatibility if needed
    motherInfo?: {
        name: string;
        age: number | string;
        occupation: string;
    };
    fatherInfo?: {
        name: string;
        age: number | string;
        occupation: string;
    };
    contactNumber: number | string;
    address?: string;
}

export interface PatientId {
    patientNumber: string;
}
export interface Appointment {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    email?: string;
    height?: number | string;
    weight?: number | string;
    bloodType?: string;
    appointmentNumber: string;
    reasonForVisit: string;
    contactNumber: string;
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    patientId?: PatientId;
}

export interface AutofillData {
    [key: string]: string | number | undefined;
}


export interface AppointmentStatusUpdate {
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
}



export interface ParentInfo {
    name: string;
    age: number | string;
    occupation: string;
}



export interface AppointmentResponse {
    id: string;   
    firstName: string;
    lastName: string;
    middleName: string | null;
    preferredDate: string;
    preferredTime: string;
    reasonForVisit: string;
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    
    //patient information fields
    birthdate?: string;
    sex?: 'Male' | 'Female';
    height?: number | string;
    weight?: number | string;
    religion?: string;
    
    //flattened parent information (if using this approach)
    motherName?: string;
    motherAge?: number | string;
    motherOccupation?: string;
    fatherName?: string;
    fatherAge?: number | string;
    fatherOccupation?: string;
    
    //nested parent information structures (what function expects)
    motherInfo?: ParentInfo;
    fatherInfo?: ParentInfo;
    contactNumber: number | string;
    address?: string;
    appointmentNumber: string;
    createdAt: string;
    updatedAt: string;
    data: {
        success: boolean;
        data: Appointment[];
    };
}

export interface AppointmentFilters {
    patientId?: string;
    status?: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    fromDate?: string;
    toDate?: string;
}

export interface DeleteFormProps {
    itemName: string;
    itemType: string;
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}


// export interface AppointmentCalendar {
//     id: string;
//     appointmentNumber: string;
//     firstName: string;
//     middleName?: string;
//     lastName: string;
//     reasonForVisit: string;
//     contactNumber: string;
//     address: string;
//     status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
//     patientId?: PatientId;
// }

export interface AppointmentDataCalendar {
    success: boolean;
    totalAppointments: number;
    availableTimeSlots: string[];
    timeSlots: {
        [key: string]: Appointment[];
    };
}

// export interface ApiResponse {
//     data: AppointmentData;
// }

export interface AppointmentCounts {
    [dateKey: string]: number;
}
