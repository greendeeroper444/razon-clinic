import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BlockedTimeSlotFormData, BlockedTimeSlotState, BlockedTimeSlotOperationType, BlockedTimeSlotFetchParams } from '../types';
import { deleteBlockedTimeSlot, getBlockedTimeSlots, updateBlockedTimeSlot, addBlockedTimeSlot } from '../services';
import { toast } from 'sonner';
import { handleStoreError } from '../utils';

export const useBlockedTimeSlotStore = create<BlockedTimeSlotState>()(
    devtools(
        (set, get) => ({
            blockedTimeSlots: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            error: null,
            isProcessing: false,
            selectedBlockedTimeSlot: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalDeleteOpen: false,
            deleteBlockedTimeSlotData: null,
            summaryStats: {
                totalActiveBlocks: 0,
                upcomingBlocksCount: 0,
                blocksByReason: []
            },
            currentOperation: null as BlockedTimeSlotOperationType,
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

            addBlockedTimeSlot: async (data: BlockedTimeSlotFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addBlockedTimeSlot(data);
                    
                    toast.success('Blocked time slot created successfully!');

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
                        defaultMessage: 'Failed to create blocked time slot'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            fetchBlockedTimeSlots: async (params: BlockedTimeSlotFetchParams) => {
                const currentState = get();
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getBlockedTimeSlots(params);
                    const blockedTimeSlots = response.data.blockedTimeSlots || [];
                    const pagination = response.data.pagination || {};

                    set({ 
                        blockedTimeSlots,
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

                } catch (error) {
                    console.error('Error fetching blocked time slots:', error);
                    set({ 
                        error: 'An error occurred while fetching blocked time slots', 
                        loading: false,
                        fetchLoading: false
                    });
                }
            },

            updateBlockedTimeSlotData: async (id: string, data: BlockedTimeSlotFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updateBlockedTimeSlot(id, data);

                    toast.success('Blocked time slot updated successfully!');
                    set({ isModalUpdateOpen: false, selectedBlockedTimeSlot: null });

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
                        defaultMessage: 'Failed to update blocked time slot'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            deleteBlockedTimeSlot: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteBlockedTimeSlot(id);
                    await get().fetchBlockedTimeSlots({});
                    
                    toast.success('Blocked time slot deleted successfully!');
                    set({ isModalDeleteOpen: false, deleteBlockedTimeSlotData: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);
                    
                } catch (error) {
                    console.error('Error deleting blocked time slot:', error);
                    toast.error('Failed to delete blocked time slot');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });
                }
            },

            openModalCreate: () => {
                set({ 
                    isModalCreateOpen: true,
                    validationErrors: {}
                });
            },

            openModalUpdate: (item: BlockedTimeSlotFormData) => {
                const formData: BlockedTimeSlotFormData & { id?: string } = {
                    id: item.id,
                    startDate: item.startDate.split('T')[0],
                    endDate: item.endDate.split('T')[0],
                    startTime: item.startTime,
                    endTime: item.endTime,
                    reason: item.reason,
                    customReason: item.customReason
                };

                set({ 
                    selectedBlockedTimeSlot: formData, 
                    isModalUpdateOpen: true,
                    validationErrors: {}
                });
            },

            openModalDelete: (item: BlockedTimeSlotFormData) => {
                if (!item.id) {
                    console.error('Item ID is missing:', item);
                    return;
                }
                
                const dateRange = item.startDate === item.endDate 
                    ? item.startDate 
                    : `${item.startDate} to ${item.endDate}`;
                
                const timeRange = `${item.startTime} - ${item.endTime}`;
                
                set({
                    deleteBlockedTimeSlotData: {
                        id: item.id,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        dateRange: dateRange,
                        timeRange: timeRange,
                        reason: item.reason,
                        itemType: 'Blocked Time Slot'
                    },
                    isModalDeleteOpen: true
                });
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedBlockedTimeSlot: null,
                    validationErrors: {}
                });
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedBlockedTimeSlot: null,
                    validationErrors: {}
                });
            },

            closeModalDelete: () => {
                set({ 
                    isModalDeleteOpen: false, 
                    deleteBlockedTimeSlotData: null 
                });
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
        }),
        {
            name: 'blocked-timeslot-store'
        }
    )
);