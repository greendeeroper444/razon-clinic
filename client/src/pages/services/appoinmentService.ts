import axios from 'axios'
import { AppointmentFilters, AppointmentFormData, AppointmentResponse } from '../../types/appointment';
import API_BASE_URL from '../../ApiBaseUrl';


export const addAppointment = async (appointmentData: AppointmentFormData) => {
    //reasonForVisit is properly trimmed before sending
    const processedData = {
        ...appointmentData,
        reasonForVisit: appointmentData.reasonForVisit.trim()
    };
    
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
    return await axios.put<{success: boolean, message: string, data: AppointmentResponse}>(
        `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}`,
        appointmentData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};



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
