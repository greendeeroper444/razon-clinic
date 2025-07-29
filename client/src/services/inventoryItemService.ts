import axios from 'axios';
import API_BASE_URL from '../ApiBaseUrl';
import { InventoryItemFormData } from '../types';

export const addInventoryItem = async (inventoryData: InventoryItemFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/inventoryItems/addInventoryItem`,
            inventoryData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding inventory item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getInventoryItems = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getInventoryItems`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getInventoryItemById = async (inventoryItemId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getInventoryItem/${inventoryItemId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateInventoryItem = async (inventoryItemId: string, updateData: Partial<InventoryItemFormData>) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/inventoryItems/updateInventoryItem/${inventoryItemId}`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating inventory item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deleteInventoryItem = async (inventoryItemId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/inventoryItems/deleteInventoryItem/${inventoryItemId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

export const getLowStockItems = async (threshold = 10) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getLowStockItems`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: { threshold }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getExpiredItems = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getExpiredItems`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching expired items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getExpiringItems = async (days = 30) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getExpiringItems`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: { days }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching expiring items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateStock = async (inventoryItemId: string, stockData: Partial<InventoryItemFormData>) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/inventoryItems/updateStock/${inventoryItemId}`,
            stockData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating stock:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};