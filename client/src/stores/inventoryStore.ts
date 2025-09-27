import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { InventoryItemFormData, ExtendedInventoryState, OperationType, FetchParams } from '../types'
import { deleteInventoryItem, getInventoryItems, updateInventoryItem, addInventoryItem, getLowStockItems, getExpiringItems } from '../services';
import { toast } from 'sonner';

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
            isModalOpen: false,
            isDeleteModalOpen: false,
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
                        getLowStockItems(10),
                        getExpiringItems(30)
                    ]);

                    const { inventoryItems } = get();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    const recentlyAdded = inventoryItems.filter(item => 
                        new Date(String(item.createdAt)) > thirtyDaysAgo
                    ).length;

                    set({
                        summaryStats: {
                            total: inventoryItems.length,
                            lowStock: lowStockResponse.data.lowStockItems?.length || 0,
                            expiring: expiringResponse.data.expiringItems?.length || 0,
                            recentlyAdded: recentlyAdded
                        }
                    });
                } catch (error) {
                    console.error('Error fetching summary stats:', error);
                    set({ error: 'An error occurred while fetching summary stats' });
                }
            },

            addInventoryItem: async (data: InventoryItemFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'create' });
                    
                    await addInventoryItem(data);
                    
                    toast.success('Item added successfully!');
                    set({ isModalOpen: false, selectedInventoryItem: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    console.error('Error adding inventory item:', error);
                    toast.error('Failed to add inventory item');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            updateInventoryItemData: async (id: string, data: InventoryItemFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updateInventoryItem(id, data);

                    toast.success('Item updated successfully!');
                    set({ 
                        isModalOpen: false, 
                        selectedInventoryItem: null,
                        isRestockMode: false,
                        isAddQuantityMode: false
                    });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500);

                } catch (error) {
                    console.error('Error updating inventory item:', error);
                    toast.error('Failed to update inventory item');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false,
                        currentOperation: null
                    })
                }
            },

            deleteInventoryItem: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteInventoryItem(id);
                    
                    toast.success('Item deleted successfully!');
                    set({ 
                        isDeleteModalOpen: false, 
                        deleteInventoryItemData: null 
                    });

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

            openAddModal: () => {
                set({ 
                    selectedInventoryItem: null,
                    isModalOpen: true,
                    isRestockMode: false,
                    isAddQuantityMode: false
                });
            },

            openUpdateModal: (item: InventoryItemFormData, restockMode: boolean = false, addQuantityMode: boolean = false) => {
                const formData: InventoryItemFormData & { id?: string } = {
                    id: item.id,
                    itemName: item.itemName,
                    category: item.category,
                    price: item.price,
                    quantityInStock: item.quantityInStock,
                    quantityUsed: item.quantityUsed,
                    expiryDate: item.expiryDate.split('T')[0],
                };

                set({ 
                    selectedInventoryItem: formData, 
                    isModalOpen: true,
                    isRestockMode: restockMode,
                    isAddQuantityMode: addQuantityMode
                });
            },

            openDeleteModal: (item: InventoryItemFormData) => {
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
                    isDeleteModalOpen: true
                });
            },

            closeUpdateModal: () => {
                set({ 
                    isModalOpen: false, 
                    selectedInventoryItem: null,
                    isRestockMode: false,
                    isAddQuantityMode: false
                });
            },

            closeDeleteModal: () => {
                set({ 
                    isDeleteModalOpen: false, 
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