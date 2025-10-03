import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { getUsers, getUserById, archiveUser, unarchiveUser, archiveMultipleUsers, unarchiveMultipleUsers } from '../services'
import { FetchParams, OperationType, UserManagementState } from '../types'

const initialState = {
    users: [],
    loading: false,
    fetchLoading: false,
    submitLoading: false,
    error: null,
    isProcessing: false,
    selectedUser: null,
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
    totalCounts: {
        allUsers: 0,
        activeUsers: 0,
        archivedUsers: 0
    },
    selectedUserIds: [],
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 10,
    activeTab: 'all' as const,
    currentOperation: null as OperationType
}

export const useUserManagementStore = create<UserManagementState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            fetchTotalCounts: async () => {
                try {
                    const [allResponse, activeResponse, archivedResponse] = await Promise.all([
                        getUsers({ page: 1, limit: 1 }),
                        getUsers({ page: 1, limit: 1, isArchived: false }),
                        getUsers({ page: 1, limit: 1, isArchived: true })
                    ])

                    set({
                        totalCounts: {
                            allUsers: allResponse.data.pagination.totalItems,
                            activeUsers: activeResponse.data.pagination.totalItems,
                            archivedUsers: archivedResponse.data.pagination.totalItems
                        }
                    })
                } catch (error) {
                    console.error('Error fetching total counts:', error)
                }
            },

            fetchUsers: async (params: FetchParams) => {
                const currentState = get()
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...')
                    return
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null })
                    
                    const { activeTab } = get()
                    
                    const queryParams = { ...params }

                    if (activeTab === 'archive') {
                        queryParams.isArchived = true
                    } else if (activeTab === 'active') {
                        queryParams.isArchived = false
                    }

                    const response = await getUsers(queryParams)
                    
                    if (response.success) {
                        const users = response.data.users || []
                        const pagination = response.data.pagination || {}

                        set({ 
                            users,
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
                            loading: false
                        })
                        
                        // if (!params.search && params.page === 1) {
                        //     get().fetchTotalCounts()
                        // }
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch users',
                            fetchLoading: false,
                            loading: false
                        })
                    }
                } catch (error) {
                    console.error('Error fetching users:', error)
                    set({ 
                        error: 'An error occurred while fetching users',
                        fetchLoading: false, 
                        loading: false
                    })
                    toast.error('Failed to fetch users')
                }
            },

            fetchUserById: async (userId: string) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null })
                    
                    const response = await getUserById(userId)
                    
                    if (response.success) {
                        set({ 
                            selectedUser: response.data.user,
                            fetchLoading: false,
                            loading: false
                        })
                    }
                } catch (error) {
                    console.error('Error fetching user:', error)
                    set({ 
                        fetchLoading: false, 
                        loading: false,
                        error: 'Failed to fetch user details'
                    })
                    toast.error('Failed to fetch user details')
                }
            },

            setSearchQuery: (query: string) => {
                set({ searchQuery: query, currentPage: 1 })
            },

            setCurrentPage: (page: number) => {
                set({ currentPage: page, selectedUserIds: [] })
            },

            setItemsPerPage: (items: number) => {
                set({ itemsPerPage: items, currentPage: 1, selectedUserIds: [] })
            },

            setActiveTab: (tab) => {
                set({ 
                    activeTab: tab, 
                    currentPage: 1, 
                    selectedUserIds: [],
                    searchQuery: ''
                })
            },

            toggleUserSelection: (userId: string) => {
                set((state) => ({
                    selectedUserIds: state.selectedUserIds.includes(userId)
                        ? state.selectedUserIds.filter(id => id !== userId)
                        : [...state.selectedUserIds, userId]
                }))
            },

            toggleSelectAll: () => {
                const { users, selectedUserIds } = get()
                
                if (selectedUserIds.length === users.length && users.length > 0) {
                    set({ selectedUserIds: [] })
                } else {
                    set({ selectedUserIds: users.map(u => u.id) })
                }
            },

            clearSelection: () => {
                set({ selectedUserIds: [] })
            },

            
            archiveSingleUser: async (userId: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'archive' })
                    
                    const response = await archiveUser(userId)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        await get().fetchUsers()
                        get().clearSelection()

                        setTimeout(() => {
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 500)
                    }
                } catch (error) {
                    console.error('Error archiving user:', error)
                    toast.error('Failed to archive user')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            unarchiveSingleUser: async (userId: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'unarchive' })
                    
                    const response = await unarchiveUser(userId)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        await get().fetchUsers()
                        get().clearSelection()

                        setTimeout(() => {
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 500)
                    }
                } catch (error) {
                    console.error('Error unarchiving user:', error)
                    toast.error('Failed to unarchive user')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            archiveSelectedUsers: async () => {
                const { selectedUserIds } = get()
                
                if (selectedUserIds.length === 0) {
                    toast.warning('No users selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'archiveMultiple' })
                    
                    const response = await archiveMultipleUsers(selectedUserIds)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        setTimeout(async () => {
                            await get().fetchUsers()
                            get().clearSelection()
                            
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 600)
                    }
                } catch (error) {
                    console.error('Error archiving users:', error)
                    toast.error('Failed to archive users')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            unarchiveSelectedUsers: async () => {
                const { selectedUserIds } = get()
                
                if (selectedUserIds.length === 0) {
                    toast.warning('No users selected')
                    return
                }

                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'unarchiveMultiple' })
                    
                    const response = await unarchiveMultipleUsers(selectedUserIds)
                    
                    if (response.success) {
                        toast.success(response.message)
                        
                        setTimeout(async () => {
                            await get().fetchUsers()
                            get().clearSelection()
                            
                            set({ 
                                submitLoading: false, 
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 600)
                    }
                } catch (error) {
                    console.error('Error unarchiving users:', error)
                    toast.error('Failed to unarchive users')
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    })
                }
            },

            getFilteredUsers: () => {
                const { users } = get()
                return users
            },

            getStats: () => {
                const { selectedUserIds, totalCounts } = get()
                
                return {
                    totalUsers: totalCounts.allUsers,
                    activeUsers: totalCounts.activeUsers,
                    archivedUsers: totalCounts.archivedUsers,
                    selected: selectedUserIds.length
                }
            },

            resetStore: () => {
                set(initialState)
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error })
        }),
        {
            name: 'user-management-store'
        }
    )
)