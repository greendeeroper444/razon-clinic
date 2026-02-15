import { ChangeEvent } from "react";

export interface MedicalRecordFormProps {
    formData: MedicalRecordFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isLoading?: boolean;
    onAutofill?: (data: MedicalRecordFormData) => void;
}

export interface MedicalRecord {
    id: string;
    personalDetails: {
        fullName: string;
        dateOfBirth: string;
        gender: 'Male' | 'Female' | 'Other';
        bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
        address?: string;
        phone: string;
        email?: string;
        emergencyContact?: string;
        age?: number;
    };
    medicalHistory: {
        allergies?: string;
        chronicConditions?: string;
        previousSurgeries?: string;
        familyHistory?: string;
        general?: string;
    };
    growthMilestones: {
        height?: number;
        weight?: number;
        bmi?: number;
        growthNotes?: string;
        general?: string;
    };
    currentSymptoms: {
        chiefComplaint: string;
        symptomsDescription: string;
        symptomsDuration?: string;
        painScale?: number;
        general?: string;
    };
    vaccinationHistory?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    prescribedMedications?: string;
    consultationNotes?: string;
    followUpDate?: string;
    dateRecorded?: string | any;
    createdAt?: string;
    updatedAt?: string;
}



export interface PersonalDetails {
    fullName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address?: string;
    phone: string;
    email?: string;
    emergencyContact?: string;
    age?: number; 
}

export interface MedicalHistory {
    allergies?: string;
    chronicConditions?: string;
    previousSurgeries?: string;
    familyHistory?: string;
    general?: string;
}

export interface GrowthMilestones {
    height?: number;
    weight?: number;
    bmi?: number;
    growthNotes?: string;
    general?: string;
}

export interface CurrentSymptoms {
    chiefComplaint: string;
    symptomsDescription: string;
    symptomsDuration?: string;
    painScale?: number;
    general?: string;
}


//form data interface for creating/updating records
export interface MedicalRecordFormData {
    //personal details (flattened for form)
    id: string;
    appointmentId?: string;
    medicalRecordNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
    address: string;
    phone: string;
    email: string;
    emergencyContact: string;

    //medical history (flattened for form)
    allergies: string;
    chronicConditions: string;
    previousSurgeries: string;
    familyHistory: string;

    //growth milestones (flattened for form)
    height: number | '';
    weight: number | '';
    bmi: number | '';
    growthNotes: string;

    //current symptoms (flattened for form)
    chiefComplaint: string;
    symptomsDescription: string;
    symptomsDuration: string;
    painScale: number | '';

    //additional fields
    diagnosis: string;
    treatmentPlan: string;
    prescribedMedications: string;
    consultationNotes: string;
    followUpDate: string | undefined;
    vaccinationHistory: string;
    dateRecorded?: string;
    createdAt?: string;
    updatedAt?: string;
    
    personalDetails: {
        fullName: string;
        dateOfBirth: string;
        gender: 'Male' | 'Female' | 'Other';
        bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
        address?: string;
        phone: string;
        email?: string;
        emergencyContact?: string;
        age?: number;
    };
    medicalHistory: {
        allergies?: string;
        chronicConditions?: string;
        previousSurgeries?: string;
        familyHistory?: string;
        general?: string;
    };
    growthMilestones: {
        height?: number;
        weight?: number;
        bmi?: number;
        growthNotes?: string;
        general?: string;
    };
    currentSymptoms: {
        chiefComplaint: string;
        symptomsDescription: string;
        symptomsDuration?: string;
        painScale?: number;
        general?: string;
    };
}

//api response interfaces
export interface MedicalRecordResponse extends MedicalRecordFormData {
    success: boolean;
    pagination: {
        current: number;
        total: number;
        count: number;
        totalRecords: number;
    };
    message?: string;
    data: {
        success: boolean;
        data: MedicalRecord[];
    };
    updatedAt?: string;
    createdAt?: string;
    dateRecorded: string;
}




// export interface ApiError {
//     success: false;
//     message: string;
//     error?: string;
// }

//utility function to transform form data to nested structure for API
export const transformFormDataToApiFormat = (formData: MedicalRecordFormData) => {
    return {
        personalDetails: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bloodType: formData.bloodType || undefined,
            address: formData.address || undefined,
            phone: formData.phone,
            email: formData.email || undefined,
            emergencyContact: formData.emergencyContact || undefined,
        },
        medicalHistory: {
            allergies: formData.allergies || undefined,
            chronicConditions: formData.chronicConditions || undefined,
            previousSurgeries: formData.previousSurgeries || undefined,
            familyHistory: formData.familyHistory || undefined,
        },
        growthMilestones: {
            height: formData.height || undefined,
            weight: formData.weight || undefined,
            bmi: formData.bmi || undefined,
            growthNotes: formData.growthNotes || undefined,
        },
        currentSymptoms: {
            chiefComplaint: formData.chiefComplaint,
            symptomsDescription: formData.symptomsDescription,
            symptomsDuration: formData.symptomsDuration || undefined,
            painScale: formData.painScale || undefined,
        },
        vaccinationHistory: formData.vaccinationHistory || undefined,
        diagnosis: formData.diagnosis || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
        prescribedMedications: formData.prescribedMedications || undefined,
        consultationNotes: formData.consultationNotes || undefined,
        followUpDate: formData.followUpDate || undefined,
    }
};


export interface DeletedMedicalRecord {
    id: string
    personalDetails: {
        fullName: string
    }
    appointmentId: {
        appointmentNumber: string
    }
    medicalRecordNumber: string
    deletedAt: string
    dateRecorded: string
}


export interface ExportMedicalRecordsParams {
    format?: 'csv' | 'xlsx' | 'json';
    search?: string;
    paymentStatus?: string;
    patientName?: string;
    itemName?: string;
    minAmount?: number;
    maxAmount?: number;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}


export interface MedicalRecordReportItem {
    id: string
    medicalRecordNumber: string
    personalDetails: {
        fullName: string
        dateOfBirth: string
        age: number
        gender: 'Male' | 'Female' | 'Other'
        bloodType?: string
        phone: string
        email?: string
        address?: string
    }
    currentSymptoms?: {
        chiefComplaint: string
        symptomsDescription: string
        symptomsDuration?: string
    }
    diagnosis?: string
    treatmentPlan?: string
    prescribedMedications?: string
    followUpDate?: string
    dateRecorded: string
    createdAt: string
    updatedAt: string
}

export interface MedicalRecordsSummary {
    totalRecords: number
    genderDistribution: {
        male: number
        female: number
        other: number
    }
    ageDistribution: {
        pediatric: number  // < 18
        adult: number      // 18-64
        senior: number     // 65+
        neonate?: number     // 0-28 days
    }
    followUps: {
        upcoming: number
        overdue: number
    }
}