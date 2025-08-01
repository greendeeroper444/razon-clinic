import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MedicalRecordFormData, OperationType, MedicalRecord, ExtendedMedicalRecordState, Patient } from '../types'
import { deleteMedicalRecord, getMedicalRecordById, getMedicalRecords, updateMedicalRecord, addMedicalRecord } from '../services';
import { toast } from 'sonner';

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
            deleteMedicalRecordData: null,
            currentMedicalRecord: null,
            viewMode: 'user' as 'admin' | 'user',
            currentOperation: null as OperationType,
                
            //state for pagination and search
            searchTerm: '',
            currentPage: 1,
            recordsPerPage: 10,
            pagination: null,
            showDetails: false,
            selectedRecord: null,

            //fetch all medical records with pagination and search
            fetchMedicalRecords: async (page?: number, search?: string) => {
                try {
                    const currentState = get();
                    const pageToFetch = page ?? currentState.currentPage;
                    const searchToUse = search ?? currentState.searchTerm;
                    
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getMedicalRecords(pageToFetch, currentState.recordsPerPage, searchToUse);
                    
                    if (response.success) {
                        //extract unique patients from medical records for the modal dropdown
                        const uniquePatients = Array.from(
                            new Map(
                                response.data
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
                            medicalRecords: response.data,
                            patients: uniquePatients as Patient[],
                            pagination: response.pagination,
                            currentPage: pageToFetch,
                            searchTerm: searchToUse,
                            fetchLoading: false,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({ 
                            error: 'Failed to fetch medical records', 
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

            //fetch medical record by ID for details page
            fetchMedicalRecordById: async (medicalRecordId: string) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getMedicalRecordById(medicalRecordId);
                    
                    if (response.success) {
                        set({ 
                            currentMedicalRecord: response.data,
                            selectedRecord: response.data,
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
                    toast.error('Failed to create medical record');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false, 
                        selectedMedicalRecord: null,
                        currentOperation: null
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
            deleteMedicalRecord: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteMedicalRecord(id);
                    
                    await get().fetchMedicalRecords();
                    
                    toast.success('Medical record deleted successfully!');

                    set({ 
                        isDeleteModalOpen: false, 
                        deleteMedicalRecordData: null 
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
                        deleteMedicalRecordData: null,
                        currentOperation: null
                    });
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
                    deleteMedicalRecordData: {
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
                set({ isDeleteModalOpen: false, deleteMedicalRecordData: null });
            },

            closeDetailsModal: () => {
                set({ showDetails: false, selectedRecord: null });
            },

            //search and pagination actions
            setSearchTerm: (searchTerm: string) => {
                set({ searchTerm });
                //reset to first page when searching
                get().setCurrentPage(1);
                //fetch with new search term
                get().fetchMedicalRecords(1, searchTerm);
            },

            setCurrentPage: (page: number) => {
                set({ currentPage: page });
            },

            handlePageChange: (newPage: number) => {
                set({ currentPage: newPage });
                get().fetchMedicalRecords(newPage);
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