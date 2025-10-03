import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './UserManagementPage.module.css'
import { useUserManagementStore } from '../../../stores/userManagementStore'
import { Header, Loading, Main, Pagination, Searchbar, SubmitLoading, Table } from '../../../components'
import { formatDate, getLoadingText, getStatusClass } from '../../../utils'
import { getUserSummaryCards } from '../../../config/userSummaryCards'
import { TableColumn, User } from '../../../types'
import { PersonStanding } from 'lucide-react'

const UserManagementPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    
    const {
        users,
        loading,
        submitLoading,
        error,
        pagination: storePagination,
        selectedUserIds,
        currentPage,
        activeTab,
        fetchUsers,
        summaryStats,
        isProcessing,
        currentOperation,
        setActiveTab,
        toggleUserSelection,
        toggleSelectAll,
        archiveSelectedUsers,
        unarchiveSelectedUsers,
        getStats
    } = useUserManagementStore()

    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchUsers({ page, limit, search })
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }, [fetchUsers])

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '')
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, fetchData])

    //sync url tab with store
    useEffect(() => {
        const tab = searchParams.get('tab') || 'all'
        const validTabs = ['all', 'active', 'archive'] as const
        
        if (validTabs.includes(tab as typeof validTabs[number]) && tab !== activeTab) {
            setActiveTab(tab as 'all' | 'active' | 'archive')
        }
    }, [searchParams, activeTab, setActiveTab])

    useEffect(() => {
        if (!isInitialLoad) {
            fetchData(currentPage, storePagination?.itemsPerPage || 10, searchTerm)
        }
    }, [activeTab, currentPage, isInitialLoad, fetchData, storePagination?.itemsPerPage, searchTerm])

    const handleTabChange = (tab: string) => {
        if (tab === 'all') {
            navigate('/admin/users')
        } else {
            navigate(`/admin/users?tab=${tab}`)
        }
    }

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        fetchData(1, storePagination?.itemsPerPage || 10, term)
    }, [fetchData, storePagination?.itemsPerPage])

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm)
    }, [fetchData, storePagination?.itemsPerPage, searchTerm])

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm)
    }, [fetchData, searchTerm])

    const stats = getStats()

    const summaryCards = getUserSummaryCards(summaryStats);

    const userColumns: TableColumn<User>[] = [
        {
            key: 'checkbox',
            header: '',
            className: styles.thCheckbox,
            render: (user) => (
                <input
                    type="checkbox"
                    title='Checkbox'
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        {
            key: 'user',
            header: 'USER',
            className: styles.thUser,
            render: (user) => (
                <div className={styles.userInfo}>
                    <div className={`${styles.avatar} ${user.isArchived ? styles.avatarArchived : styles.avatarActive}`}>
                        <PersonStanding />
                    </div>
                    <span>{user.firstName} {user.lastName}</span>
            </div>
            )
        },
        {
            key: 'userNumber',
            header: 'USER NUMBER',
            className: styles.thDate,
            render: (user) => user.userNumber
        },
        {
            key: 'lastActive',
            header: 'LAST ACTIVE',
            className: styles.thDate,
            render: (user) => (
                <>
                    {formatDate(user.lastActiveAt)}
                </>
            )
        },
        {
            key: 'status',
            header: 'STATUS',
            className: styles.thStatus,
            render: (user) => (
                <span className={`${styles.statusBadge} ${getStatusClass(user.isArchived ? 'Archived' : 'Active', styles)}`}>
                    {user.isArchived ? 'Archived' : 'Active'}
                </span>

            )
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='User Management'
        />

        <div className={styles.contentCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <card.icon /> 
                            </div>
                        </div>
                        <div className={styles.cardValue}>{card.value}</div>
                        <div className={styles.cardFooter}>
                            <span>{card.footer}</span>
                        </div>
                    </div>
                ))
            }
        </div>


        <div className={styles.tabsContainer}>
            <button 
                type='button'
                className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('all')}
            >
                All Users
                <span className={styles.tabCount}>{stats.totalUsers}</span>
            </button>
            <button 
                type='button'
                className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('active')}
            >
                Active Users
                <span className={styles.tabCount}>{stats.activeUsers}</span>
            </button>
            <button 
                type='button'
                className={`${styles.tab} ${activeTab === 'archive' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('archive')}
            >
                Archived
                <span className={styles.tabCount}>{stats.archivedUsers}</span>
            </button>
        </div>

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>User Management</h1>

                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search users..."
                        disabled={loading}
                        className={styles.searchbar}
                    />
                    
                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.bulkActionsBar}>
                    <label className={styles.selectAllLabel}>
                        <input
                            type="checkbox"
                            checked={selectedUserIds.length === users.length && users.length > 0}
                            onChange={toggleSelectAll}
                            className={styles.selectAllCheckbox}
                        />
                        <span className={styles.selectedCount}>{selectedUserIds.length} selected</span>
                    </label>
                    <span className={styles.recordCount}>
                        {storePagination ? `${storePagination.startIndex}-${storePagination.endIndex} of ${storePagination.totalItems}` : '0 records'}
                    </span>
                </div>

                {
                    loading ? (
                        <div className={styles.tableResponsive}>
                            <Loading
                                type='skeleton'
                                rows={7}
                                message='Loading user data...'
                                delay={0}
                                minDuration={1000}
                            />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={userColumns}
                                data={users}
                                emptyMessage='No users found.'
                                searchTerm={searchTerm}
                                getRowKey={(user) => user.id}
                                onRowClick={(user) => toggleUserSelection(user.id)}
                            />

                            {
                                storePagination && storePagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={storePagination.currentPage}
                                        totalPages={storePagination.totalPages}
                                        totalItems={storePagination.totalItems}
                                        itemsPerPage={storePagination.itemsPerPage}
                                        onPageChange={handlePageChange}
                                        disabled={loading || isProcessing}
                                        className={styles.pagination}
                                    />
                                )
                            }
                        </>
                    )
                }
            </div>
            
            <div className={styles.archiveActions}>
                {
                    activeTab === 'archive' && (
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.restoreButton} ${selectedUserIds.length === 0 ? styles.disabled : ''}`}
                            disabled={selectedUserIds.length === 0}
                            onClick={unarchiveSelectedUsers}
                        >
                            Restore Selected ({selectedUserIds.length})
                        </button>
                    )
                }
                {
                    activeTab === 'active' && (
                        <button 
                            type='button'
                            className={`${styles.actionButton} ${styles.archiveButton} ${selectedUserIds.length === 0 ? styles.disabled : ''}`}
                            disabled={selectedUserIds.length === 0}
                            onClick={archiveSelectedUsers}
                        >
                            Archive Selected ({selectedUserIds.length})
                        </button>
                    )
                }
                {
                    activeTab === 'all' && selectedUserIds.length > 0 && (
                        <div className={styles.multiActions}>
                            <button 
                                type='button' 
                                className={`${styles.actionButton} ${styles.archiveButton}`}
                                onClick={archiveSelectedUsers}
                            >
                                Archive Selected ({selectedUserIds.length})
                            </button>
                            <button 
                                type='button' 
                                className={`${styles.actionButton} ${styles.restoreButton}`}
                                onClick={unarchiveSelectedUsers}
                            >
                                Restore Selected ({selectedUserIds.length})
                            </button>
                        </div>
                    )
                }
            </div>
        </div>

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'user')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default UserManagementPage