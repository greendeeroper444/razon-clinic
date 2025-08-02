import { ChangeEvent } from 'react'

export interface AppointmentFormProps {
    formData: AppointmentFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isLoading: boolean;
    patients: Array<{ id: string; firstName: string; lastName: string; middleName: string | null; userNumber: string; }>;
}

export interface AppointmentFormData {
    id: string;
    userId? : string;
    appointmentNumber?: number;
    firstName?: string;
    lastName?: string;
    middleName?: string | null;
    sex?: string;
    height?: number | string;
    weight?: number | string;
    birthdate?: number | string;
    
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
        age?: number | string;
        occupation: string;
    };
    fatherInfo?: {
        name: string;
        age?: number | string;
        occupation: string;
    };
    contactNumber: number | string;
    address?: string;
    religion?: string;
    preferredDate: string;
    preferredTime: string;
    reasonForVisit: string;
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    patients?: {
        firstName?: string;
        lastName?: string;
        middleName?: string | null;
        birthdate?: string;
        sex?: string;
        height?: number | string;
        weight?: number | string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}

export interface UserId {
    id: string;
    firstName: string;
    userNumber: string;
    address: string;
}
export interface Appointment {
    id: string;
    userId: UserId;
    fullName: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    dateOfBirth?: string;
    birthdate: string;
    sex?: 'Male' | 'Female';
    gender?: string;
    phone?: string;
    address?: string;
    religion?: string;
    email?: string;
    height?: number | string;
    weight?: number | string;
    bloodType?: string;
    appointmentNumber: string;
    reasonForVisit: string;
    contactNumber: string;
    motherInfo?: {
        name: string;
        age?: number | string;
        occupation: string;
    };
    fatherInfo?: {
        name: string;
        age?: number | string;
        occupation: string;
    };
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    preferredTime?: number | string;
    preferredDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface AutofillData {
    [key: string]: string | number | undefined;
}


export interface AppointmentStatusUpdate {
    status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
}

export type AppointmentStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';

export interface ParentInfo {
    name: string;
    age?: number | string;
    occupation: string;
}



export interface AppointmentResponse extends AppointmentFormData {
    success: boolean;
    message: string;
    middleName: string | null;
    data: {
        success: boolean;
        data: Appointment[];
    };
}

export interface AppointmentFilters {
    userId?: string;
    status?: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Rebooked';
    fromDate?: string;
    toDate?: string;
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
//     UserId?: UserId;
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
