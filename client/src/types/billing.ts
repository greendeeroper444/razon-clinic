export interface BillingFormData {
    id: string;
    medicalRecordId?: string;
    patientName?: string;
    itemName?: string[];
    itemQuantity?: number[];
    itemPrices?: number[];
    doctorFee?: number;
    discount: number;
    amount: number;
    amountPaid: number;
    change?: number;
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
    processedName?: string;
    processedRole?: string;
    medicalRecordDate?: string;
    createdAt: string
    updatedAt: string;
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
    description?: string;
    paymentMethod?: string;
    notes?: string;
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
    items: any[];
    processedBy?: string;
    processedName?: string;
    processedRole?: string;
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

export interface ExportBillingsParams {
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