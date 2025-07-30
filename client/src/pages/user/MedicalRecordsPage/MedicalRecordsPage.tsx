import React, { useState, useEffect } from 'react'
import styles from './MedicalRecordsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, 
    faHistory, 
    faRuler,
    faStethoscope, 
    faDiagnoses,
    faSearch,
    faTimes,
    faFileAlt,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import { getMedicalRecords, getMedicalRecordById } from '../../../services';
import { MedicalRecord, PaginationInfo } from '../../../types';
import { generateMedicalReceiptPDF } from '../../../templates/generateReceiptPdf';
import { toast } from 'sonner';
import { calculateAge2 } from '../../../utils';

const MedicalRecordsPage: React.FC<OpenModalProps> = () => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [recordsPerPage] = useState<number>(10);
    const [patients, setPatients] = useState<Array<{ id: string; firstName: string }>>([]);

    //fetch medical records
    const fetchMedicalRecords = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await getMedicalRecords(page, recordsPerPage, search);
            
            if (response.success) {
                setMedicalRecords(response.data);
                setPagination(response.pagination);

                //extract unique patients from medical records for the modal dropdown
                const uniquePatients = Array.from(
                    new Map(
                        response.data
                            .filter((record: MedicalRecord) => record?.id) 
                            .map((record: MedicalRecord) => [
                                record.id,
                                {
                                    id: record.id,
                                    firstName: record.personalDetails?.fullName || 'N/A'
                                }
                            ])
                    ).values()
                );
                setPatients(uniquePatients as Array<{ id: string; firstName: string }>);
            } else {
                setError('Failed to fetch medical records');
            }
        } catch (err) {
            console.error('Error fetching medical records:', err);
            setError('Failed to fetch medical records');
        } finally {
            setLoading(false);
        }
    };

    //initial load
    useEffect(() => {
        fetchMedicalRecords(currentPage, searchTerm);
    }, [currentPage]);

    //search with debounce
    useEffect(() => {
        // const delayedSearch = setTimeout(() => {
        //     if (currentPage === 1) {
        //         fetchMedicalRecords(1, searchTerm);
        //     } else {
        //         setCurrentPage(1); //trigger the fetch via useEffect
        //     }
        // }, 500);

        // return () => clearTimeout(delayedSearch);
        fetchMedicalRecords();
    }, [searchTerm]);


    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedRecord(null);
    };

    const handleViewRecord = async (record: MedicalRecord) => {
        try {
        //fetch full record details
        const response = await getMedicalRecordById(record.id);
            if (response.success) {
                setSelectedRecord(response.data);
                setShowDetails(true);
            }
        } catch (err) {
        console.error('Error fetching record details:', err);
        //fallback to basic record data
        setSelectedRecord(record);
        setShowDetails(true);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };


    const handleDownloadReceipt = () => {
        if (selectedRecord) {
            try {
                generateMedicalReceiptPDF(selectedRecord);
                toast.success('Receipt downloaded successfully!');
            } catch (error) {
                console.error('Error generating receipt:', error);
                toast.error('Failed to generate receipt');
            }
        }
    };

    const getStatusFromRecord = (record: MedicalRecord): string => {
        if (record.followUpDate) {
            const followUpDate = new Date(record.followUpDate);
            const today = new Date();
            if (followUpDate > today) {
                return 'Pending';
            }
        }
        
        if (record.diagnosis && record.treatmentPlan) {
            return 'Completed';
        }
        
        return 'Active';
    };


    if (loading) {
        return (
            <div className={styles.content}>
                <div className={styles.loadingContainer}>
                    <p>Loading medical records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.content}>
                <div className={styles.errorContainer}>
                    <p>Error: {error}</p>
                    <button
                        type='button'
                        onClick={() => fetchMedicalRecords(currentPage, searchTerm)} 
                        className={styles.btnPrimary}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Medical Records</h1>
            <div className={styles.contentActions}>
                <button type='button' className={styles.btnOutline}>
                    <FontAwesomeIcon icon={faFileAlt} /> Generate Report
                </button>
            </div>
        </div>

        {/* search section */}
        <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by patient name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
        </div>

        {/* medical records table */}
        <div className={styles.tableContainer}>
            <table className={styles.recordsTable}>
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th>Date of Birth</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Phone</th>
                        <th>Date Recorded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            <tbody>
                {
                    medicalRecords.length === 0 ? (
                        <tr>
                            <td colSpan={7} className={styles.noRecords}>
                            No medical records found
                            </td>
                        </tr>
                    ) : (
                    medicalRecords.map((record) => {
                        getStatusFromRecord(record);
                        return (
                            <tr key={record.id} className={styles.tableRow}>
                                <td className={styles.patientName}>
                                    {record.personalDetails.fullName}
                                </td>
                                <td>
                                    {new Date(record.personalDetails.dateOfBirth).toLocaleDateString()}
                                </td>
                                <td>{calculateAge2(record.personalDetails.dateOfBirth)}</td>
                                <td>{record.personalDetails.gender}</td>
                                <td>{record.personalDetails.phone}</td>
                                <td>
                                    {new Date(record.dateRecorded).toLocaleDateString()}
                                </td>
                                <td className={styles.actions}>
                                    <button
                                        type='button'
                                        className={`${styles.actionBtn} ${styles.view}`}
                                        onClick={() => handleViewRecord(record)}
                                        title="View Details"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                    )
                }
            </tbody>
            </table>
        </div>

        {/* pagination */}
        {
            pagination && pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        type='button'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationBtn}
                    >
                        Previous
                    </button>
                    
                    <span className={styles.paginationInfo}>
                        Page {pagination.currentPage} of {pagination.totalPages} 
                        ({pagination.totalRecords} total records)
                    </span>
                    
                    <button
                        type='button'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className={styles.paginationBtn}
                    >
                        Next
                    </button>
                </div>
            )
        }

        {/* record details modal */}
        {
            showDetails && selectedRecord && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Medical Record Details</h2>
                            <div className={styles.modalHeaderActions}>
                                <button 
                                    type='button'
                                    onClick={handleDownloadReceipt} 
                                    className={styles.downloadBtn}
                                    title="Download Receipt"
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Download Receipt
                                </button>
                                <button 
                                    type='button'
                                    title='Close'
                                    onClick={handleCloseDetails} 
                                    className={styles.closeBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        </div>
                        
                        <div className={styles.modalBody}>
                            {/* personal details sec */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faUser} /> Personal Details</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Name:</strong> {selectedRecord.personalDetails.fullName}</div>
                                    <div><strong>Date of Birth:</strong> {new Date(selectedRecord.personalDetails.dateOfBirth).toLocaleDateString()}</div>
                                    <div><strong>Age:</strong> {calculateAge2(selectedRecord.personalDetails.dateOfBirth)} years</div>
                                    <div><strong>Gender:</strong> {selectedRecord.personalDetails.gender}</div>
                                    <div><strong>Blood Type:</strong> {selectedRecord.personalDetails.bloodType || 'Not specified'}</div>
                                    <div><strong>Phone:</strong> {selectedRecord.personalDetails.phone}</div>
                                    <div><strong>Email:</strong> {selectedRecord.personalDetails.email || 'Not provided'}</div>
                                    <div><strong>Address:</strong> {selectedRecord.personalDetails.address || 'Not provided'}</div>
                                    <div><strong>Emergency Contact:</strong> {selectedRecord.personalDetails.emergencyContact || 'Not provided'}</div>
                                </div>
                            </div>

                            {/* current sympton sec */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faStethoscope} /> Current Symptoms</h3>
                                <div className={styles.detailGrid}>
                                <div><strong>Chief Complaint:</strong> {selectedRecord.currentSymptoms.chiefComplaint}</div>
                                <div><strong>Symptoms Description:</strong> {selectedRecord.currentSymptoms.symptomsDescription}</div>
                                <div><strong>Duration:</strong> {selectedRecord.currentSymptoms.symptomsDuration || 'Not specified'}</div>
                                <div><strong>Pain Scale:</strong> {selectedRecord.currentSymptoms.painScale ? `${selectedRecord.currentSymptoms.painScale}/10` : 'Not specified'}</div>
                                </div>
                            </div>

                            {/* meidcal history sec */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faHistory} /> Medical History</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Allergies:</strong> {selectedRecord.medicalHistory.allergies || 'None reported'}</div>
                                    <div><strong>Chronic Conditions:</strong> {selectedRecord.medicalHistory.chronicConditions || 'None reported'}</div>
                                    <div><strong>Previous Surgeries:</strong> {selectedRecord.medicalHistory.previousSurgeries || 'None reported'}</div>
                                    <div><strong>Family History:</strong> {selectedRecord.medicalHistory.familyHistory || 'Not provided'}</div>
                                </div>
                            </div>

                            {/* growth milstone section */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faRuler} /> Growth Milestones</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Height:</strong> {selectedRecord.growthMilestones.height ? `${selectedRecord.growthMilestones.height} cm` : 'Not measured'}</div>
                                    <div><strong>Weight:</strong> {selectedRecord.growthMilestones.weight ? `${selectedRecord.growthMilestones.weight} kg` : 'Not measured'}</div>
                                    <div><strong>BMI:</strong> {selectedRecord.growthMilestones.bmi || 'Not calculated'}</div>
                                    <div><strong>Growth Notes:</strong> {selectedRecord.growthMilestones.growthNotes || 'No notes'}</div>
                                </div>
                            </div>

                            {/* clinical information */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faDiagnoses} /> Clinical Information</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Diagnosis:</strong> {selectedRecord.diagnosis || 'Pending'}</div>
                                    <div><strong>Treatment Plan:</strong> {selectedRecord.treatmentPlan || 'Not specified'}</div>
                                    <div><strong>Prescribed Medications:</strong> {selectedRecord.prescribedMedications || 'None prescribed'}</div>
                                    <div><strong>Consultation Notes:</strong> {selectedRecord.consultationNotes || 'No notes'}</div>
                                    <div><strong>Vaccination History:</strong> {selectedRecord.vaccinationHistory || 'Not provided'}</div>
                                    <div><strong>Follow-up Date:</strong> {selectedRecord.followUpDate ? new Date(selectedRecord.followUpDate).toLocaleDateString() : 'Not scheduled'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default MedicalRecordsPage