import axios from './httpClient'
import { AppointmentFormData } from '../types'
import API_BASE_URL from '../ApiBaseUrl'
import { cleanObject, convertTo24Hour, createParentInfo, generateTimeSlots, processPatient } from '../utils';


export const addAppointment = async (appointmentData: AppointmentFormData) => {
    try {
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
        
        const response = await axios.post(
            `${API_BASE_URL}/api/appointments/addAppointment`,
            processedData
        )

        return response.data;
    } catch (error) {
        console.error('Error adding appointment:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};



export const getAppointments = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/appointments/getAppointments`,
            { params: queryParams }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getMyAppointments = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/appointments/getMyAppointments`,
            { params: queryParams }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};


export const getAppointmentsByDate = async (date: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/appointments/getAllTimePerDate?date=${date}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching appointment by date:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
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
        const response = await axios.get(`${API_BASE_URL}/api/appointments/getAppointmentById/${appointmentId}`);

        return response.data;
    } catch (error) {
        console.error("Error fetching appointment details:", error);
        throw error;
    }
};



export const updateAppointment = async (appointmentId: string, appointmentData: AppointmentFormData) => {
    try {
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
        
        const response = await axios.put(
            `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}`,
            processedData
        );

        return response.data;
    } catch (error) {
        console.error('Error updating appointment:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/appointments/updateAppointment/${appointmentId}/status`,
            { status }
        );

        return response.data;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};



export const deleteAppointment = async (appointmentId: string) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/appointments/deleteAppointment/${appointmentId}`,
        );
    
        return response.data;
    } catch (error) {
        console.error('Error deleting appointment:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};
