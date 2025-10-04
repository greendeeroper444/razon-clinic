import axios from './httpClient'
import { BillingFormData } from '../types'
import API_BASE_URL from '../ApiBaseUrl'

export const addBilling = async (billingData: BillingFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/billings/addBilling`,
            billingData
        );
    
        return response.data;
    } catch (error) {
        console.error('Error adding billing:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getBillings = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/billings/getBillings`,
            { params: queryParams }
        );

        return response.data
    } catch (error) {
        console.error('Error fetching billings:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getBillingById = async (billingId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/billings/getBillingById/${billingId}`,
        );
    
        return response.data;
    } catch (error) {
        console.error('Error fetching billing:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateBilling = async (billingId: string, billingData: Partial<BillingFormData>) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/billings/updateBilling/${billingId}`,
            billingData
        );
    
        return response.data;
    } catch (error) {
        console.error('Error updating billing:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

//get medical records for dropdown
export const getMedicalRecordsForBilling = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/billings/getMedicalRecordsForBilling`
        );
    
        return response.data;
    } catch (error) {
        console.error('Error fetching medical record for billing:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};


export const deleteBilling = async (billingId: string) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/billings/deleteBilling/${billingId}`,
        );
    
        return response.data;
    } catch (error) {
        console.error('Error deleting billing:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
}