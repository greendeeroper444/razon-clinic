import { AppointmentFormData, AppointmentResponse } from "./appointment"
import { LoginFormData, SignupFormData, ValidationErrors } from "./auth";
import { BillingFormData, BillingResponse } from "./billing";
import { BlockedTimeSlotFetchParams, BlockedTimeSlotFormData, BlockedTimeSlotOperationType, BlockedTimeSlotPagination, BlockedTimeSlotSummaryStats, CheckBlockedResponse } from "./blockedSlot";
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
    status?: string;
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
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalStatusOpen: boolean;
    isModalDeleteOpen: boolean;
    deleteAppointmentData: { id: string, itemName: string, itemType: string } | null;

    //state for appointment details
    currentAppointment: AppointmentResponse | null;

    //actions
    addAppointment: (data: AppointmentFormData) => Promise<void>;
    fetchAppointments: (params?: FetchParams) => Promise<void>;
    fetchMyAppointments: (params?: FetchParams) => Promise<void>;
    //actions for appointment details
    fetchAppointmentById: (appointmentId: string) => Promise<void>;
    // updateCurrentAppointment: (id: string, data: AppointmentFormData) => Promise<void>;
    clearCurrentAppointment: () => void;
    updateAppointmentData: (id: string, data: AppointmentFormData) => Promise<void>;
    updateAppointmentStatus: (id: string, data: AppointmentFormData) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;
    
    //modal actions
    openModalCreate: () => void;
    openModalUpdate: (appointment: AppointmentResponse) => void;
    openModalStatus: (appointment: AppointmentResponse) => void;
    openModalDelete: (appointment: AppointmentResponse) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalStatus: () => void;
    closeModalDelete: () => void;
    
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
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalDeleteOpen: boolean;
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
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;

    //modal actions
    openModalCreate: () => void;
    openModalAdd: () => void;
    openModalUpdate: (item: InventoryItemFormData, restockMode?: boolean, addQuantityMode?: boolean) => void;
    openModalDelete: (item: InventoryItemFormData) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalDelete: () => void;

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
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalStatusOpen: boolean;
    isModalDeleteOpen: boolean;
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
    exportMedicalRecords: () => void;
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;
    
    //state for medical record details
    clearCurrentMedicalRecord: () => void;
    
    //modal actions
    openModalCreate: () => void;
    openModalUpdate: (record: MedicalRecordResponse | MedicalRecordFormData) => void;
    openModalStatus: (record: MedicalRecordFormData) => void;
    openModalDelete: (record: MedicalRecordResponse) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalStatus: () => void;
    closeModalDelete: () => void;
    closeModalDetails: () => void;

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
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalDeleteOpen: boolean;
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
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;

    //filter actions
    setSearchTerm: (term: string) => void;
    setFilterStatus: (status: string) => void;
    applyFilters: () => Promise<void>;

    //modal actions
    openModalCreate: () => void;
    openModalAdd: () => void;
    openModalUpdate: (billing: BillingResponse) => void;
    openModalDelete: (billing: BillingResponse | BillingFormData) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalDelete: () => void;

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
    selectedPatient: (PatientFormData & { id?: string }) | null;
    pagination: Pagination | null;
    summaryStats: {
        total: number;
        active: number;
        archived: number;
        thisMonth: number;
    };
    
    selectedPatientIds: string[] | any;
    searchQuery: string;
    currentPage: number;
    itemsPerPage: number;
    loading: boolean;
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
    isProcessing: boolean;
    activeTab: 'all' | 'active' | 'archive';
    currentOperation: OperationType | null;
    error: string | null;

    currentPatient: PatientResponse | null;

    //modal state
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalDeleteOpen: boolean;
    deletePatientData: { id: string, itemName: string, itemType: string } | null;

    //fetch actions
    fetchPatients: (params?: FetchParams) => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    fetchPatientById: (patientId: string) => Promise<void>;
    addPatient: (data: PatientFormData) => Promise<void>;
    updatePatientData: (id: string, data: PatientFormData) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;
    
    //navigation actions
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    setActiveTab: (tab: 'all' | 'active' | 'archive') => void;
    
    //selection actions
    togglePatientSelection: (patientId: string) => void;
    toggleSelectAll: () => void;
    clearSelection: () => void;
    
    //archive actions
    archiveSinglePatient: (patientId: string) => Promise<void>;
    unarchiveSinglePatient: (patientId: string) => Promise<void>;
    archiveSelectedPatients: () => Promise<void>;
    unarchiveSelectedPatients: () => Promise<void>;
    
    //getter actions
    getFilteredPatients: () => PatientFormData[];
    getStats: () => {
        totalPatients: number;
        activePatients: number;
        archivedPatients: number;
        selected: number;
    };

    //modal actions
    openModalCreate: () => void;
    openModalAdd: () => void;
    openModalUpdate: (item: PatientFormData) => void;
    openModalDelete: (item: PatientFormData) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalDelete: () => void;

    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearCurrentPatient: () => void;
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
    // validationErrors: ValidationErrors
    
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
    validationErrors: Record<string, string[]> | ValidationErrors | any;
    clearValidationErrors: () => void;
    
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
    exportInventoryReport: () => Promise<void>;
    exportSalesReport: () => Promise<void>;
    
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

export interface BlockedTimeSlotState {
    blockedTimeSlots: BlockedTimeSlotFormData[];
    loading: boolean;
    fetchLoading: boolean;
    submitLoading: boolean;
    error: string | null;
    isProcessing: boolean;
    selectedBlockedTimeSlot: BlockedTimeSlotFormData | null;
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalDeleteOpen: boolean;
    deleteBlockedTimeSlotData: { id: string, itemName: string, itemType: string } | null;
    summaryStats: BlockedTimeSlotSummaryStats;
    currentOperation: BlockedTimeSlotOperationType;
    pagination: BlockedTimeSlotPagination;
    
    addBlockedTimeSlot: (data: BlockedTimeSlotFormData) => Promise<void>;
    fetchBlockedTimeSlots: (params: BlockedTimeSlotFetchParams) => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    updateBlockedTimeSlotData: (id: string, data: BlockedTimeSlotFormData) => Promise<void>;
    deleteBlockedTimeSlot: (id: string) => Promise<void>;
    checkIfTimeBlocked: (preferredDate: string, preferredTime: string) => Promise<CheckBlockedResponse>;
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;

    openModalCreate: () => void;
    openModalUpdate: (item: BlockedTimeSlotFormData) => void;
    openModalDelete: (item: BlockedTimeSlotFormData) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalDelete: () => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}