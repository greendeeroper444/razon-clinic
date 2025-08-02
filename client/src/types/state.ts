import { PaginationInfo } from "./action";
import { AppointmentFormData, AppointmentResponse } from "./appointment"
import { LoginFormData, SignupFormData, ValidationErrors } from "./auth";
import { BillingFormData, BillingResponse } from "./billing";
import { OperationType } from "./crud";
import { InventoryItemFormData } from "./invetory";
import { MedicalRecord, MedicalRecordFormData, MedicalRecordResponse } from "./medical";
import { Patient, PatientFormData, PatientsResponse } from "./patient"
import { User } from "./user";


//appointment state
export interface AppointmentState {
    //state
    appointments: AppointmentResponse[];
    patients: Patient[];
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType;
    
    //modal state
    selectedAppointment: (AppointmentFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isStatusModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteAppointmentData: { id: string, itemName: string, itemType: string } | null;

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

export interface ExtendedAppointmentState extends AppointmentState {
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
    viewMode: 'admin' | 'user';
}





//inventory item state
export interface InventoryState {
    //state
    inventoryItems: InventoryItemFormData[];
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType;

    //modal state
    selectedInventoryItem: (InventoryItemFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteInventoryItemData: { id: string, itemName: string, itemType: string } | null;

    //summary stats state
    summaryStats: {
        total: number;
        lowStock: number;
        expiring: number;
        recentlyAdded: number;
    };
    //modal modes
    isRestockMode: boolean;
    isAddQuantityMode: boolean;

    //actions
    fetchInventoryItems: () => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    addInventoryItem: (data: InventoryItemFormData) => Promise<void>;
    updateInventoryItemData: (id: string, data: InventoryItemFormData) => Promise<void>;
    deleteInventoryItem: (id: string) => Promise<void>;

    //modal actions
    openAddModal: () => void;
    openUpdateModal: (item: InventoryItemFormData, restockMode?: boolean, addQuantityMode?: boolean) => void;
    openDeleteModal: (item: InventoryItemFormData) => void;
    closeUpdateModal: () => void;
    closeDeleteModal: () => void;

    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

}

export interface ExtendedInventoryState extends InventoryState {
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
}



//meidcal record state
export interface MedicalRecordState {
    //state
    medicalRecords: MedicalRecordResponse[] | any[];
    patients: Patient[];
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType;
    
    //modal state
    selectedMedicalRecord: (MedicalRecordFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isStatusModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteMedicalRecordData: { id: string, itemName: string, itemType: string } | null;

    //state for medical record details
    currentMedicalRecord: MedicalRecord | null;
    
    //search and pagination state
    searchTerm: string;
    currentPage: number;
    recordsPerPage: number;
    pagination: PaginationInfo | null;
    
    //view state
    showDetails: boolean;
    selectedRecord: (MedicalRecord & { id?: string }) | null | any;

    //actions
    fetchMedicalRecords: (page?: number, search?: string) => Promise<void>;
    fetchMedicalRecordById: (medicalRecordId: string) => Promise<void>;
    addMedicalRecord: (data: MedicalRecordFormData) => Promise<void>;
    updateMedicalRecordData: (id: string, data: MedicalRecordFormData) => Promise<void>;
    deleteMedicalRecord: (id: string) => Promise<void>;
    viewMedicalRecord: (record: MedicalRecordResponse) => Promise<void>;
    
    //state for medical record details
    clearCurrentMedicalRecord: () => void;
    
    //modal actions
    openUpdateModal: (record: MedicalRecordResponse | MedicalRecordFormData) => void;
    openStatusModal: (record: MedicalRecordFormData) => void;
    openDeleteModal: (record: MedicalRecordResponse) => void;
    closeUpdateModal: () => void;
    closeStatusModal: () => void;
    closeDeleteModal: () => void;
    closeDetailsModal: () => void;

    //search and pagination actions
    setSearchTerm: (searchTerm: string) => void;
    setCurrentPage: (page: number) => void;
    handlePageChange: (newPage: number) => void;
    
    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    getStatusFromRecord: (record: MedicalRecordResponse) => string;
}

export interface ExtendedMedicalRecordState extends MedicalRecordState {
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
    viewMode: 'admin' | 'user';
}




//billing state
export interface BillingState {
    //state
    billings: BillingResponse[];
    loading: boolean;
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType | null;

    //modal state
    selectedBilling: (BillingFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteBillingData: { id: string, itemName: string, itemType: string } | null;

    //pagination state
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;

    //filter state
    searchTerm: string;
    filterStatus: string;

    //actions
    fetchBillings: (page?: number, search?: string, status?: string) => Promise<void>;
    addBilling: (data: BillingFormData) => Promise<void>;
    updateBillingData: (id: string, data: BillingFormData) => Promise<void>;
    deleteBilling: (id: string) => Promise<void>;

    //pagination actions
    setCurrentPage: (page: number) => void;

    //filter actions
    setSearchTerm: (term: string) => void;
    setFilterStatus: (status: string) => void;
    applyFilters: () => Promise<void>;

    //modal actions
    openAddModal: () => void;
    openUpdateModal: (billing: BillingResponse) => void;
    openDeleteModal: (billing: BillingResponse) => void;
    closeUpdateModal: () => void;
    closeDeleteModal: () => void;

    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    //business actions
    processPayment: (billId: string) => Promise<void>;
    exportBillings: () => Promise<void>;
}




//patient state
export interface PatientState {
    //state
    patients: PatientFormData[];
    loading: boolean;
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType | null;

    //modal state
    selectedPatient: (PatientFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deletePatientData: { id: string, itemName: string, itemType: string } | null;

    //actions
    fetchPatients: () => Promise<void>;
    addPatient: (data: PatientFormData) => Promise<void>;
    updatePatientData: (id: string, data: PatientFormData) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;

    //modal actions
    openAddModal: () => void;
    openUpdateModal: (item: PatientFormData) => void;
    openDeleteModal: (item: PatientFormData) => void;
    closeUpdateModal: () => void;
    closeDeleteModal: () => void;

    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}


//authentication state
export interface AuthenticationState {
    //auth state
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    
    //form state
    loginForm: LoginFormData
    signupForm: SignupFormData
    signupStep: number
    completedSteps: Set<number>
    
    //ui state
    showPassword: boolean
    showConfirmPassword: boolean
    validationErrors: ValidationErrors
    
    //actions
    login: (credentials: Omit<LoginFormData, 'rememberMe'>) => Promise<void>
    logout: () => void
    register: (userData: Omit<SignupFormData, 'confirmPassword' | 'agreeToTerms'>) => Promise<void>
    
    //form actions
    updateLoginForm: (field: keyof LoginFormData, value: string | boolean) => void
    updateSignupForm: (field: keyof SignupFormData, value: string | boolean) => void
    clearLoginForm: () => void
    clearSignupForm: () => void
    
    //step navigation
    setSignupStep: (step: number) => void
    nextSignupStep: () => void
    prevSignupStep: () => void
    completeStep: (step: number) => void
    
    //password visibility
    togglePasswordVisibility: () => void
    toggleConfirmPasswordVisibility: () => void
    
    //validation
    setValidationErrors: (errors: ValidationErrors) => void
    clearValidationError: (field: string) => void
    clearAllValidationErrors: () => void
    
    //local storage
    saveFormData: () => void
    loadFormData: () => void
    clearSavedFormData: () => void
    
    //auth helpers
    initializeAuth: () => void
    checkTokenExpiration: () => boolean
}