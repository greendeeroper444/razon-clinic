import { ChangeEvent } from 'react'
import { Patient } from './patient';

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



export type Appointment = {
    _id: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    appointmentNumber: string;
    preferredDate: string;
    preferredTime: string;
    reasonForVisit: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    patientId: Patient;
    birthdate: string;
    sex: string;
    height: number;
    weight: number;
    motherInfo: {
        name: string;
        age: number;
        occupation: string;
    };
    fatherInfo: {
        name: string;
        age: number;
        occupation: string;
    };
    religion: string;
    contactNumber: number | string;
    address: string;
};
