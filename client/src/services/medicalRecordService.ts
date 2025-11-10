import axios from './httpClient'
import { ExportMedicalRecordsParams, MedicalRecordFormData, transformFormDataToApiFormat } from '../types';
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
        if (axios.isAxiosError(error) && error.response?.data) {
            throw error.response.data;
        }

        throw { 
            success: false, 
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
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


export const getMyMedicalRecords = async (params = {}) => {
    try {

        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response  =  await axios.get(
            `${API_BASE_URL}/api/medicalRecords/getMyMedicalRecords`,
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

// export const deleteMedicalRecord = async (medicalRecordId: string) => {
//     try {
//         const response = await axios.delete(`${API_BASE_URL}/api/medicalRecords/deleteMedicalRecord/${medicalRecordId}`);

//         return response.data;
//     } catch (error) {
//         console.error('Error deleting medical record:', error);
//         if (axios.isAxiosError(error)) {
//             throw error.response?.data || error.message;
//         }

//         throw error;
//     }
// };

export const softDeleteMedicalRecord = async (medicalRecordId: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/medicalRecords/softDeleteMedicalRecord/${medicalRecordId}`);

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

export const exportMedicalRecords = async (params: ExportMedicalRecordsParams = {}) => {
    try {
        const defaultParams = {
            format: 'xlsx' as const
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/medicalRecords/exportMedicalRecords`,
            { 
                params: queryParams,
                responseType: 'blob' //tells axios to expect binary data
            }
        );

        //create blob from response
        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = `medical_records_${new Date().toISOString().split('T')[0]}`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        } else {
            const extension = queryParams.format === 'csv' ? '.csv' : queryParams.format === 'json' ? '.json' : '.xlsx';
            filename += extension;
        }

        //download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        //cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            filename
        };
    } catch (error) {
        console.error('Error exporting medical records:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
}