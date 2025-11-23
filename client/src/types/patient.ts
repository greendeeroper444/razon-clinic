import { ChangeEvent } from "react";
import { UserId } from "./appointment";

export interface PatientFormProps {
    formData: PatientFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface PatientFormData {
    id?: string;
    patientNumber?: number;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    suffix?: string | null;
    email: string;
    contactNumber: string;
    birthdate: string;
    age?: number | string;
    sex: 'Male' | 'Female' | 'Other' | '';
    address: string;
    religion?: string;
    height? : number;
    weight?: number;
    motherInfo?: {
        name?: string;
        age?: number;
        occupation?: string;
    };
    fatherInfo?: {
        name?: string;
        age?: number;
        occupation?: string;
    };
    isArchived?: boolean
    archivedAt?: string
    archivedBy?: {
        id: string
        firstName: string
        lastName: string
    }
    religionOther?: string;
}


export interface PatientDisplayData extends PatientFormData {
    initials: string;
    age: number | string;
}

// export interface Patient extends PatientFormData {
//     _id: string;
//     createdAt?: string;
//     updatedAt?: string;
// }

export interface PatientComponentProps {
    patient?: Patient;
    onEdit?: (patient: Patient) => void;
    onDelete?: (patient: Patient) => void;
    onArchive?: (patient: Patient) => void;
}




export interface GetPatientsResponse {
    success: boolean;
    message: string;
    data: {
        patients: Patient[];
        total?: number;
        page?: number;
        limit?: number;
    };
}

export interface PatientResponse extends PatientFormData {
    success: boolean;
    message: string;
    data: {
        patient: Patient;
    };
}



export interface PatientQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sex?: 'Male' | 'Female' | 'Other';
    isArchive?: boolean;
    sortBy?: 'firstName' | 'createdAt' | 'birthdate';
    sortOrder?: 'asc' | 'desc';
}

//for the transform function
export interface PatientApiResponse {
    id?: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    email: string;
    contactNumber: string;
    birthdate: string;
    sex: 'Male' | 'Female' | 'Other' | '';
    address: string;
    religion?: string;
    motherInfo?: {
        name?: string;
        age?: number;
        occupation?: string;
    };
    fatherInfo?: {
        name?: string;
        age?: number;
        occupation?: string;
    };
    isArchived?: boolean;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Patient {
    id: string;
    patientNumber?: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email?: string;
    contactNumber?: string;
    birthdate: string;
    sex: string;
    address: string;
    isArchived?: boolean
    archivedAt?: string
    archivedBy?: {
        id: string
        firstName: string
        lastName: string
    }
    lastActiveAt: string
}

export interface PatientData {
    id: string;
    patientId?: string;
    userId: UserId;
    fullName: string;
    firstName?: string;
    middleName?: string | null;
    suffix?: string | null;
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

// export interface PatientFormData {
//     id?: string;
//     patientNumber?: string;
//     firstName: string;
//     lastName: string;
//     middleName: string;
//     email?: string;
//     contactNumber?: string;
//     password?: string;
//     birthdate: string;
//     sex: 'Male' | 'Female' | 'Other' | ''; 
//     address: string;
//     dateRegistered?: string;
//     role?: 'Patient' | 'Doctor' | 'Staff';
//     createdAt?: string;
//     updatedAt?: string;
// }

export interface PatientDetailed extends Patient {
    email?: string;
    contactNumber?: string;
    birthdate: Date;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    dateRegistered: Date;
    role: 'Patient' | 'Doctor' | 'Staff';
    createdAt: Date;
    updatedAt: Date;
}

export interface PatientsResponse {
    status: string;
    results?: number;
    data: {
        patients: Patient[];
    };
}

// export interface PatientResponse {
//     status: string;
//     data: {
//         patient: PatientDetailed;
//     };
// }

export interface PatientProcessingData {
    firstName?: string;
    lastName?: string;
    middleName?: string | null;
    birthdate?: string | number;
    sex?: string;
    height?: number | string;
    weight?: number | string;
}