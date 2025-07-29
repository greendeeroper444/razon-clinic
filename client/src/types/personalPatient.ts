import { ChangeEvent } from "react";

export interface PatientFormProps {
    formData: PersonalPatientFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface PersonalPatientFormData {
    id?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    contactNumber: string;
    birthdate: string;
    age?: number | string;
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
    isArchive?: boolean;
}


export interface PersonalPatientDisplayData extends PersonalPatientFormData {
    initials: string;
    age: number | string;
}

export interface PersonalPatient extends PersonalPatientFormData {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PatientComponentProps {
    patient?: PersonalPatient;
    onEdit?: (patient: PersonalPatient) => void;
    onDelete?: (patient: PersonalPatient) => void;
    onArchive?: (patient: PersonalPatient) => void;
}




export interface GetPatientsResponse {
    success: boolean;
    message: string;
    data: {
        personalPatients: PersonalPatient[];
        total?: number;
        page?: number;
        limit?: number;
    };
}

export interface PersonalPatientResponse {
    success: boolean;
    message: string;
    data: {
        personalPatient: PersonalPatient;
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
    middleName?: string;
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
    isArchive?: boolean;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}