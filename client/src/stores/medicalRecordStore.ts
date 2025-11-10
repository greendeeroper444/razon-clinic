import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MedicalRecordFormData, OperationType, MedicalRecord, ExtendedMedicalRecordState, Patient, FetchParams } from '../types'
import { softDeleteMedicalRecord, getMedicalRecordById, getMedicalRecords, updateMedicalRecord, addMedicalRecord, getMyMedicalRecords, exportMedicalRecords } from '../services';
import { toast } from 'sonner';
import { handleApiError } from '../utils/errorHandler';

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
            isModalOpen: false,
            isStatusModalOpen: false,
            isDeleteModalOpen: false,
            softDeleteMedicalRecordData: null,
            currentMedicalRecord: null,
            viewMode: 'user' as 'admin' | 'user',
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

            //add new medical record
            addMedicalRecord: async (data: MedicalRecordFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'create' });
                    
                    await addMedicalRecord(data);
                    
                    //refresh data
                    await get().fetchMedicalRecords();
                    
                    toast.success('Medical record created successfully!');
                    set({ isModalOpen: false, selectedMedicalRecord: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    console.error('Error creating medical record:', error);
                    const { message, validationErrors } = handleApiError(
                        error, 
                        'Failed to add appointment'
                    );
                    toast.error(message);
                    if (validationErrors) {
                        console.log('Validation errors:', validationErrors);
                    }
                    
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: true, 
                        selectedMedicalRecord: null,
                        currentOperation: null
                    });
                }
            },

            
            //fetch all medical records with pagination and search
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
                                searchTerm: pagination.searchTerm || null
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
                                searchTerm: pagination.searchTerm || null
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

            //fetch medical record by id for details page
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

            //update medical record
            updateMedicalRecordData: async (id: string, data: MedicalRecordFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updateMedicalRecord(id, data);
                    
                    //refresh data
                    await get().fetchMedicalRecords();

                    //refresh it too
                    const currentState = get();
                    if (currentState.currentMedicalRecord && currentState.currentMedicalRecord.id === id) {
                        await get().fetchMedicalRecordById(id);
                    }
                    
                    toast.success('Updated medical record successfully!');
                    set({ isModalOpen: false, selectedMedicalRecord: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    console.error('Error updating medical record:', error);
                    toast.error('Failed to update medical record');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false, 
                        selectedMedicalRecord: null,
                        currentOperation: null
                    });
                }
            },

            //delete medical record
            softDeleteMedicalRecord: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await softDeleteMedicalRecord(id);
                    
                    await get().fetchMedicalRecords();
                    
                    toast.success('Medical record deleted successfully!');

                    set({ 
                        isDeleteModalOpen: false, 
                        softDeleteMedicalRecordData: null 
                    });

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
                        isDeleteModalOpen: false,
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


            //view record details
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


            //modal actions
            openUpdateModal: (record: MedicalRecord) => {
                const formData: MedicalRecordFormData & { id?: string } = {
                    id: record.id,
                    
                    //personal details
                    fullName: record.personalDetails.fullName,
                    dateOfBirth: record.personalDetails.dateOfBirth.split('T')[0],
                    gender: record.personalDetails.gender,
                    bloodType: record.personalDetails.bloodType || '',
                    phone: record.personalDetails.phone,
                    email: record.personalDetails.email || '',
                    address: record.personalDetails.address || '',
                    emergencyContact: record.personalDetails.emergencyContact || '',
        
                    //current symptoms
                    chiefComplaint: record.currentSymptoms.chiefComplaint,
                    symptomsDescription: record.currentSymptoms.symptomsDescription,
                    symptomsDuration: record.currentSymptoms.symptomsDuration || '',
                    painScale: record.currentSymptoms.painScale || 0,
        
                    //medical history
                    allergies: record.medicalHistory.allergies || '',
                    chronicConditions: record.medicalHistory.chronicConditions || '',
                    previousSurgeries: record.medicalHistory.previousSurgeries || '',
                    familyHistory: record.medicalHistory.familyHistory || '',
        
                    //growth Milestones
                    height: record.growthMilestones.height || 0,
                    weight: record.growthMilestones.weight || 0,
                    bmi: record.growthMilestones.bmi || '',
                    growthNotes: record.growthMilestones.growthNotes || '',
        
                    //clinical Information
                    diagnosis: record.diagnosis || '',
                    treatmentPlan: record.treatmentPlan || '',
                    prescribedMedications: record.prescribedMedications || '',
                    consultationNotes: record.consultationNotes || '',
                    vaccinationHistory: record.vaccinationHistory || '',
                    followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : undefined
                };
                
                set({ 
                    selectedMedicalRecord: formData, 
                    isModalOpen: true 
                });
            },

            openStatusModal: (record: MedicalRecordFormData) => {
                set({
                    selectedMedicalRecord: record,
                    isStatusModalOpen: true
                });
            },

            openDeleteModal: (record: MedicalRecord) => {
                const patientName = record.personalDetails.fullName || 'Unknown Patient';
                const recordDate = record.dateRecorded;
                
                set({
                    softDeleteMedicalRecordData: {
                        id: record.id,
                        itemName: `${patientName}'s medical record from ${new Date(recordDate).toLocaleDateString()}`,
                        itemType: 'Medical Record'
                    },
                    isDeleteModalOpen: true
                });
            },

            closeUpdateModal: () => {
                set({ isModalOpen: false, selectedMedicalRecord: null });
            },

            closeStatusModal: () => {
                set({ isStatusModalOpen: false, selectedMedicalRecord: null });
            },

            closeDeleteModal: () => {
                set({ isDeleteModalOpen: false, softDeleteMedicalRecordData: null });
            },

            closeDetailsModal: () => {
                set({ showDetails: false, selectedRecord: null });
            },

            
            //utility actions
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentMedicalRecord: () => set({ currentMedicalRecord: null }),
            
            //get status from record
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
            }
        }),
        {
            name: 'medical-record-store'
        }
    )
)