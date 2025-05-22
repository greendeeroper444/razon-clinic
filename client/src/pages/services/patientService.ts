import axios from "axios";
import { PatientResponse, PatientsResponse, PatientDetailed } from "../../types/patient";
import API_BASE_URL from "../../ApiBaseUrl";



//get all patients (for dropdown) - matches the endpoint used in modal
export const getPatients = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get<PatientsResponse>(
            `${API_BASE_URL}/api/onlinePatients/getPatients`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch patients');
        }
        throw new Error('An error occurred while fetching patients');
    }
};



//get patient by ID
export const getPatientById = async (patientId: string) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get<PatientResponse>(
            `${API_BASE_URL}/api/onlinePatients/patients/${patientId}`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch patient details');
        }
        throw new Error('An error occurred while fetching patient details');
    }
};




//create new patient
export const createPatient = async (patientData: Partial<PatientDetailed>) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await axios.post<PatientResponse>(
            `${API_BASE_URL}/api/onlinePatients/patients`,
            patientData,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create patient');
        }
        throw new Error('An error occurred while creating patient');
    }
};




//update patient
export const updatePatient = async (patientId: string, patientData: Partial<PatientDetailed>) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await axios.put<PatientResponse>(
            `${API_BASE_URL}/api/onlinePatients/patients/${patientId}`,
            patientData,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update patient');
        }
        throw new Error('An error occurred while updating patient');
    }
};

//delete patient
export const deletePatient = async (patientId: string) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.delete(
            `${API_BASE_URL}/api/onlinePatients/patients/${patientId}`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete patient');
        }
        throw new Error('An error occurred while deleting patient');
    }
};

//get all onlinePatients (includes doctors, staff, and patients)
export const getAllonlinePatients = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get(
            `${API_BASE_URL}/api/onlinePatients/`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch onlinePatients');
        }
        throw new Error('An error occurred while fetching onlinePatients');
    }
};

//get user profile (current authenticated user)
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get(
            `${API_BASE_URL}/api/onlinePatients/profile`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
        }
        throw new Error('An error occurred while fetching user profile');
    }
};