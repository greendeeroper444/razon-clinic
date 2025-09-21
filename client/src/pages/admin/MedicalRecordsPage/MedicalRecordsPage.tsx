import React, { useEffect } from 'react'
import styles from './MedicalRecordsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faUser, 
    faHistory, 
    faRuler,
    faStethoscope, 
    faDiagnoses,
    faTimes,
    faFileAlt,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import { FormDataType, MedicalRecordFormData, MedicalRecordResponse } from '../../../types';
import { Header, Loading, Main, Modal, SubmitLoading } from '../../../components';
import { generateMedicalReceiptPDF } from '../../../templates/generateReceiptPdf';
import { toast } from 'sonner';
import { calculateAge2, getLoadingText, openModalWithRefresh } from '../../../utils';
import { useMedicalRecordStore } from '../../../stores';
import { useNavigate } from 'react-router-dom';

const MedicalRecordsPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate();

    //zustand store selectors
    const {
        medicalRecords,
        submitLoading,
        loading,
        error,
        searchTerm,
        currentPage,
        pagination,
        showDetails,
        selectedRecord,
        isModalOpen,
        isDeleteModalOpen,
        selectedMedicalRecord,
        deleteMedicalRecordData,
        fetchMedicalRecords,
        viewMedicalRecord,
        openUpdateModal,
        openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        closeDetailsModal,
        handlePageChange,
        updateMedicalRecordData,
        addMedicalRecord,
        deleteMedicalRecord,
        getStatusFromRecord,
        currentOperation
    } = useMedicalRecordStore();


    useEffect(() => {
        fetchMedicalRecords();
    }, [fetchMedicalRecords]);

    //handle search with debounce
    useEffect(() => {
        // const delayedSearch = setTimeout(() => {
        //     fetchMedicalRecords(1, searchTerm);
        // }, 500);

        // return () => clearTimeout(delayedSearch);
        fetchMedicalRecords(1, searchTerm);
    }, [fetchMedicalRecords, searchTerm]);

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'medical',
            openModal,
            onRefresh: () => fetchMedicalRecords(),
        });
    };

    const handleReport = () => {
        console.log('Generate report');
    };

    const handleViewClick = (record: MedicalRecordResponse) => {
        navigate(`/admin/medical-records/details/${record.id}`)
    }

    const handleViewRecord = (record: MedicalRecordResponse) => {
        viewMedicalRecord(record);
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing medical ID');
            return;
        }

        const medicalData = data as MedicalRecordFormData;

        try {
            if (selectedMedicalRecord?.id) {
                await updateMedicalRecordData(selectedMedicalRecord.id, medicalData);
            } else {
                await addMedicalRecord(medicalData);
            }
        } catch (error) {
            console.error('Error processing medical record:', error);
        }
    };

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }

        try {
            await deleteMedicalRecord(data);
        } catch (error) {
            console.error('Error deleting medical record:', error);
        }
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

    const headerActions = [
        {
            id: 'newMedicalRecordBtn',
            label: 'New Record',
            icon: faPlus,
            onClick: handleOpenModal,
            type: 'primary' as const
        },
        {
            label: 'Report',
            icon: faFileAlt,
            onClick: handleReport,
            type: 'outline' as const
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='Medical Records'
            actions={headerActions}
        />

        {/* search section */}
        {/* <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    type='text'
                    placeholder='Search by patient name, phone, or email...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
        </div> */}

        {/* medical records table */}
        {
            loading ? (
                <Loading
                    type='skeleton'
                    rows={7}
                    message='Loading medical records data...'
                    delay={0}
                    minDuration={1000}
                />
            ) : (
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
                                                        onClick={() => handleViewClick(record)}
                                                        title='View Details'
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        type='button' 
                                                        className={`${styles.actionBtn} ${styles.update}`} 
                                                        onClick={() => openUpdateModal(record)}
                                                        title='Update'
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        type='button' 
                                                        className={`${styles.actionBtn} ${styles.delete}`} 
                                                        onClick={() => openDeleteModal(record)}
                                                        title='Delete'
                                                    >
                                                        Delete
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
            )
        }

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
                                    title='Download Receipt'
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Download Receipt
                                </button>
                                <button 
                                    type='button'
                                    title='Close'
                                    onClick={closeDetailsModal} 
                                    className={styles.closeBtn}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        </div>
                        
                        <div className={styles.modalBody}>
                            {/* personal details section */}
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

                            {/* current symptoms section */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faStethoscope} /> Current Symptoms</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Chief Complaint:</strong> {selectedRecord.currentSymptoms.chiefComplaint}</div>
                                    <div><strong>Symptoms Description:</strong> {selectedRecord.currentSymptoms.symptomsDescription}</div>
                                    <div><strong>Duration:</strong> {selectedRecord.currentSymptoms.symptomsDuration || 'Not specified'}</div>
                                    <div><strong>Pain Scale:</strong> {selectedRecord.currentSymptoms.painScale ? `${selectedRecord.currentSymptoms.painScale}/10` : 'Not specified'}</div>
                                </div>
                            </div>

                            {/* medical history section */}
                            <div className={styles.detailSection}>
                                <h3><FontAwesomeIcon icon={faHistory} /> Medical History</h3>
                                <div className={styles.detailGrid}>
                                    <div><strong>Allergies:</strong> {selectedRecord.medicalHistory.allergies || 'None reported'}</div>
                                    <div><strong>Chronic Conditions:</strong> {selectedRecord.medicalHistory.chronicConditions || 'None reported'}</div>
                                    <div><strong>Previous Surgeries:</strong> {selectedRecord.medicalHistory.previousSurgeries || 'None reported'}</div>
                                    <div><strong>Family History:</strong> {selectedRecord.medicalHistory.familyHistory || 'Not provided'}</div>
                                </div>
                            </div>

                            {/* growth milestones section */}
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

        {/* update medical record modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType='medical'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedMedicalRecord}
                    isProcessing={submitLoading}
                />
            )
        }

        {/* delete medical record modal */}
        {
            isDeleteModalOpen && deleteMedicalRecordData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteMedicalRecordData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'medical')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default MedicalRecordsPage