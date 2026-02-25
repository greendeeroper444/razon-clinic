import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { PersonnelFormData, ExtendedPersonnelState, OperationType, FetchParams } from '../types'
import { deletePersonnel, getPersonnel, updatePersonnel, addPersonnel, getPersonnelStats } from '../services';
import { toast } from 'sonner';
import { handleStoreError } from '../utils';

export const usePersonnelStore = create<ExtendedPersonnelState>()(
    devtools(
        (set, get) => ({
            personnel: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedPersonnel: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalDeleteOpen: false,
            deletePersonnelData: null,
            summaryStats: {
                total: 0,
                doctors: 0,
                staff: 0,
                recentlyAdded: 0
            },
            currentOperation: null as OperationType,
            validationErrors: {},
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: 1,
                endIndex: 0,
                isUnlimited: false,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm: null
            },

            clearValidationErrors: () => set({ validationErrors: {} }),

            addPersonnel: async (data: PersonnelFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addPersonnel(data);
                    
                    toast.success('Personnel added successfully!');

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to add personnel'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            fetchPersonnel: async (params: FetchParams) => {
                const currentState = get();
                
                //prevent multiple simultaneous fetches
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getPersonnel(params);
                    const personnel = response.data.personnel || [];
                    const pagination = response.data.pagination || {};

                    set({ 
                        personnel,
                        loading: false,
                        fetchLoading: false,
                        pagination: {
                            currentPage: pagination.currentPage || 1,
                            totalPages: pagination.totalPages || 1,
                            totalItems: pagination.totalItems || 0,
                            itemsPerPage: pagination.itemsPerPage || 10,
                            hasNextPage: pagination.hasNextPage || false,
                            hasPreviousPage: pagination.hasPreviousPage || false,
                            startIndex: pagination.startIndex || 1,
                            endIndex: pagination.endIndex || 0,
                            isUnlimited: pagination.isUnlimited || false,
                            nextPage: pagination.nextPage,
                            previousPage: pagination.previousPage,
                            remainingItems: pagination.remainingItems || 0,
                            searchTerm: pagination.searchTerm || null
                        },
                    });

                    //only fetch summary stats on initial load or non-search requests
                    if (!params.search && params.page === 1) {
                        get().fetchSummaryStats();
                    }
                    
                } catch (error) {
                    console.error('Error fetching personnel:', error);
                    set({ 
                        error: 'An error occurred while fetching personnel', 
                        loading: false,
                        fetchLoading: false
                    });
                }
            },

            fetchSummaryStats: async () => {
                try {
                    const statsResponse = await getPersonnelStats();

                    set({
                        summaryStats: {
                            total: statsResponse.data.totalPersonnel || 0,
                            doctors: statsResponse.data.totalDoctors || 0,
                            staff: statsResponse.data.totalStaff || 0,
                            recentlyAdded: statsResponse.data.recentlyAdded || 0
                        }
                    });
                } catch (error) {
                    console.error('Error fetching summary stats:', error);
                    set({ error: 'An error occurred while fetching summary stats' });
                }
            },

            updatePersonnelData: async (id: string, data: PersonnelFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updatePersonnel(id, data);

                    toast.success('Personnel updated successfully!');
                    set({ isModalUpdateOpen: false, selectedPersonnel: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500);

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to update personnel'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            deletePersonnel: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deletePersonnel(id);
                    await get().fetchPersonnel({});
                    
                    toast.success('Personnel deleted successfully!');
                    set({ isModalDeleteOpen: false, deletePersonnelData: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                    
                } catch (error) {
                    console.error('Error deleting personnel:', error);
                    toast.error('Failed to delete personnel');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            openModalCreate: () => {
                set({ 
                    isModalCreateOpen: true,
                    validationErrors: {}
                });
            },

            openModalUpdate: (item: PersonnelFormData) => {
                const formData: PersonnelFormData & { id?: string } = {
                    id: item.id,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    middleName: item.middleName,
                    suffix: item.suffix,
                    contactNumber: item.contactNumber,
                    birthdate: item.birthdate.split('T')[0],
                    sex: item.sex,
                    address: item.address,
                    role: item.role,
                };

                set({ 
                    selectedPersonnel: formData, 
                    isModalUpdateOpen: true,
                    validationErrors: {}
                });
            },

            openModalDelete: (item: PersonnelFormData) => {
                if (!item.id) {
                    console.error('Personnel ID is missing:', item);
                    return;
                }
                
                set({
                    deletePersonnelData: {
                        id: item.id,
                        itemName: `${item.firstName} ${item.lastName}`,
                        itemType: 'Personnel'
                    },
                    isModalDeleteOpen: true
                });
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedPersonnel: null,
                    validationErrors: {}
                });
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedPersonnel: null,
                    validationErrors: {}
                });
            },

            closeModalDelete: () => {
                set({ 
                    isModalDeleteOpen: false, 
                    deletePersonnelData: null 
                });
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
        }),
        {
            name: 'personnel-store'
        }
    )
)