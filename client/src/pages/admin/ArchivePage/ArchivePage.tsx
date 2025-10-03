import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ArchivePage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faUser, faCalendarAlt, faClock, faArchive } from '@fortawesome/free-solid-svg-icons'

const ArchivePage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    
    const activeTab = searchParams.get('tab') || 'all'

    const unarchivedUsers = [
        { id: 7, name: 'Alice Cooper', lastVisit: '15 Sep 2024', status: 'Active', isArchived: false },
        { id: 8, name: 'Robert Smith', lastVisit: '22 Aug 2024', status: 'Active', isArchived: false },
        { id: 9, name: 'Jennifer White', lastVisit: '10 Jul 2024', status: 'Active', isArchived: false },
        { id: 10, name: 'Thomas Anderson', lastVisit: '05 Jun 2024', status: 'Active', isArchived: false },
    ]

    const archivedUsers = [
        { id: 1, name: 'John Doe', lastVisit: '12 Mar 2023', archivedDate: '12 Mar 2025', reasonForArchive: 'Inactivity (2+ years)', isArchived: true },
        { id: 2, name: 'Sarah Johnson', lastVisit: '05 Feb 2023', archivedDate: '05 Feb 2025', reasonForArchive: 'Inactivity (2+ years)', isArchived: true },
        { id: 3, name: 'Michael Brown', lastVisit: '24 Jan 2023', archivedDate: '24 Jan 2025', reasonForArchive: 'Moved out of state', isArchived: true },
        { id: 4, name: 'Emily Wilson', lastVisit: '18 Dec 2022', archivedDate: '18 Dec 2024', reasonForArchive: 'Inactivity (2+ years)', isArchived: true },
        { id: 5, name: 'David Chen', lastVisit: '03 Nov 2022', archivedDate: '03 Nov 2024', reasonForArchive: 'Transferred to another provider', isArchived: true },
        { id: 6, name: 'Maria Garcia', lastVisit: '15 Oct 2022', archivedDate: '15 Oct 2024', reasonForArchive: 'Inactivity (2+ years)', isArchived: true }
    ]

    const allUsers = [...unarchivedUsers, ...archivedUsers]

    const getUsersByTab = () => {
        switch (activeTab) {
            case 'archive-list':
                return archivedUsers
            case 'unarchive-list':
                return unarchivedUsers
            default:
                return allUsers
        }
    }

    const currentUsers = getUsersByTab()

    const filteredUsers = currentUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(filteredUsers.map(p => p.id))
        }
    }

    const handleTabChange = (tab) => {
        setSelectedUsers([])
        setSearchQuery('')
        if (tab === 'all') {
            navigate('/admin/archives')
        } else {
            navigate(`/admin/archives?tab=${tab}`)
        }
    }

    useEffect(() => {
        setSelectedUsers([])
    }, [activeTab])

    const totalArchived = archivedUsers.length
    const totalUnarchived = unarchivedUsers.length
    const archivedThisMonth = 4
    const archivedThisYear = 23

    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <div className={styles.titleSection}>
                    <h1 className={styles.contentTitle}>
                        <FontAwesomeIcon icon={faArchive} className={styles.headerIcon} />
                        User Archive Management
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Manage active and archived user records
                    </p>
                </div>
                
                <div className={styles.actionSection}>
                    <div className={styles.searchWrapper}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input 
                            type="text"
                            title='Search'
                            placeholder="Search user..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <button type='button' className={styles.filterButton}>
                        <FontAwesomeIcon icon={faFilter} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <button 
                    type='button'
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange('all')}
                >
                    All Users
                    <span className={styles.tabCount}>{allUsers.length}</span>
                </button>
                <button 
                    type='button'
                    className={`${styles.tab} ${activeTab === 'unarchive-list' ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange('unarchive-list')}
                >
                    Active Users
                    <span className={styles.tabCount}>{totalUnarchived}</span>
                </button>
                <button 
                    type='button'
                    className={`${styles.tab} ${activeTab === 'archive-list' ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange('archive-list')}
                >
                    Archived
                    <span className={styles.tabCount}>{totalArchived}</span>
                </button>
            </div>

            <div className={styles.contentCards}>
                <div className={styles.statsCard}>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{archivedThisMonth}</span>
                        <span className={styles.statLabel}>Archived This Month</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{archivedThisYear}</span>
                        <span className={styles.statLabel}>Archived This Year</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{totalArchived}</span>
                        <span className={styles.statLabel}>Total Archived</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{totalUnarchived}</span>
                        <span className={styles.statLabel}>Active Users</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.bulkActionsBar}>
                    <label className={styles.selectAllLabel}>
                        <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={toggleSelectAll}
                            className={styles.selectAllCheckbox}
                        />
                        <span className={styles.selectedCount}>{selectedUsers.length} selected</span>
                    </label>
                    <span className={styles.recordCount}>{filteredUsers.length} records</span>
                </div>

                <table className={styles.archiveTable}>
                    <thead>
                        <tr>
                            <th className={styles.thCheckbox}></th>
                            <th className={styles.thUser}>USER</th>
                            <th className={styles.thDate}>LAST VISIT</th>
                            {(activeTab === 'archive-list' || activeTab === 'all') && (
                                <th className={styles.thDate}>ARCHIVED DATE</th>
                            )}
                            {(activeTab === 'archive-list' || activeTab === 'all') && (
                                <th className={styles.thReason}>REASON</th>
                            )}
                            {(activeTab === 'unarchive-list' || activeTab === 'all') && (
                                <th className={styles.thStatus}>{activeTab === 'all' ? 'ARCHIVE STATUS' : 'STATUS'}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr 
                                key={user.id}
                                className={`${styles.tableRow} ${selectedUsers.includes(user.id) ? styles.selectedRow : ''}`}
                                onClick={() => toggleUserSelection(user.id)}
                            >
                                <td className={styles.tdCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleUserSelection(user.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td className={styles.tdUser}>
                                    <div className={styles.userInfo}>
                                        <div className={`${styles.avatar} ${user.isArchived ? styles.avatarArchived : styles.avatarActive}`}>
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td className={styles.tdDate}>
                                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                                    {user.lastVisit}
                                </td>
                                {(activeTab === 'archive-list' || activeTab === 'all') && (
                                    <td className={styles.tdDate}>
                                        <FontAwesomeIcon icon={faClock} className={styles.icon} />
                                        {user.archivedDate || '-'}
                                    </td>
                                )}
                                {(activeTab === 'archive-list' || activeTab === 'all') && (
                                    <td className={styles.tdReason}>
                                        {user.reasonForArchive || '-'}
                                    </td>
                                )}
                                {(activeTab === 'unarchive-list' || activeTab === 'all') && (
                                    <td className={styles.tdStatus}>
                                        <span className={`${styles.statusBadge} ${user.isArchived ? styles.badgeArchived : styles.badgeActive}`}>
                                            {user.isArchived ? 'Archived' : 'Active'}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className={styles.archiveActions}>
                {activeTab === 'archive-list' && (
                    <button 
                        type='button'
                        className={`${styles.actionButton} ${styles.restoreButton} ${selectedUsers.length === 0 ? styles.disabled : ''}`}
                        disabled={selectedUsers.length === 0}
                    >
                        Restore Selected ({selectedUsers.length})
                    </button>
                )}
                {activeTab === 'unarchive-list' && (
                    <button 
                        type='button'
                        className={`${styles.actionButton} ${styles.archiveButton} ${selectedUsers.length === 0 ? styles.disabled : ''}`}
                        disabled={selectedUsers.length === 0}
                    >
                        Archive Selected ({selectedUsers.length})
                    </button>
                )}
                {activeTab === 'all' && selectedUsers.length > 0 && (
                    <div className={styles.multiActions}>
                        <button type='button' className={`${styles.actionButton} ${styles.archiveButton}`}>
                            Archive Selected ({selectedUsers.length})
                        </button>
                        <button type='button' className={`${styles.actionButton} ${styles.restoreButton}`}>
                            Restore Selected ({selectedUsers.length})
                        </button>
                    </div>
                )}
                
                <div className={styles.pagination}>
                    <button type='button' className={`${styles.pageBtn} ${styles.pageActive}`}>1</button>
                    <button type='button' className={styles.pageBtn}>2</button>
                    <button type='button' className={styles.pageBtn}>3</button>
                    <button type='button' className={styles.pageBtn}>Next</button>
                </div>
            </div>
        </div>
    )
}

export default ArchivePage