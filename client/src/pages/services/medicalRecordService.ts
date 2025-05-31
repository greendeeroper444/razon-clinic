import axios from 'axios';
import { MedicalRecordFormData, transformFormDataToApiFormat } from '../../types/medical';
import API_BASE_URL from '../../ApiBaseUrl';


export const addMedicalRecord = async (medicalRecordData: MedicalRecordFormData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/medicalRecords/addMedicalRecord`,
            medicalRecordData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding medical record:', error);
        throw error;
    }
};



//get all medical records
export const getMedicalRecords = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
        let url = `${API_BASE_URL}/api/medicalRecords/getMedicalRecords?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting medical records:', error);
        throw error;
    }
};

//get medical record by ID
export const getMedicalRecordById = async (id: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/medicalRecords/getMedicalRecord/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting medical record:', error);
        throw error;
    }
};


//update medical record
export const updateMedicalRecord = async (
    id: string, 
    medicalRecordData: Partial<MedicalRecordFormData>
) => {
    try {
        //transform form data to nested structure if needed
        const transformedData = transformFormDataToApiFormat(medicalRecordData as MedicalRecordFormData);
        
        const response = await axios.put(
            `${API_BASE_URL}/api/medicalRecords/updateMedicalRecord/${id}`,
            transformedData,
            {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating medical record:', error);
        throw error;
    }
};


//update medical record
// export const updateMedicalRecord = async (id: string, updateData: Partial<MedicalRecordFormData>) => {
//     try {
//         const response = await axios.put(
//             `${API_BASE_URL}/api/medicalRecords/updateMedicalRecord/${id}`,
//             updateData,
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
//                 }
//             }
//         );
//         return response.data;
//     } catch (error) {
//         console.error('Error updating medical record:', error);
//         throw error;
//     }
// };



//delete medical record
export const deleteMedicalRecord = async (id: string) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/medicalRecords/deleteMedicalRecord/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting medical record:', error);
        throw error;
    }
};



//search appointments by name
export const searchAppointmentsByName = async (searchTerm: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/medicalRecords/searchAppointments?searchTerm=${encodeURIComponent(searchTerm)}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error searching appointments:', error);
        throw error;
    }
};


//get appointment data for autofill
export const getAppointmentForAutofill = async (appointmentId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/medicalRecords/getAppointmentForAutofill/${appointmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting appointment for autofill:', error);
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
            {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating medical report:', error);
        throw error;
    }
};