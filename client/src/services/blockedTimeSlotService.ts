import axios from './httpClient';
import API_BASE_URL from '../ApiBaseUrl';
import { BlockedTimeSlotFormData } from '../types';

export const addBlockedTimeSlot = async (blockedTimeSlotData: BlockedTimeSlotFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/blockedTimeSlots/addBlockedTimeSlot`,
            blockedTimeSlotData
        );

        return response.data;
    } catch (error) {
        console.error('Error adding blocked time slot:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getBlockedTimeSlots = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/blockedTimeSlots/getBlockedTimeSlots`,
            { params: queryParams }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching blocked time slots:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getBlockedTimeSlotById = async (blockedTimeSlotId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/blockedTimeSlots/getBlockedTimeSlot/${blockedTimeSlotId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching blocked time slot:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateBlockedTimeSlot = async (
    blockedTimeSlotId: string, 
    updateData: Partial<BlockedTimeSlotFormData>
) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/blockedTimeSlots/updateBlockedTimeSlot/${blockedTimeSlotId}`,
            updateData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating blocked time slot:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deleteBlockedTimeSlot = async (blockedTimeSlotId: string) => {
    try {
        const response = await axios.delete<{success: boolean, message: string}>(
            `${API_BASE_URL}/api/blockedTimeSlots/deleteBlockedTimeSlot/${blockedTimeSlotId}`
        );
    
        return response.data;
    } catch (error) {
        console.error('Error deleting blocked time slot:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};
