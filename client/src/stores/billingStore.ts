import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner';
import { BillingState, OperationType, BillingFormData, FetchParams } from '../types';
import { getBillings, addBilling, updateBilling, deleteBilling, getBillingById, exportBillings } from '../services';
import { handleStoreError } from '../utils';

export const useBillingStore = create<BillingState>()(
    devtools(
        (set, get) => ({
            billings: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false,
            error: null,
            isProcessing: false,
            selectedBilling: null,
            summaryStats: {
                totalRevenue: 0,
                paidAmount: 0,
                unpaidAmount: 0,
                totalBillings: 0
            },
            isModalOpen: false,
            isDeleteModalOpen: false,
            deleteBillingData: null,
            currentBilling: null,
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

            addBilling: async (data: BillingFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addBilling(data);
                    await get().fetchBillings();
                    
                    toast.success('Billing added successfully!');

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
                        defaultMessage: 'Failed to add billing'
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
                    const { billings } = get();
                    
                    const totalRevenue = billings.reduce((sum, bill) => sum + (bill.amount || 0), 0);
                    const paidAmount = billings.filter(bill => bill.paymentStatus === 'Paid')
                        .reduce((sum, bill) => sum + (bill.amount || 0), 0);
                    const unpaidAmount = billings.filter(bill => bill.paymentStatus === 'Unpaid')
                        .reduce((sum, bill) => sum + (bill.amount || 0), 0);
                    const totalBillings = billings.length;

                    set({
                        summaryStats: {
                            totalRevenue,
                            paidAmount,
                            unpaidAmount,
                            totalBillings
                        }
                    });
                } catch (error) {
                    console.error('Error fetching billing summary stats:', error);
                    set({ error: 'An error occurred while fetching summary stats' });
                }
            },

            fetchBillings: async (params: FetchParams) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null,});

                    const response = await getBillings(params);
                    
                    if (response.success) {
                        const billings = response.data.billings || [];
                        const pagination = response.data.pagination || {};
                        
                        set({
                            billings,
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
                    } else {
                        set({
                             error: response.message || 'Failed to fetch billings',
                            loading: false,
                            fetchLoading: false
                        });
                    }

                    if (!params.search && params.page === 1) {
                        get().fetchSummaryStats();
                    }
                    
                } catch (error) {
                    console.error('Error fetching appointments:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching billings', 
                        loading: false 
                    });
                }
            },

            fetchBillingById: async (billingId: string) => {
                try {
                    set({ fetchLoading: true, error: null });
                    
                    const response = await getBillingById(billingId);
                    
                    if (response.success) {
                        set({ 
                            currentBilling: response.data,
                            fetchLoading: false,
                            error: null
                        });
                    } else {
                        set({ 
                            error: 'Failed to load billing details', 
                            fetchLoading: false,
                            currentBilling: null
                        });
                    }
                } catch (error) {
                    console.error('Error fetching billing:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching billing', 
                        currentBilling: null
                    });
                }
            },

            updateBillingData: async (id: string, data: BillingFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updateBilling(id, data);
                    await get().fetchBillings();

                    toast.success('Billing updated successfully!');

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
                        defaultMessage: 'Failed to update billing'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            deleteBilling: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteBilling(id);
                    await get().fetchBillings();
                    
                    toast.success('Billing deleted successfully!');
                    set({ 
                        isDeleteModalOpen: false, 
                        deleteBillingData: null 
                    });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                    
                } catch (error) {
                    console.error('Error deleting billing:', error);
                    toast.error('Failed to delete billing');
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
                    selectedBilling: null,
                    isModalOpen: true,
                    validationErrors: {}
                });
            },

            openUpdateModal: (billing: BillingFormData) => {
                set({ 
                    selectedBilling: billing, 
                    isModalOpen: true,
                    validationErrors: {}
                });
            },

            openDeleteModal: (billing: BillingFormData) => {
                if (!billing.id) {
                    console.error('Billing ID is missing:', billing);
                    return;
                }
                
                set({
                    deleteBillingData: {
                        id: billing.id,
                        itemName: billing.patientName || 'Unknown Patient',
                        itemType: 'Billing'
                    },
                    isDeleteModalOpen: true
                });
            },

            closeUpdateModal: () => {
                set({ 
                    isModalOpen: false, 
                    selectedBilling: null,
                    validationErrors: {}
                });
            },

            closeDeleteModal: () => {
                set({ 
                    isDeleteModalOpen: false, 
                    deleteBillingData: null 
                });
            },

            //process payment action
            processPayment: async (billId: string) => {
                try {
                    set({ statusLoading: true, isProcessing: true });
                    
                    
                    await updateBilling(billId, { paymentStatus: 'Paid' });
                    
                    await get().fetchBillings({});
                    
                    toast.success('Payment processed successfully!');
                    
                    setTimeout(() => {
                        set({ 
                            statusLoading: false,
                            isProcessing: false
                        })
                    }, 500);
                } catch (error) {
                    console.error('Error processing payment:', error);
                    toast.error('Failed to process payment');
                    set({ 
                        statusLoading: false,
                        isProcessing: false
                    });
                }
            },

            //export billings
            exportBillings: async (format: 'csv' | 'xlsx' | 'json' = 'xlsx') => {
                try {
                    set({ loading: true });
                    
                    //export all data without any filters
                    const exportParams = {
                        format
                    };

                    const result = await exportBillings(exportParams);
                    
                    if (result.success) {
                        toast.success('Export completed successfully!', {
                            description: `Downloaded: ${result.filename}`
                        });
                    }
                } catch (error) {
                    console.error('Error exporting billings:', error);
                    toast.error('Failed to export billings', {
                        description: error instanceof Error ? error.message : 'An error occurred'
                    });
                } finally {
                    set({ loading: false });
                }
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentBilling: () => set({ currentBilling: null })
        }),
        {
            name: 'billing-store'
        }
    )
)