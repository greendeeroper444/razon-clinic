import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner';
import { OperationType, PatientFormData, PatientState } from '../types';
import { addPatient, deletePatient, getPatients, updatePatient } from '../services';

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
            currentOperation: null as OperationType,

            //fetch patients
            fetchPatients: async () => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getPatients();
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
                    
                } catch (error) {
                    console.error('Error fetching patients:', error);
                    set({ 
                        error: 'An error occurred while fetching patients', 
                        loading: false,
                        fetchLoading: false
                    });
                }
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

            //update patient
            updatePatientData: async (id: string, data: PatientFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updatePatient(id, data);
                    await get().fetchPatients();

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
        }),
        {
            name: 'patient-store' //for Redux DevTools
        }
    )
)