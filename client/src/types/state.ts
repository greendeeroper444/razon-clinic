import { AppointmentFormData, AppointmentResponse } from "./appointment"
import { Patient } from "./patient"


//appointment state
export interface AppointmentState {
    //state
    appointments: AppointmentResponse[];
    patients: Patient[];
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    
    //modal state
    selectedAppointment: (AppointmentFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isStatusModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteAppointmentData: {id: string, itemName: string, itemType: string} | null;

    //state for appointment details
    currentAppointment: AppointmentResponse | null;

    //actions
    fetchAppointments: () => Promise<void>;
    fetchMyAppointments: () => Promise<void>;
    //actions for appointment details
    fetchAppointmentById: (appointmentId: string) => Promise<void>;
    // updateCurrentAppointment: (id: string, data: AppointmentFormData) => Promise<void>;
    clearCurrentAppointment: () => void;
    updateAppointmentData: (id: string, data: AppointmentFormData) => Promise<void>;
    updateAppointmentStatus: (id: string, data: AppointmentFormData) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    
    //modal actions
    openUpdateModal: (appointment: AppointmentResponse) => void;
    openStatusModal: (appointment: AppointmentResponse) => void;
    openDeleteModal: (appointment: AppointmentResponse) => void;
    closeUpdateModal: () => void;
    closeStatusModal: () => void;
    closeDeleteModal: () => void;

    
    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

}