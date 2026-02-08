import axios from './httpClient';
import API_BASE_URL from '../ApiBaseUrl';
import { PersonnelFormData } from '../types';

export const addPersonnel = async (personnelData: PersonnelFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/personnels/addPersonnel`,
            personnelData
        );

        return response.data;
    } catch (error) {
        console.error('Error adding personnel:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPersonnel = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/personnels/getPersonnel`,
            { params: queryParams }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching personnel:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPersonnelById = async (personnelId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personnels/getPersonnelById/${personnelId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personnel:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updatePersonnel = async (personnelId: string, updateData: Partial<PersonnelFormData>) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/personnels/updatePersonnel/${personnelId}`,
            updateData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating personnel:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deletePersonnel = async (personnelId: string) => {
    try {
        const response = await axios.delete<{success: boolean, message: string}>(
            `${API_BASE_URL}/api/personnels/deletePersonnel/${personnelId}`
        );
    
        return response.data;
    } catch (error) {
        console.error('Error deleting personnel:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPersonnelByRole = async (role: 'Doctor' | 'Staff') => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personnels/getPersonnelByRole`,
            {
                params: { role }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personnel by role:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPersonnelStats = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personnels/getPersonnelStats`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personnel stats:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};