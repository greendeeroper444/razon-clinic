import axios from 'axios';
import API_BASE_URL from '../../ApiBaseUrl';


// Get authentication token (assuming you have this function elsewhere)
const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    }
});

// Add new inventory item
export const addInventoryItem = async (inventoryData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/inventoryItems/addInventoryItem`,
            inventoryData,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error adding inventory item:', error);
        throw error.response?.data || error;
    }
};

// Get all inventory items with optional filters
export const getInventoryItems = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getInventoryItems`,
            {
                ...createAuthHeaders(),
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        throw error.response?.data || error;
    }
};

// Get specific inventory item by ID
export const getInventoryItemById = async (inventoryItemId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getInventoryItem/${inventoryItemId}`,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        throw error.response?.data || error;
    }
};

// Update inventory item
export const updateInventoryItem = async (inventoryItemId, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/inventoryItems/updateInventoryItem/${inventoryItemId}`,
            updateData,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating inventory item:', error);
        throw error.response?.data || error;
    }
};

// Delete inventory item
export const deleteInventoryItem = async (inventoryItemId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/inventoryItems/deleteInventoryItem/${inventoryItemId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

// Get low stock items
export const getLowStockItems = async (threshold = 10) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getLowStockItems`,
            {
                ...createAuthHeaders(),
                params: { threshold }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        throw error.response?.data || error;
    }
};

// Get expired items
export const getExpiredItems = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getExpiredItems`,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching expired items:', error);
        throw error.response?.data || error;
    }
};

// Get items expiring soon
export const getExpiringItems = async (days = 30) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/inventoryItems/getExpiringItems`,
            {
                ...createAuthHeaders(),
                params: { days }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching expiring items:', error);
        throw error.response?.data || error;
    }
};

// Update stock (use or restock)
export const updateStock = async (inventoryItemId, stockData) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/inventoryItems/updateStock/${inventoryItemId}`,
            stockData,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error.response?.data || error;
    }
};