import { AppointmentFormData, AppointmentResponse } from "./appointment"
import { LoginFormData, SignupFormData, ValidationErrors } from "./auth";
import { BillingFormData, BillingResponse } from "./billing";
import { OperationType } from "./crud";
import { InventoryItemFormData } from "./invetory";
import { DeletedMedicalRecord, MedicalRecord, MedicalRecordFormData, MedicalRecordResponse } from "./medical";
import { Pagination } from "./pagination";
import { Patient, PatientFormData, PatientResponse } from "./patient"
import { DashboardReport, InventoryReportItem, InventorySummary, ReportParams, SalesReportItem, SalesSummary } from "./report";
import { User, UserResponse } from "./user";

export interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
    isArchived?: boolean;
}


//appointment state
export interface AppointmentState {
    //state
    appointments: AppointmentResponse[];
    pagination: Pagination | null;
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
    fetchAppointments: (params?: FetchParams) => Promise<void>;
    fetchMyAppointments: (params?: FetchParams) => Promise<void>;
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
    pagination: Pagination | null;
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
    fetchInventoryItems: (params?: FetchParams) => Promise<void>;
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
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType;
    
    //modal state
    selectedMedicalRecord: (MedicalRecordFormData & { id?: string }) | null;
    isModalOpen: boolean;
    isStatusModalOpen: boolean;
    isDeleteModalOpen: boolean;
    softDeleteMedicalRecordData: { id: string, itemName: string, itemType: string } | null;

    //state for medical record details
    currentMedicalRecord: MedicalRecordResponse | null;
    
    //search and pagination state
    searchTerm: string;
    currentPage: number;
    recordsPerPage: number;
    
    //view state
    showDetails: boolean;
    selectedRecord: (MedicalRecord & { id?: string }) | null | any;

    //actions
    fetchMedicalRecords: (params?: FetchParams) => Promise<void>;
    fetchMyMedicalRecords: (params?: FetchParams) => Promise<void>;
    fetchMedicalRecordById: (medicalRecordId: string) => Promise<void>;
    addMedicalRecord: (data: MedicalRecordFormData) => Promise<void>;
    updateMedicalRecordData: (id: string, data: MedicalRecordFormData) => Promise<void>;
    softDeleteMedicalRecord: (id: string) => Promise<void>;
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
    pagination: Pagination | null;
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
    currentBilling: BillingResponse | null;

    //pagination state
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;

    //filter state
    searchTerm: string;
    filterStatus: string;

    summaryStats: {
        totalRevenue: number;
        paidAmount: number;
        unpaidAmount: number;
        totalBillings: number
    };

    //actions
    fetchBillings:(params?: FetchParams) => Promise<void>;
    fetchBillingById: (billingId: string) => Promise<void>;
    addBilling: (data: BillingFormData) => Promise<void>;
    updateBillingData: (id: string, data: BillingFormData) => Promise<void>;
    deleteBilling: (id: string) => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    //pagination actions
    setCurrentPage: (page: number) => void;
    clearCurrentBilling: () => void;

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
    pagination: Pagination | null;
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

    currentPatient: PatientResponse | null;

    //summary stats state
    summaryStats: {
        total: number;
        active: number;
        archived: number;
        thisMonth: number;
    };

    //actions
    fetchPatients: (params?: FetchParams) => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    addPatient: (data: PatientFormData) => Promise<void>;
    updatePatientData: (id: string, data: PatientFormData) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    fetchPatientById: (patientId: string) => Promise<void>;
    clearCurrentPatient: () => void;

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
    logout: () => Promise<void>
    register: (userData: Omit<SignupFormData, 'confirmPassword' | 'agreeToTerms'>) => Promise<void>
    fetchUserProfile: () => Promise<void>

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
    initializeAuth: () => Promise<void> 
    checkTokenExpiration: () => boolean
}


export interface UserManagementState {
    users: User[]
    selectedUser: User | null
    pagination: Pagination | null
    summaryStats: {
        total: number;
        active: number;
        archived: number;
        thisMonth: number;
    }
    
    selectedUserIds: string[]
    searchQuery: string
    currentPage: number
    itemsPerPage: number
    loading: boolean
    fetchLoading: boolean
    submitLoading: boolean
    isProcessing: boolean
    activeTab: 'all' | 'active' | 'archive'
    currentOperation: OperationType
    error: string | null

    currentUser: UserResponse | null;
    
    fetchUsers: (params?: FetchParams) => Promise<void>
    fetchSummaryStats: () => Promise<void>
    fetchUserById: (userId: string) => Promise<void>
    setSearchQuery: (query: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void
    setActiveTab: (tab: 'all' | 'active' | 'archive') => void
    
    toggleUserSelection: (userId: string) => void
    toggleSelectAll: () => void
    clearSelection: () => void
    
    archiveSingleUser: (userId: string) => Promise<void>
    unarchiveSingleUser: (userId: string) => Promise<void>
    archiveSelectedUsers: () => Promise<void>
    unarchiveSelectedUsers: () => Promise<void>
    
    getFilteredUsers: () => User[]
    getStats: () => {
        totalUsers: number
        activeUsers: number
        archivedUsers: number
        selected: number
    }
    
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    resetStore: () => void
}

export interface TrashState {
    deletedRecords: DeletedMedicalRecord[]
    loading: boolean
    fetchLoading: boolean
    submitLoading: boolean
    error: string | null
    isProcessing: boolean
    selectedRecordIds: string[]
    currentOperation: OperationType
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
        hasNextPage: boolean
        hasPreviousPage: boolean
        startIndex: number
        endIndex: number
    }
    activeTab: 'medical-records'
    
    fetchDeletedRecords: (page?: number, limit?: number) => Promise<void>
    restoreSingleRecord: (id: string) => Promise<void>
    bulkRestore: () => Promise<void>
    bulkPermanentDelete: () => Promise<void>
    toggleRecordSelection: (id: string) => void
    toggleSelectAll: () => void
    setActiveTab: (tab: 'medical-records') => void
    clearSelection: () => void
}

export interface ReportState {
    inventoryReportItems: InventoryReportItem[]
    inventorySummary: InventorySummary | null
    
    salesReportItems: SalesReportItem[]
    salesSummary: SalesSummary | null
    
    dashboardReport: DashboardReport | null
    
    loading: boolean
    fetchLoading: boolean
    error: string | null
    activeTab: 'inventory' | 'sales' | 'dashboard'
    
    period: 'today' | 'week' | 'month' | 'year' | 'custom'
    fromDate: string | null
    toDate: string | null
    category: string | null
    paymentStatus: string | null
    searchTerm: string
    
    inventoryPagination: Pagination
    salesPagination: Pagination
    
    fetchInventoryReport: (params?: ReportParams) => Promise<void>
    fetchInventorySummary: () => Promise<void>
    fetchSalesReport: (params?: ReportParams) => Promise<void>
    fetchSalesSummary: () => Promise<void>
    fetchDashboardReport: () => Promise<void>
    setActiveTab: (tab: 'inventory' | 'sales' | 'dashboard') => void
    setPeriod: (period: 'today' | 'week' | 'month' | 'year' | 'custom') => void
    setDateRange: (fromDate: string, toDate: string) => void
    setCategory: (category: string | null) => void
    setPaymentStatus: (status: string | null) => void
    setSearchTerm: (term: string) => void
    resetFilters: () => void
}