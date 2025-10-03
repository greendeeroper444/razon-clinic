import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './UserManagementPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons'
import { useUserManagementStore } from '../../../stores/userManagementStore'
import { Loading, Main, Pagination, Searchbar, SubmitLoading } from '../../../components'
import { getLoadingText } from '../../../utils'

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
        fetchTotalCounts,
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
            fetchTotalCounts()
            fetchData(1, 10, '')
            setIsInitialLoad(false)
        }
    }, [isInitialLoad, fetchTotalCounts, fetchData])

    //sync URL tab with store
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

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const stats = getStats()

  return (
    <Main error={error}>
        <div className={styles.contentCards}>
            <div className={styles.statsCard}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.totalUsers}</span>
                    <span className={styles.statLabel}>Total Users</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.activeUsers}</span>
                    <span className={styles.statLabel}>Active Users</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.archivedUsers}</span>
                    <span className={styles.statLabel}>Archived Users</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.selected}</span>
                    <span className={styles.statLabel}>Selected</span>
                </div>
            </div>
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
                <h1 className={styles.sectionTitle}>User Archive Management</h1>

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
                        <div className={styles.tableResponsive}>
                            <table className={styles.userTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.thCheckbox}></th>
                                        <th className={styles.thUser}>USER</th>
                                        <th className={styles.thDate}>USER NUMBER</th>
                                        <th className={styles.thDate}>LAST ACTIVE</th>
                                        {
                                            (activeTab === 'archive' || activeTab === 'all') && (
                                                <th className={styles.thDate}>ARCHIVED DATE</th>
                                            )
                                        }
                                        {
                                            (activeTab === 'archive' || activeTab === 'all') && (
                                                <th className={styles.thReason}>ARCHIVED BY</th>
                                            )
                                        }
                                        {
                                            (activeTab === 'active' || activeTab === 'all') && (
                                                <th className={styles.thStatus}>STATUS</th>
                                            )
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        users.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={styles.emptyState}>
                                                    {
                                                        searchTerm ? 
                                                        `No users found matching "${searchTerm}". Try a different search term.` : 
                                                        'No users found.'
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
                                                <tr 
                                                    key={user.id}
                                                    className={`${styles.tableRow} ${selectedUserIds.includes(user.id) ? styles.selectedRow : ''}`}
                                                    onClick={() => toggleUserSelection(user.id)}
                                                >
                                                    <td className={styles.tdCheckbox}>
                                                        <input
                                                            type="checkbox"
                                                            title='Checkbox'
                                                            checked={selectedUserIds.includes(user.id)}
                                                            onChange={() => toggleUserSelection(user.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className={styles.tdUser}>
                                                        <div className={styles.userInfo}>
                                                            <div className={`${styles.avatar} ${user.isArchived ? styles.avatarArchived : styles.avatarActive}`}>
                                                                <FontAwesomeIcon icon={faUser} />
                                                            </div>
                                                            <span>{user.firstName} {user.lastName}</span>
                                                        </div>
                                                    </td>
                                                    <td className={styles.tdDate}>
                                                        {user.userNumber}
                                                    </td>
                                                    <td className={styles.tdDate}>
                                                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                                                        {formatDate(user.lastActiveAt)}
                                                    </td>
                                                    {
                                                        (activeTab === 'archive' || activeTab === 'all') && (
                                                            <td className={styles.tdDate}>
                                                                <FontAwesomeIcon icon={faClock} className={styles.icon} />
                                                                {formatDate(user.archivedAt)}
                                                            </td>
                                                        )
                                                    }
                                                    {
                                                        (activeTab === 'archive' || activeTab === 'all') && (
                                                            <td className={styles.tdReason}>
                                                                {user.archivedBy ? `${user.archivedBy.firstName} ${user.archivedBy.lastName}` : '-'}
                                                            </td>
                                                        )
                                                    }
                                                    {
                                                        (activeTab === 'active' || activeTab === 'all') && (
                                                            <td className={styles.tdStatus}>
                                                                <span className={`${styles.statusBadge} ${user.isArchived ? styles.badgeArchived : styles.badgeActive}`}>
                                                                    {user.isArchived ? 'Archived' : 'Active'}
                                                                </span>
                                                            </td>
                                                        )
                                                    }
                                                </tr>
                                            ))
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>

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