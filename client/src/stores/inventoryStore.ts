import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { InventoryItemFormData, ExtendedInventoryState, OperationType, FetchParams } from '../types'
import { deleteInventoryItem, getInventoryItems, updateInventoryItem, addInventoryItem, getLowStockItems, getExpiringItems } from '../services';
import { toast } from 'sonner';
import { handleStoreError } from '../utils';

export const useInventoryStore = create<ExtendedInventoryState>()(
    devtools(
        (set, get) => ({
            inventoryItems: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedInventoryItem: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalDeleteOpen: false,
            deleteInventoryItemData: null,
            summaryStats: {
                total: 0,
                lowStock: 0,
                expiring: 0,
                recentlyAdded: 0
            },
            isRestockMode: false,
            isAddQuantityMode: false,
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

            addInventoryItem: async (data: InventoryItemFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addInventoryItem(data);
                    
                    toast.success('Item added successfully!');

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
                        defaultMessage: 'Failed to add inventory item'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },


            fetchInventoryItems: async (params: FetchParams) => {
                const currentState = get();
                
                //prevent multiple simultaneous fetches
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getInventoryItems(params);
                    const inventoryItems = response.data.inventoryItems || [];
                    const pagination = response.data.pagination || {};

                    set({ 
                        inventoryItems,
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

                    //only fetch summary stats on initial load or non-search requests
                    if (!params.search && params.page === 1) {
                        get().fetchSummaryStats();
                    }
                    
                } catch (error) {
                    console.error('Error fetching inventory items:', error);
                    set({ 
                        error: 'An error occurred while fetching items', 
                        loading: false,
                        fetchLoading: false
                    });
                }
            },

            fetchSummaryStats: async () => {
                try {
                    const [lowStockResponse, expiringResponse] = await Promise.all([
                        getLowStockItems(50),
                        getExpiringItems(30)
                    ]);

                    const { pagination } = get();

                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    set({
                        summaryStats: {
                            total: pagination.totalItems,
                            lowStock: lowStockResponse.data?.length || 0,
                            expiring: expiringResponse.data?.length || 0,
                            recentlyAdded: get().inventoryItems.filter(item =>
                                new Date(String(item.createdAt)) > thirtyDaysAgo
                            ).length
                        }
                    });
                } catch (error) {
                    console.error('Error fetching summary stats:', error);
                    set({ error: 'An error occurred while fetching summary stats' });
                }
            },

            updateInventoryItemData: async (id: string, data: InventoryItemFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updateInventoryItem(id, data);

                    toast.success('Item updated successfully!');
                    set({ isModalUpdateOpen: false, selectedInventoryItem: null });

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
                        defaultMessage: 'Failed to update inventory item'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            deleteInventoryItem: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteInventoryItem(id);
                    await get().fetchInventoryItems({});
                    
                    toast.success('Item deleted successfully!');
                    set({ isModalDeleteOpen: false, deleteInventoryItemData: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)
                    
                } catch (error) {
                    console.error('Error deleting inventory item:', error);
                    toast.error('Failed to delete inventory item');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
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
                    selectedInventoryItem: null,
                    isModalUpdateOpen: true,
                    isRestockMode: false,
                    isAddQuantityMode: false,
                    validationErrors: {}
                });
            },

            openModalUpdate: (item: InventoryItemFormData, restockMode: boolean = false, addQuantityMode: boolean = false) => {
                const formData: InventoryItemFormData & { id?: string } = {
                    id: item.id,
                    itemName: item.itemName,
                    category: item.category,
                    price: item.price,
                    quantityInStock: item.quantityInStock,
                    quantityUsed: item.quantityUsed,
                    expiryDate: item.expiryDate.split('T')[0],
                    createdAt: new Date().toISOString(),
                };

                set({ 
                    selectedInventoryItem: formData, 
                    isModalUpdateOpen: true,
                    isRestockMode: restockMode,
                    isAddQuantityMode: addQuantityMode,
                    validationErrors: {}
                });
            },

            openModalDelete: (item: InventoryItemFormData) => {
                if (!item.id) {
                    console.error('Item ID is missing:', item);
                    return;
                }
                
                set({
                    deleteInventoryItemData: {
                        id: item.id,
                        itemName: String(item.itemName),
                        itemType: 'Inventory Item'
                    },
                    isModalDeleteOpen: true
                });
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedInventoryItem: null,
                    validationErrors: {}
                });
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedInventoryItem: null,
                    isRestockMode: false,
                    isAddQuantityMode: false,
                    validationErrors: {}
                });
            },

            closeModalDelete: () => {
                set({ 
                    isModalDeleteOpen: false, 
                    deleteInventoryItemData: null 
                });
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
        }),
        {
            name: 'inventory-store'
        }
    )

)