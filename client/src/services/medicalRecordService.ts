import axios from './httpClient'
import { MedicalRecordFormData, transformFormDataToApiFormat } from '../types';
import API_BASE_URL from '../ApiBaseUrl';


export const addMedicalRecord = async (medicalRecordData: MedicalRecordFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/medicalRecords/addMedicalRecord`,
            medicalRecordData
        );

        return response.data;
    } catch (error) {
        console.error('Error adding medical record:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getMedicalRecords = async (params = {}) => {
    try {

        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response  =  await axios.get(
            `${API_BASE_URL}/api/medicalRecords/getMedicalRecords`,
            { params: queryParams }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching medical records:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

//get medical record by id
export const getMedicalRecordById = async (medicalRecordId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/medicalRecords/getMedicalRecordById/${medicalRecordId}`);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching medical record:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateMedicalRecord = async (medicalRecordId: string, medicalRecordData: Partial<MedicalRecordFormData>) => {
    try {
        //transform form data to nested structure if needed
        const transformedData = transformFormDataToApiFormat(medicalRecordData as MedicalRecordFormData);
        
        const response = await axios.put(
            `${API_BASE_URL}/api/medicalRecords/updateMedicalRecord/${medicalRecordId}`,
            transformedData
        );

        return response.data;
    } catch (error) {
        console.error('Error updating medical record:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deleteMedicalRecord = async (medicalRecordId: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/medicalRecords/deleteMedicalRecord/${medicalRecordId}`);

        return response.data;
    } catch (error) {
        console.error('Error deleting medical record:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};



//search appointments by name
export const searchAppointmentsByName = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/medicalRecords/searchAppointments?searchTerm=${encodeURIComponent(searchTerm)}`);
        
        return response.data;
    } catch (error) {
        console.error('Error searching appointment name:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};


//get appointment data for autofill
export const getAppointmentForAutofill = async (appointmentId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/medicalRecords/getAppointmentForAutofill/${appointmentId}`);
        
        return response.data;
    } catch (error) {
        console.error('Error getting appointment for auto fill:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};







//generate medical report (if you have this endpoint)
export const generateMedicalReport = async (filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
}) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/medicalRecords/generateReport`,
            filters,
            // {
            //     headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating medical record:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};