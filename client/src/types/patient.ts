export interface Patient {
    id: string;
    patientNumber?: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email?: string;
    contactNumber?: string;
    birthdate: string;
    sex: string;
    address: string;
}

export interface PatientFormData {
    id?: string;
    patientNumber?: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email?: string;
    contactNumber?: string;
    password?: string;
    birthdate: string;
    sex: 'Male' | 'Female' | 'Other' | ''; 
    address: string;
    dateRegistered?: string;
    role?: 'Patient' | 'Doctor' | 'Staff';
    createdAt?: string;
    updatedAt?: string;
}

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
    results: number;
    data: {
        patients: Patient[];
    };
}

export interface PatientResponse {
    status: string;
    data: {
        patient: PatientDetailed;
    };
}