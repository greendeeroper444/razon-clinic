import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { 
    getUsers, 
    getUserById, 
    archiveUser, 
    unarchiveUser, 
    archiveMultipleUsers, 
    unarchiveMultipleUsers 
} from '../services'

interface User {
    id: string
    firstName: string
    lastName: string
    userNumber: string
    email: string
    contactNumber: string
    lastActiveAt: string
    createdAt: string
    isArchived: boolean
    archivedAt?: string
    archivedBy?: {
        id: string
        firstName: string
        lastName: string
    }
}

interface Pagination {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    startIndex: number
    endIndex: number
    isUnlimited: boolean
    nextPage: number | null
    previousPage: number | null
    remainingItems: number
    searchTerm: string | null
}

interface TotalCounts {
    allUsers: number
    activeUsers: number
    archivedUsers: number
}

type OperationType = 'archive' | 'unarchive' | 'archiveMultiple' | 'unarchiveMultiple' | null

interface UserManagementState {
    // Data
    users: User[]
    selectedUser: User | null
    pagination: Pagination | null
    totalCounts: TotalCounts
    
    // UI State
    selectedUserIds: string[]
    searchQuery: string
    currentPage: number
    itemsPerPage: number
    loading: boolean
    fetchLoading: boolean
    submitLoading: boolean
    isProcessing: boolean
    activeTab: 'all' | 'active' | 'archive'
    currentOperation: OperationType
    error: string | null
    
    // Actions
    fetchUsers: (params?: any) => Promise<void>
    fetchTotalCounts: () => Promise<void>
    fetchUserById: (userId: string) => Promise<void>
    setSearchQuery: (query: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void
    setActiveTab: (tab: 'all' | 'active' | 'archive') => void
    
    // Selection
    toggleUserSelection: (userId: string) => void
    toggleSelectAll: () => void
    clearSelection: () => void
    
    // Archive Actions
    archiveSingleUser: (userId: string) => Promise<void>
    unarchiveSingleUser: (userId: string) => Promise<void>
    archiveSelectedUsers: () => Promise<void>
    unarchiveSelectedUsers: () => Promise<void>
    
    // Helpers
    getFilteredUsers: () => User[]
    getStats: () => {
        totalUsers: number
        activeUsers: number
        archivedUsers: number
        selected: number
    }
    
    // Utility
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    resetStore: () => void
}

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

            // Fetch total counts for all categories
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

            // Fetch users with filters
            fetchUsers: async (overrideParams = {}) => {
                const currentState = get()
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...')
                    return
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null })
                    
                    const { activeTab, currentPage, searchQuery, itemsPerPage } = get()
                    
                    const queryParams = {
                        page: overrideParams.page !== undefined ? overrideParams.page : currentPage,
                        limit: overrideParams.limit !== undefined ? overrideParams.limit : itemsPerPage,
                        search: overrideParams.search !== undefined ? overrideParams.search : searchQuery,
                    }

                    if (overrideParams.search !== undefined) {
                        set({ searchQuery: overrideParams.search, currentPage: 1 })
                    }
                    if (overrideParams.limit !== undefined) {
                        set({ itemsPerPage: overrideParams.limit, currentPage: 1 })
                    }
                    if (overrideParams.page !== undefined) {
                        set({ currentPage: overrideParams.page })
                    }

                    if (activeTab === 'archive') {
                        queryParams.isArchived = true
                    } else if (activeTab === 'active') {
                        queryParams.isArchived = false
                    }

                    const response = await getUsers(queryParams)
                    
                    if (response.success) {
                        set({ 
                            users: response.data.users,
                            pagination: response.data.pagination,
                            fetchLoading: false,
                            loading: false
                        })
                        
                        get().fetchTotalCounts()
                    }
                } catch (error) {
                    console.error('Error fetching users:', error)
                    set({ 
                        fetchLoading: false, 
                        loading: false,
                        error: 'Failed to fetch users'
                    })
                    toast.error('Failed to fetch users')
                }
            },

            // Fetch single user
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

            // Archive single user
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

            // Unarchive single user
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

            // Archive selected users
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

            // Unarchive selected users
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