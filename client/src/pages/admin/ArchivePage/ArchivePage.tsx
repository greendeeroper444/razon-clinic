import { useState } from 'react'
import styles from './ArchivePage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faUser, faCalendarAlt, faClock, faArchive } from '@fortawesome/free-solid-svg-icons'

const ArchivePage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatients, setSelectedPatients] = useState([])

    const archivedPatients = [
        { id: 1, name: 'John Doe', lastVisit: '12 Mar 2023', archivedDate: '12 Mar 2025', reasonForArchive: 'Inactivity (2+ years)' },
        { id: 2, name: 'Sarah Johnson', lastVisit: '05 Feb 2023', archivedDate: '05 Feb 2025', reasonForArchive: 'Inactivity (2+ years)' },
        { id: 3, name: 'Michael Brown', lastVisit: '24 Jan 2023', archivedDate: '24 Jan 2025', reasonForArchive: 'Moved out of state' },
        { id: 4, name: 'Emily Wilson', lastVisit: '18 Dec 2022', archivedDate: '18 Dec 2024', reasonForArchive: 'Inactivity (2+ years)' },
        { id: 5, name: 'David Chen', lastVisit: '03 Nov 2022', archivedDate: '03 Nov 2024', reasonForArchive: 'Transferred to another provider' },
        { id: 6, name: 'Maria Garcia', lastVisit: '15 Oct 2022', archivedDate: '15 Oct 2024', reasonForArchive: 'Inactivity (2+ years)' }
    ]

    const filteredPatients = archivedPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const togglePatientSelection = (patientId) => {
        setSelectedPatients(prev => 
            prev.includes(patientId)
                ? prev.filter(id => id !== patientId)
                : [...prev, patientId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedPatients.length === filteredPatients.length) {
            setSelectedPatients([])
        } else {
            setSelectedPatients(filteredPatients.map(p => p.id))
        }
    }

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <div className={styles.titleSection}>
                <h1 className={styles.contentTitle}>
                    <FontAwesomeIcon icon={faArchive} className={styles.headerIcon} />
                    Patient Archive
                </h1>
                <p className={styles.pageSubtitle}>
                    Manage and review patients who have been inactive for 2+ years
                </p>
            </div>
            
            <div className={styles.actionSection}>
                <div className={styles.searchWrapper}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input 
                        type="text"
                        title='Search'
                        placeholder="Search archived patients..."
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

        <div className={styles.contentCards}>
            <div className={styles.statsCard}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>4</span>
                    <span className={styles.statLabel}>This Month</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>23</span>
                    <span className={styles.statLabel}>This Year</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>182</span>
                    <span className={styles.statLabel}>Total Archived</span>
                </div>
            </div>
        </div>

        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <div className={styles.bulkActions}>
                    <input
                        type="checkbox"
                        title='Select All'
                        checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                        onChange={toggleSelectAll}
                        className={styles.selectAllCheckbox}
                    />
                    <span className={styles.selectedCount}>
                        {selectedPatients.length} selected
                    </span>
                </div>
                <div className={styles.tableControls}>
                    <span className={styles.recordCount}>
                        {filteredPatients.length} records
                    </span>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.archiveTable}>
                    <thead>
                        <tr className={styles.tableHeaderRow}>
                            <th></th>
                            <th>Patient</th>
                            <th>Last Visit</th>
                            <th>Active Date</th>
                            <th>Archive Date</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredPatients.map(patient => (
                                <tr 
                                    key={patient.id} 
                                    className={`${styles.tableRow} ${selectedPatients.includes(patient.id) ? styles.selectedRow : ''}`}
                                    onClick={() => togglePatientSelection(patient.id)}
                                >
                                    <td className={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            title='Select Patient'
                                            checked={selectedPatients.includes(patient.id)}
                                            onChange={() => togglePatientSelection(patient.id)}
                                            className={styles.rowCheckbox}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.patientInfo}>
                                            <div className={styles.patientAvatar}>
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                            <span className={styles.patientName}>{patient.name}</span>
                                        </div>
                                    </td>
                                    <td className={styles.dateCell}>
                                        <div className={styles.dateInfo}>
                                            <FontAwesomeIcon icon={faCalendarAlt} className={styles.dateIcon} />
                                            <span>{patient.lastVisit}</span>
                                        </div>
                                    </td>
                                    <td className={styles.dateCell}>
                                        <div className={styles.dateInfo}>
                                            <FontAwesomeIcon icon={faClock} className={styles.dateIcon} />
                                            <span>{patient.archivedDate}</span>
                                        </div>
                                    </td>
                                    <td className={styles.reasonCell}>
                                        <span className={styles.reasonBadge}>
                                            {patient.reasonForArchive}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <div className={styles.archiveActions}>
            <button 
                type='button'
                className={`${styles.restoreButton} ${selectedPatients.length === 0 ? styles.disabled : ''}`}
                disabled={selectedPatients.length === 0}
            >
                Restore Selected ({selectedPatients.length})
            </button>
            <div className={styles.pagination}>
                <button type='button' className={`${styles.pageButton} ${styles.active}`}>1</button>
                <button type='button' className={styles.pageButton}>2</button>
                <button type='button' className={styles.pageButton}>3</button>
                <button type='button' className={`${styles.pageButton} ${styles.nextPage}`}>Next</button>
            </div>
        </div>
    </div>
  )
}

export default ArchivePage