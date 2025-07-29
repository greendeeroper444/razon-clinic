import axios from 'axios';
import API_BASE_URL from '../ApiBaseUrl';
import { PersonalPatientFormData } from '../types';

export const addPersonalPatient = async (personalPatientData: PersonalPatientFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/personalPatients/addPersonalPatient`,
            personalPatientData,
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

export const getPersonalPatients = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personalPatients/getPersonalPatients`,
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

export const getPersonalPatientById = async (patientId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personalPatients/getPersonalPatient/${patientId}`,
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

export const updatePersonalPatient = async (patientId: string, updateData: Partial<PersonalPatientFormData>) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/personalPatients/updatePersonalPatient/${patientId}`,
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

export const deletePersonalPatient = async (patientId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/personalPatients/deletePersonalPatient/${patientId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};