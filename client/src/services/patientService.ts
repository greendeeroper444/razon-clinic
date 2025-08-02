import axios from 'axios';
import API_BASE_URL from '../ApiBaseUrl';
import { PatientFormData } from '../types';

export const addPatient = async (patientData: PatientFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/patients/addPatient`,
            patientData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding personal patient item:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPatients = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/patients/getPatients`,
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
        console.error('Error fetching personal patient items:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getPatientById = async (patientId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/patients/getPatientById/${patientId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personal patient item:', error);
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
        console.error('Error updating personal patient:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deletePatient = async (patientId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/patients/deletePatient/${patientId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};