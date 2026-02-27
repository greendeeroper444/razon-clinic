import axios from './httpClient';
import API_BASE_URL from '../ApiBaseUrl';

export interface TransactionParams {
    page?: number;
    limit?: number;
    search?: string;
    transactionType?: 'IN' | 'OUT' | '';
    reason?: string;
    inventoryItemId?: string;
    startDate?: string;
    endDate?: string;
}

export const getTransactions = async (params: TransactionParams = {}) => {
    try {
        const defaultParams = { page: 1, limit: 10 };
        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryTransactions/getTransactions`,
            { params: queryParams }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const getTransactionsByItemId = async (inventoryItemId: string, params: TransactionParams = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryTransactions/getTransactions/${inventoryItemId}`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching item transactions:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const getTransactionStats = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryTransactions/getTransactionStats`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};