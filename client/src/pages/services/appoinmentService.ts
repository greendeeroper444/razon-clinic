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

// export const addAppointment = async (appointmentData: AppointmentFormData) => {
//     //process the form data to match backend expectations
//     const processedData = {
//         ...appointmentData,
//         motherAge: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
//         fatherAge: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
//         motherName: appointmentData.motherName?.trim(),
//         motherOccupation: appointmentData.motherOccupation?.trim(),
//         fatherName: appointmentData.fatherName?.trim(),
//         fatherOccupation: appointmentData.fatherOccupation?.trim(),
//     };
    
//     //remove undefined values to avoid sending them to backend
//     Object.keys(processedData).forEach(key => {
//         if (processedData[key] === undefined || processedData[key] === '') {
//             delete processedData[key];
//         }
//     });
    
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


// export const getAppointments = async (filters?: AppointmentFilters) => {
//     const params = new URLSearchParams();
    
//     if (filters?.patientId) params.append('patientId', filters.patientId);
//     if (filters?.status) params.append('status', filters.status);
//     if (filters?.fromDate) params.append('fromDate', filters.fromDate);
//     if (filters?.toDate) params.append('toDate', filters.toDate);
    
//     const queryString = params.toString();
//     const url = `${API_BASE_URL}/api/appointments/getAppointment${queryString ? `?${queryString}` : ''}`;
    
//     return await axios.get<{success: boolean, count: number, data: AppointmentResponse[]}>(
//         url,
//         {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         }
//     );
// };

export const addAppointment = async (appointmentData: AppointmentFormData) => {
    //convert 12-hour format to 24-hour format for backend
    let convertedTime = appointmentData.preferredTime;
    if (convertedTime && convertedTime.includes(' ')) {
        const [timeStr, period] = convertedTime.split(' ');
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr);
        
        //convert to 24-hour format
        if (period === 'AM') {
            if (hour === 12) hour = 0; //12:00 AM = 00:00
        } else { // PM
            if (hour !== 12) hour += 12; //add 12 except for 12:00 PM
        }
        
        //format as HH:MM (ensure 2 digits for hour)
        convertedTime = `${hour.toString().padStart(2, '0')}:${minuteStr}`;
    }

    //process the form data to match backend expectations
    const processedData = {
        ...appointmentData,
        preferredTime: convertedTime,
        motherAge: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
        fatherAge: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
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

//function to generate all time slots (1:00 AM to 12:00 AM)
const generateAllTimeSlots = () => {
    const slots = [];

    for (let hour = 8; hour <= 11; hour++) {
        slots.push(`${hour}:00 AM`);
    }

    slots.push(`12:00 PM`); //noon

    for (let hour = 1; hour <= 5; hour++) {
        slots.push(`${hour}:00 PM`);
    }
    
    return slots;
};

//function to get available time slots for a specific date
export const getAvailableTimeSlots = async (date: string) => {
    const allTimeSlots = generateAllTimeSlots();
    
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
