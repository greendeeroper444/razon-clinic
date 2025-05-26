import axios from 'axios'
import { AppointmentFilters, AppointmentFormData, AppointmentResponse } from '../../types/appointment';
import API_BASE_URL from '../../ApiBaseUrl';


// export const addAppointment = async (appointmentData: AppointmentFormData) => {
//     //reasonForVisit is properly trimmed before sending
//     const processedData = {
//         ...appointmentData,
//         reasonForVisit: appointmentData.reasonForVisit.trim()
//     };
    
//     return await axios.post<{success: boolean, message: string, data: AppointmentResponse}>(
//         `${API_BASE_URL}/api/appointments/addAppointment`,
//         processedData,
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         }
//     );
// };

export const addAppointment = async (appointmentData: AppointmentFormData) => {
    //process the form data to match backend expectations
    const processedData = {
        ...appointmentData,
        reasonForVisit: appointmentData.reasonForVisit.trim(),
        //ensure numeric fields are properly converted
        height: appointmentData.height ? Number(appointmentData.height) : undefined,
        weight: appointmentData.weight ? Number(appointmentData.weight) : undefined,
        motherAge: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
        fatherAge: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
        //trim string fields
        religion: appointmentData.religion?.trim(),
        motherName: appointmentData.motherName?.trim(),
        motherOccupation: appointmentData.motherOccupation?.trim(),
        fatherName: appointmentData.fatherName?.trim(),
        fatherOccupation: appointmentData.fatherOccupation?.trim(),
    };
    
    //remove undefined values to avoid sending them to backend
    Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined || processedData[key] === '') {
            delete processedData[key];
        }
    });
    
    return await axios.post<{success: boolean, message: string, data: AppointmentResponse}>(
        `${API_BASE_URL}/api/appointments/addAppointment`,
        processedData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};


export const getAppointments = async (filters?: AppointmentFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/appointments/getAppointment${queryString ? `?${queryString}` : ''}`;
    
    return await axios.get<{success: boolean, count: number, data: AppointmentResponse[]}>(
        url,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};



export const getAppointmentDetails = async (appointmentId: string) => {
    try {
        return await axios.get(
            `${API_BASE_URL}/api/appointments/getAppointmentDetails/${appointmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    } catch (error) {
        console.error("Error fetching appointment details:", error);
        throw error;
    }
};



export const getAppointmentById = async (appointmentId: string) => {
    return await axios.get<{success: boolean, data: AppointmentResponse}>(
        `${API_BASE_URL}/api/appointments/getAppointmentById/${appointmentId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};



export const getMyAppointment = async (filters?: Omit<AppointmentFilters, 'patientId'>) => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/appointments/getMyAppointment${queryString ? `?${queryString}` : ''}`;
    
    return await axios.get<{success: boolean, count: number, data: AppointmentResponse[]}>(
        url,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

export const updateAppointment = async (appointmentId: string, appointmentData: AppointmentFormData) => {
    //process the form data and structure nested objects properly
    const processedData = {
        ...appointmentData,
        reasonForVisit: appointmentData.reasonForVisit?.trim(),
        height: appointmentData.height ? Number(appointmentData.height) : undefined,
        weight: appointmentData.weight ? Number(appointmentData.weight) : undefined,
        religion: appointmentData.religion?.trim(),
        
        //structure mother info as nested object
        motherInfo: {
            name: appointmentData.motherName?.trim(),
            age: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
            occupation: appointmentData.motherOccupation?.trim()
        },
        
        //structure father info as nested object  
        fatherInfo: {
            name: appointmentData.fatherName?.trim(),
            age: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
            occupation: appointmentData.fatherOccupation?.trim()
        }
    };

    //remove the flat field names since we're now using nested objects
    delete processedData.motherName;
    delete processedData.motherAge;
    delete processedData.motherOccupation;
    delete processedData.fatherName;
    delete processedData.fatherAge;
    delete processedData.fatherOccupation;

    //remove undefined values
    Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined || processedData[key] === '') {
            delete processedData[key];
        }
    });

    //clean up nested objects - remove if all fields are empty
    if (processedData.motherInfo && 
        !processedData.motherInfo.name && 
        !processedData.motherInfo.age && 
        !processedData.motherInfo.occupation) {
        delete processedData.motherInfo;
    }

    if (processedData.fatherInfo && 
        !processedData.fatherInfo.name && 
        !processedData.fatherInfo.age && 
        !processedData.fatherInfo.occupation) {
        delete processedData.fatherInfo;
    }

    return await axios.put<{success: boolean, message: string, data: AppointmentResponse}>(
        `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}`,
        processedData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};
// export const updateAppointment = async (appointmentId: string, appointmentData: AppointmentFormData) => {
//     return await axios.put<{success: boolean, message: string, data: AppointmentResponse}>(
//         `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}`,
//         appointmentData,
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         }
//     );
// };



export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    return await axios.patch<{success: boolean, message: string, data: AppointmentResponse}>(
        `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}/status`,
        { status },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};



export const deleteAppointment = async (appointmentId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/appointments/deleteAppointment/${appointmentId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};
