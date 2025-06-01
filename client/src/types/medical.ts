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

//complete medical record interface matching your Mongoose model
// export interface MedicalRecord {
//     id: string;
//     personalDetails: PersonalDetails;
//     medicalHistory: MedicalHistory;
//     growthMilestones: GrowthMilestones;
//     currentSymptoms: CurrentSymptoms;
//     vaccinationHistory?: string;
//     diagnosis?: string;
//     treatmentPlan?: string;
//     prescribedMedications?: string;
//     consultationNotes?: string;
//     followUpDate?: string;
//     dateRecorded: string;
//     createdAt: string;
//     updatedAt: string;
// }

//form data interface for creating/updating records
export interface MedicalRecordFormData {
    //personal details (flattened for form)
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
}

//api response interfaces
export interface MedicalRecordsResponse {
    success: boolean;
    data: MedicalRecord[];
    pagination: {
        current: number;
        total: number;
        count: number;
        totalRecords: number;
    };
}

export interface MedicalRecordResponse {
    success: boolean;
    data: MedicalRecord;
    message?: string;
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
    dateRecorded: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

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