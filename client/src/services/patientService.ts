import axios from './httpClient'
import API_BASE_URL from '../ApiBaseUrl';
import { PatientFormData } from '../types';

export const addPatient = async (patientData: PatientFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/patients/addPatient`,
            patientData
        );

        return response.data;
    } catch (error) {
        console.error('Error adding patient item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPatients = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        }

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/patients/getPatients`,
            { params: queryParams }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching patient items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPatientById = async (patientId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/patients/getPatientById/${patientId}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching patient item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updatePatient = async (patientId: string, updateData: Partial<PatientFormData>) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/patients/updatePatient/${patientId}`,
            updateData
        );

        return response.data;
    } catch (error) {
        console.error('Error updating patient:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deletePatient = async (patientId: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/patients/deletePatient/${patientId}`);
        
        return response.data;
    } catch (error) {
        console.error('Error deleting patient:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const archivePatient = async (patientId: string) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/patients/archivePatient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error archiving user:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const unarchivePatient = async (patientId: string) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/patients/unarchivePatient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error unarchiving user:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const archiveMultiplePatients = async (patientIds: string[]) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/patients/archiveMultiplePatients`, {
            patientIds
        });
        return response.data;
    } catch (error) {
        console.error('Error archiving multiple patients:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const unarchiveMultiplePatients = async (patientIds: string[]) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/patients/unarchiveMultiplePatients`, {
            patientIds
        });
        return response.data;
    } catch (error) {
        console.error('Error unarchiving multiple patients:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};