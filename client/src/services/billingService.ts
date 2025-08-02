import axios from 'axios'
import { BillingFormData, BillingResponse, InventoryItemOption, MedicalRecordOption } from '../types'
import API_BASE_URL from '../ApiBaseUrl'

export const addBilling = async (billingData: BillingFormData) => {
    return await axios.post<{
        success: boolean;
        message: string;
        data: BillingResponse;
    }>(
        `${API_BASE_URL}/api/billings/addBilling`,
        billingData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

//get all billing records with pagination and filters
export const getAllBillings = async (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    patientName?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.patientName) queryParams.append('patientName', params.patientName);

    return await axios.get<{
        success: boolean;
        message: string;
        data: BillingResponse[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalRecords: number;
            hasNext: boolean;
            hasPrev: boolean;
        }
    }>(
        `${API_BASE_URL}/api/billings/getBillings?${queryParams.toString()}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

//get billing by ID
export const getBillingById = async (billingId: string) => {
    return await axios.get<{
        success: boolean;
        message: string;
        data: BillingResponse;
    }>(
        `${API_BASE_URL}/api/billings/${billingId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

//update billing record
export const updateBilling = async (billingId: string, billingData: Partial<BillingFormData>) => {
    return await axios.put<{
        success: boolean;
        message: string;
        data: BillingResponse;
    }>(
        `${API_BASE_URL}/api/billings/${billingId}`,
        billingData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

//get medical records for dropdown
export const getMedicalRecordsForBilling = async () => {
    return await axios.get<{
        success: boolean;
        message: string;
        data: MedicalRecordOption[];
    }>(
        `${API_BASE_URL}/api/billings/getMedicalRecords`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

//get inventory items for billing
export const getInventoryItemsForBilling = async () => {
    return await axios.get<{
        success: boolean;
        message: string;
        data: InventoryItemOption[];
    }>(
        `${API_BASE_URL}/api/billings/getInventoryItems`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};



export const deleteBilling = async (billingId: string) => {
    return await axios.delete<{
        success: boolean;
        message: string;
    }>(
        `${API_BASE_URL}/api/billings/deleteBilling/${billingId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
}