import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner';
import { FetchParams, OperationType, PatientFormData, PatientState } from '../types';
import { addPatient, deletePatient, getPatients, updatePatient, getPatientById } from '../services';

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
            isModalOpen: false,
            isDeleteModalOpen: false,
            deletePatientData: null,
            currentPatient: null,
            summaryStats: {
                total: 0,
                active: 0,
                archived: 0,
                thisMonth: 0
            },
            currentOperation: null as OperationType,
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

            //add patient
            addPatient: async (data: PatientFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'create' });
                    
                    await addPatient(data);
                    await get().fetchPatients();
                    
                    toast.success('Patient added successfully!');
                    set({ isModalOpen: false, selectedPatient: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    console.error('Error adding patient:', error);
                    toast.error('Failed to add patient');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            //fetch patients
            fetchPatients: async (params: FetchParams) => {
                const currentState = get();
                
                //prevent multiple simultaneous fetches
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getPatients(params);
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
                        loading: false,
                        fetchLoading: false
                    });

                    if (!params.search && params.page === 1) {
                        get().fetchSummaryStats();
                    }
                    
                } catch (error) {
                    console.error('Error fetching patients:', error);
                    set({ 
                        error: 'An error occurred while fetching patients', 
                        loading: false,
                        fetchLoading: false
                    });
                }
            },


            fetchSummaryStats: async () => {
                try {
                    const { patients } = get();
                    
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();

                    //calculate summary statistics
                    const total = patients.length;
                    const active = patients.filter(p => !p.isArchive).length;
                    const archived = patients.filter(p => p.isArchive).length;
                    const thisMonth = patients.filter(p => {
                        if (!p.birthdate) return false;
                        const patientDate = new Date(p.birthdate);
                        return patientDate.getMonth() === currentMonth && 
                               patientDate.getFullYear() === currentYear;
                    }).length;

                    set({
                        summaryStats: {
                            total,
                            active,
                            archived,
                            thisMonth
                        }
                    });
                } catch (error) {
                    console.error('Error fetching patient summary stats:', error);
                    set({ error: 'An error occurred while fetching summary stats' });
                }
            },


            fetchPatientById: async (patientId: string) => {
                try {
                    // set({ loading: true, error: null });
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getPatientById(patientId);
                    
                    if (response.success) {
                        set({ 
                            currentPatient: response.data,
                            loading: false 
                        })
                    } else {
                        set({ 
                            error: 'Failed to load patient details', 
                            loading: false 
                        })
                    }
                } catch (error) {
                    console.error('Error fetching patients:', error)
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching patients', 
                        loading: false 
                    })
                }
            },

            //update patient
            updatePatientData: async (id: string, data: PatientFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updatePatient(id, data);
                    await get().fetchPatients();

                    await get().fetchPatientById(id);

                    toast.success('Patient updated successfully!');
                    set({ 
                        isModalOpen: false, 
                        selectedPatient: null
                    });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500);

                } catch (error) {
                    console.error('Error updating patient:', error);
                    toast.error('Failed to update patient');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            //delete patient
            deletePatient: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deletePatient(id);
                    await get().fetchPatients();
                    
                    toast.success('Patient deleted successfully!');
                    set({ 
                        isDeleteModalOpen: false, 
                        deletePatientData: null 
                    });

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

            //modal actions
            openAddModal: () => {
                set({ 
                    selectedPatient: null,
                    isModalOpen: true,
                });
            },

            openUpdateModal: (patient: PatientFormData) => {
                const formData: PatientFormData & { patientId?: string } = {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    middleName: patient.middleName,
                    email: patient.email,
                    contactNumber: patient.contactNumber,
                    birthdate: patient.birthdate,
                    sex: patient.sex,
                    address: patient.address,
                    religion: patient.religion || '',
                    motherInfo: patient.motherInfo || {
                        name: '',
                        age: undefined,
                        occupation: ''
                    },
                    fatherInfo: patient.fatherInfo || {
                        name: '',
                        age: undefined,
                        occupation: ''
                    },
                    isArchive: patient.isArchive
                };

                set({ 
                    selectedPatient: formData, 
                    isModalOpen: true,
                });
            },

            openDeleteModal: (patient: PatientFormData) => {
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
                    isDeleteModalOpen: true
                });
            },

            closeUpdateModal: () => {
                set({ 
                    isModalOpen: false, 
                    selectedPatient: null,
                });
            },

            closeDeleteModal: () => {
                set({ 
                    isDeleteModalOpen: false, 
                    deletePatientData: null 
                });
            },

            //utility actions
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentPatient: () => set({ currentPatient: null })
        }),
        {
            name: 'patient-store'
        }
    )
)