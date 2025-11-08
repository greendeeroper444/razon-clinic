import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { getDeletedMedicalRecords, restoreMedicalRecord, bulkRestoreMedicalRecords, bulkPermanentDeleteMedicalRecords } from '../services/trashService'
import { TrashState } from '../types'

export const useTrashStore = create<TrashState>()(
    devtools(
        (set, get) => ({
            deletedRecords: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            error: null,
            isProcessing: false,
            selectedRecordIds: [],
            currentOperation: null,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: 1,
                endIndex: 0
            },
            activeTab: 'medical-records',

            fetchDeletedRecords: async (page = 1, limit = 10) => {
                const currentState = get()
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...')
                    return
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null })

                    const response = await getDeletedMedicalRecords({ page, limit })
                    const deletedRecords = response.data.medicalRecords || []
                    const pagination = response.data.pagination || {}

                    set({ 
                        deletedRecords,
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
                            endIndex: pagination.endIndex || 0
                        }
                    })
                } catch (error) {
                    console.error('Error fetching deleted records:', error)
                    set({ 
                        error: 'An error occurred while fetching deleted records', 
                        loading: false,
                        fetchLoading: false
                    })
                }
            },

            restoreSingleRecord: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'restore' })
                    
                    await restoreMedicalRecord(id)
                    
                    toast.success('Record restored successfully!')
                    
                    //refresh the list
                    const { pagination } = get()
                    await get().fetchDeletedRecords(pagination.currentPage, pagination.itemsPerPage)

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                } catch (error) {
                    console.error('Error restoring record:', error)
                    toast.error('Failed to restore record')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            bulkRestore: async () => {
                const { selectedRecordIds, pagination } = get()
                
                if (selectedRecordIds.length === 0) {
                    toast.error('No records selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'restore' })
                    
                    await bulkRestoreMedicalRecords(selectedRecordIds)
                    
                    toast.success(`${selectedRecordIds.length} record(s) restored successfully!`)
                    
                    //clear selection and refresh
                    set({ selectedRecordIds: [] })
                    await get().fetchDeletedRecords(pagination.currentPage, pagination.itemsPerPage)

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                } catch (error) {
                    console.error('Error bulk restoring records:', error)
                    toast.error('Failed to restore records')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            bulkPermanentDelete: async () => {
                const { selectedRecordIds, pagination } = get()
                
                if (selectedRecordIds.length === 0) {
                    toast.error('No records selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' })
                    
                    await bulkPermanentDeleteMedicalRecords(selectedRecordIds)
                    
                    toast.success(`${selectedRecordIds.length} record(s) permanently deleted!`)
                    
                    //clear selection and refresh
                    set({ selectedRecordIds: [] })
                    await get().fetchDeletedRecords(pagination.currentPage, pagination.itemsPerPage)

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                } catch (error) {
                    console.error('Error bulk deleting records:', error)
                    toast.error('Failed to permanently delete records')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            toggleRecordSelection: (id: string) => {
                const { selectedRecordIds } = get()
                const newSelection = selectedRecordIds.includes(id)
                    ? selectedRecordIds.filter(selectedId => selectedId !== id)
                    : [...selectedRecordIds, id]
                
                set({ selectedRecordIds: newSelection })
            },

            toggleSelectAll: () => {
                const { deletedRecords, selectedRecordIds } = get()
                const allSelected = selectedRecordIds.length === deletedRecords.length && deletedRecords.length > 0
                
                set({ 
                    selectedRecordIds: allSelected ? [] : deletedRecords.map(record => record.id)
                })
            },

            setActiveTab: (tab: 'medical-records') => {
                set({ activeTab: tab, selectedRecordIds: [] })
            },

            clearSelection: () => {
                set({ selectedRecordIds: [] })
            }
        }),
        {
            name: 'trash-store'
        }
    )
)