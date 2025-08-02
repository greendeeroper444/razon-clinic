import axios from 'axios'
import { AppointmentFilters, AppointmentFormData, AppointmentResponse } from '../types'
import API_BASE_URL from '../ApiBaseUrl'
import { cleanObject, convertTo24Hour, createParentInfo, generateTimeSlots, processPatient } from '../utils';


export const addAppointment = async (appointmentData: AppointmentFormData) => {
    const { patients = [], ...otherData } = appointmentData;
    
    const processedData = cleanObject({
        ...otherData,
        preferredTime: convertTo24Hour(String(appointmentData.preferredTime)),
        motherAge: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
        fatherAge: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
        motherName: appointmentData.motherName?.trim(),
        motherOccupation: appointmentData.motherOccupation?.trim(),
        fatherName: appointmentData.fatherName?.trim(),
        fatherOccupation: appointmentData.fatherOccupation?.trim(),
        patients: patients.length > 0 
        ? patients.map(processPatient)
        : [processPatient(appointmentData)]
    });
    
    return await axios.post<{
        success: boolean;
        message: string;
        data: AppointmentResponse[];
        appointmentCount: number;
    }>(
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
    
    if (filters?.userId) params.append('userId', filters.userId);
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


export const getAppointmentsByDate = async (date: string) => {
    const url = `${API_BASE_URL}/api/appointments/getAllTimePerDate?date=${date}`;
    
    return await axios.get<{
        success: boolean,
        date: string,
        totalAppointments: number,
        availableTimeSlots: string[],
        timeSlots: {[key: string]: AppointmentResponse[]},
        appointments: AppointmentResponse[]
    }>(
        url,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};


//check appointment availability
export const checkAppointmentAvailability = async (date: string, time: string) => {
    try {
        const response = await getAppointments({
            fromDate: date,
            toDate: date
        });
        
        if (response.data.success) {
            const appointments = response.data.data;
            const conflictingAppointment = appointments.find(
                apt => apt.preferredTime === time && apt.status !== 'Cancelled'
            );
            
            return !conflictingAppointment; //returns true if available, false if conflicted
        }
        
        return true; //available if can't check
    } catch (error) {
        console.error('Error checking appointment availability:', error);
        return true; //available if error occurs
    }
};


//function to get available time slots for a specific date
export const getAvailableTimeSlots = async (date: string) => {
    const allTimeSlots = generateTimeSlots();
    
    try {
        const response = await getAppointments({
            fromDate: date,
            toDate: date
        });
        
        if (response.data.success) {
            const appointments = response.data.data;
            const bookedTimes = appointments
                .filter(apt => apt.status !== 'Cancelled')
                .map(apt => apt.preferredTime);
            
            return allTimeSlots.filter(time => !bookedTimes.includes(time));
        }
        
        return allTimeSlots;
    } catch (error) {
        console.error('Error getting available time slots:', error);
        return allTimeSlots;
    }
};



export const getAppointmentById = async (appointmentId: string) => {
    try {
        return await axios.get(
            `${API_BASE_URL}/api/appointments/getAppointmentById/${appointmentId}`,
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



export const getMyAppointment = async (filters?: Omit<AppointmentFilters, 'userId'>) => {
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
    const {
        motherName, motherAge, motherOccupation,
        fatherName, fatherAge, fatherOccupation,
        ...otherData
    } = appointmentData;
    
    const processedData = cleanObject({
        ...otherData,
        preferredTime: appointmentData.preferredTime ? convertTo24Hour(String(appointmentData.preferredTime)) : undefined,
        motherInfo: createParentInfo(motherName, motherAge, motherOccupation),
        fatherInfo: createParentInfo(fatherName, fatherAge, fatherOccupation)
    });
    
    return await axios.put<{
        success: boolean;
        message: string;
        data: AppointmentResponse;
    }>(
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
