export interface BillingFormData {
    id?: string;
    medicalRecordId?: string;
    patientName?: string;
    itemName?: string[];
    itemQuantity?: number[];
    itemPrices?: number[];
    amount?: number;
    paymentStatus?: 'Paid' | 'Unpaid' | 'Pending';
    medicalRecordDate?: string;
}

export interface BillingFormProps {
    formData: BillingFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isLoading: boolean;
}

export interface BillingResponse {
    id: string;
    medicalRecordId: string;
    patientName: string;
    itemName: string[];
    itemQuantity: number[];
    itemPrices: number[];
    amount: number;
    paymentStatus: string;
    medicalRecordDate: string;
    createdAt: string;
    updatedAt: string;
    medicalRecord?: {
        personalDetails: {
            fullName: string;
        };
        dateRecorded: string;
        diagnosis?: string;
        treatmentPlan?: string;
    };
}

export interface MedicalRecordOption {
    id: string;
    patientName: string;
    date: string;
    diagnosis: string;
}

export interface InventoryItemOption {
    name: string;
    price: number;
    availableQuantity: number;
    category: 'Vaccine' | 'Medical Supply';
}

export interface BillingListItem {
    id: string;
    patientName: string;
    amount: number;
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
    medicalRecordDate: string;
    createdAt: string;
    itemCount: number;
}

export interface BillingFilters {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    patientName?: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
}