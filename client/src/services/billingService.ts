import axios from './httpClient'
import { BillingFormData, ExportBillingsParams } from '../types'
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

export const updateBillingPaymentStatus = async (
    billingId: string, 
    paymentStatus: string,
    amountPaid?: number,
    change?: number
) => {
    try {
        const payload: { 
            paymentStatus: string; 
            amountPaid?: number; 
            change?: number; 
        } = { paymentStatus };
        
        if (amountPaid !== undefined) {
            payload.amountPaid = amountPaid;
        }
        
        if (change !== undefined) {
            payload.change = change;
        }

        const response = await axios.patch(
            `${API_BASE_URL}/api/billings/updateBilling/${billingId}/paymentStatus`,
            payload
        );

        return response.data;
    } catch (error) {
        console.error('Error updating billing payment status:', error);
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


export const exportBillings = async (params: ExportBillingsParams = {}) => {
    try {
        const defaultParams = {
            format: 'xlsx' as const
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/billings/exportBillings`,
            { 
                params: queryParams,
                responseType: 'blob' //tells axios to expect binary data
            }
        );

        //create blob from response
        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = `billing_records_${new Date().toISOString().split('T')[0]}`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        } else {
            const extension = queryParams.format === 'csv' ? '.csv' : queryParams.format === 'json' ? '.json' : '.xlsx';
            filename += extension;
        }

        //download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        //cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            filename
        };
    } catch (error) {
        console.error('Error exporting billings:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
}