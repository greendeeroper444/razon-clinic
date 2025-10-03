import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { getUsers, getUserById, archiveUser, unarchiveUser, archiveMultipleUsers, unarchiveMultipleUsers } from '../services'
import { FetchParams, OperationType, UserManagementState } from '../types'

export const useUserManagementStore = create<UserManagementState>()(
    devtools(
        (set, get) => ({
            users: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            error: null,
            isProcessing: false,
            selectedUser: null,
            currentUser: null,
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
            summaryStats: {
                total: 0,
                active: 0,
                archived: 0,
                thisMonth: 0
            },
            selectedUserIds: [],
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            activeTab: 'all' as const,
            currentOperation: null as OperationType,

            fetchSummaryStats: async () => {
                try {
                    const [allResponse, activeResponse, archivedResponse] = await Promise.all([
                        getUsers({ page: 1, limit: 1 }),
                        getUsers({ page: 1, limit: 1, isArchived: false }),
                        getUsers({ page: 1, limit: 1, isArchived: true })
                    ])

                    const thisMonthResponse = await getUsers({ 
                        page: 1, 
                        limit: 1000,
                    })

                    const currentDate = new Date()
                    const currentMonth = currentDate.getMonth()
                    const currentYear = currentDate.getFullYear()

                    const thisMonth = thisMonthResponse.data.users.filter((user: { createdAt?: string }) => {
                        if (!user.createdAt) return false
                        const userDate = new Date(user.createdAt)
                        return userDate.getMonth() === currentMonth && 
                            userDate.getFullYear() === currentYear
                    }).length

                    set({
                        summaryStats: {
                            total: allResponse.data.pagination.totalItems,
                            active: activeResponse.data.pagination.totalItems,
                            archived: archivedResponse.data.pagination.totalItems,
                            thisMonth
                        }
                    })
                } catch (error) {
                    console.error('Error fetching user summary stats:', error)
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
                        
                        if (!params.search && params.page === 1) {
                            get().fetchSummaryStats()
                        }
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
                            currentUser: response.data,
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
                        
                        const { pagination, searchQuery } = get()
                        await get().fetchUsers({ 
                            page: pagination?.currentPage, 
                            limit: pagination?.itemsPerPage,
                            search: searchQuery 
                        })
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
                        
                        const { pagination, searchQuery } = get()
                        await get().fetchUsers({ 
                            page: pagination?.currentPage, 
                            limit: pagination?.itemsPerPage,
                            search: searchQuery 
                        })
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
                            const { pagination, searchQuery } = get()
                            await get().fetchUsers({ 
                                page: pagination?.currentPage, 
                                limit: pagination?.itemsPerPage,
                                search: searchQuery 
                            })
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
                            const { pagination, searchQuery } = get()
                            await get().fetchUsers({ 
                                page: pagination?.currentPage, 
                                limit: pagination?.itemsPerPage,
                                search: searchQuery 
                            })
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
                const { selectedUserIds, summaryStats } = get()
                
                return {
                    totalUsers: summaryStats.total,
                    activeUsers: summaryStats.active,
                    archivedUsers: summaryStats.archived,
                    selected: selectedUserIds.length
                }
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentUser: () => set({ currentUser: null })
        }),
        {
            name: 'user-management-store'
        }
    )
)