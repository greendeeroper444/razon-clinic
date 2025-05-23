import axios from 'axios';
import API_BASE_URL from '../../ApiBaseUrl';




const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};



const createAuthHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    }
});




export const addPersonalPatient = async (personalPatientData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/personalPatients/addPersonalPatient`,
            personalPatientData,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error adding personal patient item:', error);
        throw error.response?.data || error;
    }
};




export const getPersonalPatients = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personalPatients/getPersonalPatients`,
            {
                ...createAuthHeaders(),
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personal patient items:', error);
        throw error.response?.data || error;
    }
};



export const getPersonalPatientById = async (patientId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/personalPatients/getPersonalPatient/${patientId}`,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching personal patient item:', error);
        throw error.response?.data || error;
    }
};




export const updatePersonalPatient = async (patientId, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/personalPatients/updatePersonalPatient/${patientId}`,
            updateData,
            createAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating personal patient:', error);
        throw error.response?.data || error;
    }
};




export const deletePersonalPatient = async (patientId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/personalPatients/deletePersonalPatient/${patientId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};
