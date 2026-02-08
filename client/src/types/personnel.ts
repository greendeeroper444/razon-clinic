export interface PersonnelFormData {
    id?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber: string;
    password?: string;
    birthdate: string;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    role: 'Doctor' | 'Staff';
    dateRegistered?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PersonnelState {
    //state
    personnel: PersonnelFormData[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    isProcessing: boolean;
    currentOperation: OperationType;

    //modal state
    selectedPersonnel: (PersonnelFormData & { id?: string }) | null;
    isModalCreateOpen: boolean;
    isModalUpdateOpen: boolean;
    isModalDeleteOpen: boolean;
    deletePersonnelData: { id: string, itemName: string, itemType: string } | null;

    //summary stats state
    summaryStats: {
        total: number;
        doctors: number;
        staff: number;
        recentlyAdded: number;
    };

    //actions
    fetchPersonnel: (params?: FetchParams) => Promise<void>;
    fetchSummaryStats: () => Promise<void>;
    addPersonnel: (data: PersonnelFormData) => Promise<void>;
    updatePersonnelData: (id: string, data: PersonnelFormData) => Promise<void>;
    deletePersonnel: (id: string) => Promise<void>;
    validationErrors: Record<string, string[]>;
    clearValidationErrors: () => void;

    //modal actions
    openModalCreate: () => void;
    openModalUpdate: (item: PersonnelFormData) => void;
    openModalDelete: (item: PersonnelFormData) => void;
    closeModalCreate: () => void;
    closeModalUpdate: () => void;
    closeModalDelete: () => void;

    //utility actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export interface ExtendedPersonnelState extends PersonnelState {
    fetchLoading: boolean;
    submitLoading: boolean;
    statusLoading: boolean;
}


export interface PersonnelFormProps {
    formData?: {
        id?: string | number;
        firstName?: string;
        lastName?: string;
        middleName?: string;
        contactNumber?: string;
        password?: string;
        birthdate?: string;
        sex?: string;
        address?: string;
        role?: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}