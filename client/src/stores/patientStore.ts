import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner';
import { FetchParams, OperationType, PatientFormData, PatientState } from '../types';
import { addPatient, deletePatient, getPatients, updatePatient, getPatientById, archivePatient, unarchivePatient, archiveMultiplePatients, unarchiveMultiplePatients } from '../services';
import { handleStoreError } from '../utils';

export const usePatientStore = create<PatientState>()(
    devtools(
        (set, get) => ({
            patients: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedPatient: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalDeleteOpen: false,
            deletePatientData: null,
            currentPatient: null,
            summaryStats: {
                total: 0,
                active: 0,
                archived: 0,
                thisMonth: 0
            },
            selectedPatientIds: [],
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            activeTab: 'all' as const,
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

            addPatient: async (data: PatientFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addPatient(data);
                    
                    const { pagination, searchQuery } = get()
                    await get().fetchPatients({ 
                        page: pagination?.currentPage, 
                        limit: pagination?.itemsPerPage,
                        search: searchQuery 
                    })
                    
                    toast.success('Patient added successfully!');

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
                        defaultMessage: 'Failed to add patient'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            fetchSummaryStats: async () => {
                try {
                    const [allResponse, activeResponse, archivedResponse] = await Promise.all([
                        getPatients({ page: 1, limit: 1 }),
                        getPatients({ page: 1, limit: 1, isArchived: false }),
                        getPatients({ page: 1, limit: 1, isArchived: true })
                    ])

                    const thisMonthResponse = await getPatients({ 
                        page: 1, 
                        limit: 1000,
                    })

                    const currentDate = new Date()
                    const currentMonth = currentDate.getMonth()
                    const currentYear = currentDate.getFullYear()

                    const thisMonth = thisMonthResponse.data.patients.filter((patient: { createdAt?: string }) => {
                        if (!patient.createdAt) return false
                        const patientDate = new Date(patient.createdAt)
                        return patientDate.getMonth() === currentMonth && 
                            patientDate.getFullYear() === currentYear
                    }).length

                    set({
                        summaryStats: {
                            total: allResponse.data.pagination.totalItems,
                            active: activeResponse.data.pagination.totalItems,
                            archived: archivedResponse.data.pagination.totalItems,
                            thisMonth
                        }
                    })
                } catch (error) {
                    console.error('Error fetching patient summary stats:', error)
                }
            },

            fetchPatients: async (params: FetchParams) => {
                const currentState = get();
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const { activeTab } = get()
                    
                    const queryParams = { ...params }

                    if (activeTab === 'archive') {
                        queryParams.isArchived = true
                    } else if (activeTab === 'active') {
                        queryParams.isArchived = false
                    }

                    const response = await getPatients(queryParams);
                    
                    if (response.success) {
                        const patients = response.data.patients || [];
                        const pagination = response.data.pagination || {};

                        set({ 
                            patients,
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
                            fetchLoading: false,
                            loading: false
                        });
                        
                        if (!params.search && params.page === 1) {
                            get().fetchSummaryStats()
                        }
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch patients',
                            fetchLoading: false,
                            loading: false
                        })
                    }
                } catch (error) {
                    console.error('Error fetching patients:', error);
                    set({ 
                        error: 'An error occurred while fetching patients',
                        fetchLoading: false, 
                        loading: false
                    });
                    toast.error('Failed to fetch patients')
                }
            },

            fetchPatientById: async (patientId: string) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getPatientById(patientId);
                    
                    if (response.success) {
                        set({ 
                            currentPatient: response.data,
                            fetchLoading: false,
                            loading: false
                        })
                    }
                } catch (error) {
                    console.error('Error fetching patient:', error);
                    set({ 
                        fetchLoading: false, 
                        loading: false,
                        error: 'Failed to fetch patient details'
                    })
                    toast.error('Failed to fetch patient details')
                }
            },

            updatePatientData: async (id: string, data: PatientFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updatePatient(id, data);
                    await get().fetchPatients({});
                    await get().fetchPatientById(id);

                    toast.success('Patient updated successfully!');
                    set({ isModalUpdateOpen: false, selectedPatient: null });

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
                        defaultMessage: 'Failed to update patient'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            deletePatient: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deletePatient(id);
                    await get().fetchPatients({});
                    
                    toast.success('Patient deleted successfully!');
                    set({ isModalDeleteOpen: false, deletePatientData: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                    
                } catch (error) {
                    console.error('Error deleting patient:', error);
                    toast.error('Failed to delete patient');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            setSearchQuery: (query: string) => {
                set({ searchQuery: query, currentPage: 1 })
            },

            setCurrentPage: (page: number) => {
                set({ currentPage: page, selectedPatientIds: [] })
            },

            setItemsPerPage: (items: number) => {
                set({ itemsPerPage: items, currentPage: 1, selectedPatientIds: [] })
            },

            setActiveTab: (tab) => {
                set({ 
                    activeTab: tab, 
                    currentPage: 1, 
                    selectedPatientIds: [],
                    searchQuery: ''
                })
            },

            togglePatientSelection: (patientId: string) => {
                set((state) => ({
                    selectedPatientIds: state.selectedPatientIds.includes(patientId)
                        ? state.selectedPatientIds.filter((id: string) => id !== patientId)
                        : [...state.selectedPatientIds, patientId]
                }))
            },

            toggleSelectAll: () => {
                const { patients, selectedPatientIds } = get()
                
                if (selectedPatientIds.length === patients.length && patients.length > 0) {
                    set({ selectedPatientIds: [] })
                } else {
                    set({ selectedPatientIds: patients.map(p => p.id) })
                }
            },

            clearSelection: () => {
                set({ selectedPatientIds: [] })
            },

            archiveSinglePatient: async (patientId: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'archive' })
                    
                    const response = await archivePatient(patientId)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        const { pagination, searchQuery } = get()
                        await get().fetchPatients({ 
                            page: pagination?.currentPage, 
                            limit: pagination?.itemsPerPage,
                            search: searchQuery 
                        })
                        get().clearSelection()

                        setTimeout(() => {
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 500)
                    }
                } catch (error) {
                    console.error('Error archiving patient:', error)
                    toast.error('Failed to archive patient')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            unarchiveSinglePatient: async (patientId: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'unarchive' })
                    
                    const response = await unarchivePatient(patientId)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        const { pagination, searchQuery } = get()
                        await get().fetchPatients({ 
                            page: pagination?.currentPage, 
                            limit: pagination?.itemsPerPage,
                            search: searchQuery 
                        })
                        get().clearSelection()

                        setTimeout(() => {
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 500)
                    }
                } catch (error) {
                    console.error('Error unarchiving patient:', error)
                    toast.error('Failed to unarchive patient')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            archiveSelectedPatients: async () => {
                const { selectedPatientIds } = get()
                
                if (selectedPatientIds.length === 0) {
                    toast.warning('No patients selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'archiveMultiple' })
                    
                    const response = await archiveMultiplePatients(selectedPatientIds)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        setTimeout(async () => {
                            const { pagination, searchQuery } = get()
                            await get().fetchPatients({ 
                                page: pagination?.currentPage, 
                                limit: pagination?.itemsPerPage,
                                search: searchQuery 
                            })
                            get().clearSelection()
                            
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 600)
                    }
                } catch (error) {
                    console.error('Error archiving patients:', error)
                    toast.error('Failed to archive patients')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            unarchiveSelectedPatients: async () => {
                const { selectedPatientIds } = get()
                
                if (selectedPatientIds.length === 0) {
                    toast.warning('No patients selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'unarchiveMultiple' })
                    
                    const response = await unarchiveMultiplePatients(selectedPatientIds)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        setTimeout(async () => {
                            const { pagination, searchQuery } = get()
                            await get().fetchPatients({ 
                                page: pagination?.currentPage, 
                                limit: pagination?.itemsPerPage,
                                search: searchQuery 
                            })
                            get().clearSelection()
                            
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 600)
                    }
                } catch (error) {
                    console.error('Error unarchiving patients:', error)
                    toast.error('Failed to unarchive patients')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            getFilteredPatients: () => {
                const { patients } = get()
                return patients
            },

            getStats: () => {
                const { selectedPatientIds, summaryStats } = get()
                
                return {
                    totalPatients: summaryStats.total,
                    activePatients: summaryStats.active,
                    archivedPatients: summaryStats.archived,
                    selected: selectedPatientIds.length
                }
            },

            openModalCreate: () => {
                set({ 
                    isModalCreateOpen: true,
                    validationErrors: {}
                });
            },

            openModalAdd: () => {
                set({ 
                    selectedPatient: null,
                    isModalUpdateOpen: true,
                    validationErrors: {}
                });
            },

            openModalUpdate: (patient: PatientFormData) => {
                const formData: PatientFormData & { patientId?: string } = {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    middleName: patient.middleName,
                    suffix: patient.suffix,
                    email: patient.email,
                    contactNumber: patient.contactNumber,
                    birthdate: patient.birthdate,
                    sex: patient.sex,
                    address: patient.address,
                    religion: patient.religion || '',
                    height: patient.height || '',
                    weight: patient.weight || '',
                    bloodPressure: {
                        systolic: patient.bloodPressure?.systolic || '',
                        diastolic: patient.bloodPressure?.diastolic || ''
                    },
                    temperature: patient.temperature || '',
                    motherInfo: patient.motherInfo || {
                        name: '',
                        age: '',
                        occupation: ''
                    },
                    fatherInfo: patient.fatherInfo || {
                        name: '',
                        age: '',
                        occupation: ''
                    },
                    isArchived: patient.isArchived
                };

                set({ 
                    selectedPatient: formData, 
                    isModalUpdateOpen: true,
                    validationErrors: {}
                });
            },

            openModalDelete: (patient: PatientFormData) => {
                if (!patient.id) {
                    console.error('Patient ID is missing:', patient);
                    return;
                }
                
                set({
                    deletePatientData: {
                        id: patient.id,
                        itemName: patient.firstName || 'Unknown Patient',
                        itemType: 'Patient'
                    },
                    isModalDeleteOpen: true
                });
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedPatient: null,
                    validationErrors: {}
                });
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedPatient: null,
                    validationErrors: {}
                });
            },

            closeModalDelete: () => {
                set({ 
                    isModalDeleteOpen: false, 
                    deletePatientData: null 
                });
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentPatient: () => set({ currentPatient: null })
        }),
        {
            name: 'patient-store'
        }
    )
)