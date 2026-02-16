import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MedicalRecordFormData, OperationType, MedicalRecord, ExtendedMedicalRecordState, Patient, FetchParams } from '../types'
import { softDeleteMedicalRecord, getMedicalRecordById, getMedicalRecords, updateMedicalRecord, addMedicalRecord, getMyMedicalRecords, exportMedicalRecords } from '../services';
import { toast } from 'sonner';
import { handleStoreError, formatDate } from '../utils';

export const useMedicalRecordStore = create<ExtendedMedicalRecordState>()(
    devtools(
        (set, get) => ({
            medicalRecords: [],
            patients: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedMedicalRecord: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalStatusOpen: false,
            isModalDeleteOpen: false,
            softDeleteMedicalRecordData: null,
            currentMedicalRecord: null,
            viewMode: 'user' as 'admin' | 'user',
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
                searchTerm: null,
            },

            clearValidationErrors: () => set({ validationErrors: {} }),

            addMedicalRecord: async (data: MedicalRecordFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addMedicalRecord(data);
                    await get().fetchMedicalRecords();
                    
                    toast.success('Medical record created successfully!');

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to add medical record'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            fetchMedicalRecords: async (params: FetchParams) => {
                const currentState = get();
                
                //prevent multiple simultaneous fetches
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getMedicalRecords(params);
                    
                    if (response.success) {
                        const medicalRecords = response.data.medicalRecords || [];
                        const pagination = response.data.pagination || {};

                        //extract unique patients from medical records for the modal dropdown
                        const uniquePatients = Array.from(
                            new Map(
                                medicalRecords
                                    .filter((record: MedicalRecord) => record?.id) 
                                    .map((record: MedicalRecord) => [
                                        record.id,
                                        {
                                            id: record.id,
                                            firstName: record.personalDetails?.fullName || 'N/A'
                                        }
                                    ])
                            ).values()
                        );

                        set({ 
                            medicalRecords,
                            patients: uniquePatients as Patient[],
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
                                searchTerm: pagination.searchTerm || null,
                            },
                            fetchLoading: false,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch medical records', 
                            fetchLoading: false,
                            loading: false 
                        });
                    }
                } catch (error) {
                    console.error('Error fetching medical records:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching medical records', 
                        loading: false 
                    });
                }
            },

            fetchMyMedicalRecords: async (params: FetchParams) => {
                const currentState = get();
                
                //prevent multiple simultaneous fetches
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getMyMedicalRecords(params);
                    
                    if (response.success) {
                        const medicalRecords = response.data.medicalRecords || [];
                        const pagination = response.data.pagination || {};

                        //extract unique patients from medical records for the modal dropdown
                        const uniquePatients = Array.from(
                            new Map(
                                medicalRecords
                                    .filter((record: MedicalRecord) => record?.id) 
                                    .map((record: MedicalRecord) => [
                                        record.id,
                                        {
                                            id: record.id,
                                            firstName: record.personalDetails?.fullName || 'N/A'
                                        }
                                    ])
                            ).values()
                        );

                        set({ 
                            medicalRecords,
                            patients: uniquePatients as Patient[],
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
                                searchTerm: pagination.searchTerm || null,
                            },
                            fetchLoading: false,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch medical records', 
                            fetchLoading: false,
                            loading: false 
                        });
                    }
                } catch (error) {
                    console.error('Error fetching medical records:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching medical records', 
                        loading: false 
                    });
                }
            },

            fetchMedicalRecordById: async (medicalRecordId: string) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getMedicalRecordById(medicalRecordId);
                    
                    if (response.success) {
                        set({ 
                            currentMedicalRecord: response.data,
                            selectedRecord: response.data.data,
                            fetchLoading: false,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({ 
                            error: 'Failed to load medical record details', 
                            fetchLoading: false,
                            loading: false 
                        });
                    }
                } catch (error) {
                    console.error('Error fetching medical record:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching medical record', 
                        loading: false 
                    });
                }
            },

            updateMedicalRecordData: async (id: string, data: MedicalRecordFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updateMedicalRecord(id, data);
                    await get().fetchMedicalRecords();

                    //refresh it too
                    const currentState = get();
                    if (currentState.currentMedicalRecord && currentState.currentMedicalRecord.id === id) {
                        await get().fetchMedicalRecordById(id);
                    }
                    
                    toast.success('Updated medical record successfully!');
                    set({ isModalUpdateOpen: false, selectedMedicalRecord: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to update medical record'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            softDeleteMedicalRecord: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await softDeleteMedicalRecord(id);
                    await get().fetchMedicalRecords();
                    
                    toast.success('Medical record deleted successfully!');
                    set({ isModalDeleteOpen: false, softDeleteMedicalRecordData: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    console.error('Error deleting medical record:', error);
                    toast.error('Failed to delete medical record');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalDeleteOpen: false,
                        softDeleteMedicalRecordData: null,
                        currentOperation: null
                    });
                }
            },

            exportMedicalRecords: async (format: 'csv' | 'xlsx' | 'json' = 'xlsx') => {
                try {
                    set({ loading: true });
                    
                    //export all data without any filters
                    const exportParams = {
                        format
                    };

                    const result = await exportMedicalRecords(exportParams);
                    
                    if (result.success) {
                        toast.success('Export completed successfully!', {
                            description: `Downloaded: ${result.filename}`
                        });
                    }
                } catch (error) {
                    console.error('Error exporting medicala records:', error);
                    toast.error('Failed to export medicala records', {
                        description: error instanceof Error ? error.message : 'An error occurred'
                    });
                } finally {
                    set({ loading: false });
                }
            },


            viewMedicalRecord: async (record: MedicalRecordFormData) => {
                try {
                    const response = await getMedicalRecordById(record.id);
                    if (response.success) {
                        set({ 
                            selectedRecord: response.data, 
                            showDetails: true 
                        });
                    }
                } catch (err) {
                    console.error('Error fetching record details:', err);
                    set({ 
                        selectedRecord: record, 
                        showDetails: true 
                    });
                }
            },

            getStatusFromRecord: (record: MedicalRecord): string => {
                if (record.followUpDate) {
                    const followUpDate = new Date(record.followUpDate);
                    const today = new Date();
                    if (followUpDate > today) {
                        return 'Pending';
                    }
                }
                
                if (record.diagnosis && record.treatmentPlan) {
                    return 'Completed';
                }
                
                return 'Active';
            },

            openModalCreate: () => {
                set({ 
                    isModalCreateOpen: true,
                    validationErrors: {}
                });
            },

            openModalUpdate: (record: MedicalRecord) => {
                const formData: MedicalRecordFormData & { id?: string } = {
                    id: record.id,
                    medicalRecordNumber: record.id, // or however you get this
                    
                    //personal details (flattened)
                    fullName: record.personalDetails?.fullName || '',
                    dateOfBirth: record.personalDetails?.dateOfBirth?.split('T')[0] || '',
                    gender: record.personalDetails?.gender || '',
                    bloodType: record.personalDetails?.bloodType || '',
                    phone: record.personalDetails?.phone || '',
                    email: record.personalDetails?.email || '',
                    address: record.personalDetails?.address || '',
                    emergencyContact: record.personalDetails?.emergencyContact || '',

                    //current symptoms (flattened)
                    chiefComplaint: record.currentSymptoms?.chiefComplaint || '',
                    symptomsDescription: record.currentSymptoms?.symptomsDescription || '',
                    symptomsDuration: record.currentSymptoms?.symptomsDuration || '',
                    painScale: record.currentSymptoms?.painScale || 0,

                    //medical history (flattened)
                    allergies: record.medicalHistory?.allergies || '',
                    chronicConditions: record.medicalHistory?.chronicConditions || '',
                    previousSurgeries: record.medicalHistory?.previousSurgeries || '',
                    familyHistory: record.medicalHistory?.familyHistory || '',

                    //growth Milestones (flattened)
                    height: record.growthMilestones?.height || 0,
                    weight: record.growthMilestones?.weight || 0,
                    bmi: record.growthMilestones?.bmi || '',
                    growthNotes: record.growthMilestones?.growthNotes || '',

                    //clinical Information (flattened)
                    diagnosis: record.diagnosis || '',
                    treatmentPlan: record.treatmentPlan || '',
                    prescribedMedications: record.prescribedMedications || '',
                    consultationNotes: record.consultationNotes || '',
                    vaccinationHistory: record.vaccinationHistory || '',
                    followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : undefined,

                    //nested objects (required by MedicalRecordFormData)
                    personalDetails: {
                        fullName: record.personalDetails?.fullName || '',
                        dateOfBirth: record.personalDetails?.dateOfBirth || '',
                        gender: record.personalDetails?.gender || 'Other',
                        bloodType: record.personalDetails?.bloodType,
                        address: record.personalDetails?.address,
                        phone: record.personalDetails?.phone || '',
                        email: record.personalDetails?.email,
                        emergencyContact: record.personalDetails?.emergencyContact,
                        age: record.personalDetails?.age
                    },
                    medicalHistory: {
                        allergies: record.medicalHistory?.allergies,
                        chronicConditions: record.medicalHistory?.chronicConditions,
                        previousSurgeries: record.medicalHistory?.previousSurgeries,
                        familyHistory: record.medicalHistory?.familyHistory,
                        general: record.medicalHistory?.general
                    },
                    growthMilestones: {
                        height: record.growthMilestones?.height,
                        weight: record.growthMilestones?.weight,
                        bmi: record.growthMilestones?.bmi,
                        growthNotes: record.growthMilestones?.growthNotes,
                        general: record.growthMilestones?.general
                    },
                    currentSymptoms: {
                        chiefComplaint: record.currentSymptoms?.chiefComplaint || '',
                        symptomsDescription: record.currentSymptoms?.symptomsDescription || '',
                        symptomsDuration: record.currentSymptoms?.symptomsDuration,
                        painScale: record.currentSymptoms?.painScale,
                        general: record.currentSymptoms?.general
                    }
                };
                
                set({ 
                    selectedMedicalRecord: formData, 
                    isModalUpdateOpen: true,
                    validationErrors: {}
                });
            },

            openModalStatus: (record: MedicalRecordFormData) => {
                set({
                    selectedMedicalRecord: record,
                    isModalStatusOpen: true
                });
            },

            openModalDelete: (record: MedicalRecord) => {
                const patientName = record.personalDetails.fullName || 'Unknown Patient';
                const recordDate = record.dateRecorded;
                
                set({
                    softDeleteMedicalRecordData: {
                        id: record.id,
                        itemName: `${patientName}'s medical record from ${formatDate(recordDate)}`,
                        itemType: 'Medical Record'
                    },
                    isModalDeleteOpen: true
                });
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedMedicalRecord: null,
                    validationErrors: {}
                });
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedMedicalRecord: null,
                    validationErrors: {}
                });
            },

            closeModalStatus: () => {
                set({ isModalStatusOpen: false, selectedMedicalRecord: null });
            },

            closeModalDelete: () => {
                set({ isModalDeleteOpen: false, softDeleteMedicalRecordData: null });
            },

            closeModalDetails: () => {
                set({ showDetails: false, selectedRecord: null });
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentMedicalRecord: () => set({ currentMedicalRecord: null }),
        }),
        {
            name: 'medical-record-store'
        }
    )
)