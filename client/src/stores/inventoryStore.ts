import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { InventoryItemFormData, ExtendedInventoryState, OperationType } from '../types'
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

            //fetch inventory items
            // fetchInventoryItems: async () => {
            //     try {
            //         set({ fetchLoading: true, loading: true, error: null });

            //         const response = await getInventoryItems();
            //         const inventoryItems = response.data.inventoryItems || [];

            //         set({ 
            //             inventoryItems,
            //             loading: false 
            //         });

            //         await get().fetchSummaryStats();
                    
            //     } catch (error) {
            //         console.error('Error fetching inventory items:', error);
            //         set({ 
            //             error: 'An error occurred while fetching items', 
            //             loading: false 
            //         });
            //     }
            // },
            fetchInventoryItems: async (params = {}) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });

                    const response = await getInventoryItems(params);
                    const inventoryItems = response.data.inventoryItems || [];
                    const pagination = response.data.pagination || {};

                    set({ 
                        inventoryItems,
                        loading: false,
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

                    //only fetch summary stats if no search term (to get overall stats)
                    if (!params.search) {
                        await get().fetchSummaryStats();
                    }
                    
                } catch (error) {
                    console.error('Error fetching inventory items:', error);
                    set({ 
                        error: 'An error occurred while fetching items', 
                        loading: false 
                    });
                }
            },

            //fetch summary stats
            fetchSummaryStats: async () => {
                try {
                    const { inventoryItems } = get();
                    
                    const [lowStockResponse, expiringResponse] = await Promise.all([
                        getLowStockItems(10),
                        getExpiringItems(30)
                    ]);

                    //calculate recently added (items added in the last 30 days)
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

            //add inventory item
            addInventoryItem: async (data: InventoryItemFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'create' });
                    
                    await addInventoryItem(data);
                    await get().fetchInventoryItems();
                    
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

            //update inventory item
            updateInventoryItemData: async (id: string, data: InventoryItemFormData) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updateInventoryItem(id, data);
                    await get().fetchInventoryItems();

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

            //delete inventory item
            deleteInventoryItem: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteInventoryItem(id);
                    await get().fetchInventoryItems();
                    
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


            
            //modal actions
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

            //utility actions
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
        }),
        {
            name: 'inventory-store' //for Redux DevTools
        }
    )

)