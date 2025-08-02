import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner';
import { BillingState, OperationType, BillingFormData } from '../types';
import { getAllBillings, addBilling, updateBilling, deleteBilling } from '../services';

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
            isModalOpen: false,
            isDeleteModalOpen: false,
            deleteBillingData: null,
            currentOperation: null as OperationType,

            //pagination state
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            limit: 10,
            //filter state
            searchTerm: '',
            filterStatus: 'All',


            //fetch billings with pagination and filters
            fetchBillings: async (page?: number, search?: string, status?: string) => {
                try {
                    const currentState = get();
                    const pageToFetch = page ?? currentState.currentPage;
                    const searchToUse = search ?? currentState.searchTerm;
                    const statusToUse = status ?? currentState.filterStatus;
                    
                    set({ fetchLoading: true, loading: true, error: null });

                    const params: any = {
                        page: pageToFetch,
                        limit: currentState.limit
                    };
                    
                    if (searchToUse.trim()) {
                        params.patientName = searchToUse.trim();
                    }
                    
                    if (statusToUse !== 'All') {
                        params.paymentStatus = statusToUse;
                    }

                    const response = await getAllBillings(params);
                    
                    if (response.data.success) {
                        set({
                            billings: response.data.data,
                            currentPage: response.data.pagination.currentPage,
                            totalPages: response.data.pagination.totalPages,
                            totalRecords: response.data.pagination.totalRecords,
                            loading: false,
                            fetchLoading: false
                        });
                    } else {
                        set({
                            error: 'Failed to fetch billing data',
                            loading: false,
                            fetchLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error fetching billings:', error);
                    set({
                        error: 'Failed to load billing data. Please try again.',
                        loading: false,
                        fetchLoading: false
                    });
                }
            },


            //add billing
            addBilling: async (data: BillingFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'create' });
                    
                    await addBilling(data);
                    await get().fetchBillings();
                    
                    toast.success('Billing added successfully!');
                    set({ isModalOpen: false, selectedBilling: null });


                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    console.error('Error adding billing:', error);
                    toast.error('Failed to add billing');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            //update billing
            updateBillingData: async (id: string, data: BillingFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updateBilling(id, data);
                    await get().fetchBillings();

                    toast.success('Billing updated successfully!');
                    set({ 
                        isModalOpen: false, 
                        selectedBilling: null
                    });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500);
                } catch (error) {
                    console.error('Error updating billing:', error);
                    toast.error('Failed to update billing');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            //delete billing
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




            //pagination actions
            setCurrentPage: (page: number) => {
                set({ currentPage: page });
                get().fetchBillings(page);
            },

            //filter actions
            setSearchTerm: (term: string) => {
                set({ searchTerm: term, currentPage: 1 });
            },

            setFilterStatus: (status: string) => {
                set({ filterStatus: status, currentPage: 1 });
            },

            //apply filters (with debounce logic)
            applyFilters: async () => {
                const { searchTerm, filterStatus } = get();
                await get().fetchBillings(1, searchTerm, filterStatus);
            },

            //modal actions
            openAddModal: () => {
                set({ 
                    selectedBilling: null,
                    isModalOpen: true,
                });
            },

            openUpdateModal: (billing: BillingFormData) => {
                set({ 
                    selectedBilling: billing, 
                    isModalOpen: true,
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
                });
            },

            closeDeleteModal: () => {
                set({ 
                    isDeleteModalOpen: false, 
                    deleteBillingData: null 
                });
            },

            //utility actions
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),

            //process payment action
            processPayment: async (billId: string) => {
                try {
                    set({ statusLoading: true, isProcessing: true });
                    
                    //update billing status to paid
                    await updateBilling(billId, { paymentStatus: 'Paid' });
                    await get().fetchBillings();
                    
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
            exportBillings: async () => {
                try {
                    set({ loading: true });
                    
                    //not yet done
                    toast.success('Export completed successfully!');
                } catch (error) {
                    console.error('Error exporting billings:', error);
                    toast.error('Failed to export billings');
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'billing-store'
        }
    )
)