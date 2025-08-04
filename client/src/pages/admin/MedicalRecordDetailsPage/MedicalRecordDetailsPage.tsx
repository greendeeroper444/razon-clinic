import { useEffect } from 'react'
import styles from './MedicalRecordDetailsPage.module.css';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, 
    faClock, 
    faUser,
    faPhone, 
    faNotesMedical, 
    faMapMarkerAlt, 
    faBirthdayCake, 
    faVenusMars,
    faArrowLeft,
    faEdit,
    faCheckCircle,
    faRulerVertical,
    faWeight,
    faUsers,
    faDroplet,
    faEnvelope,
    faExclamationTriangle,
    faStethoscope,
    faPills,
    faClipboardList,
    faCalendarCheck,
    faCalculator,
    faHistory
} from '@fortawesome/free-solid-svg-icons';
import { formatBirthdate, formatDate, getLoadingText } from '../../../utils';
import { Main, Header, Modal, SubmitLoading } from '../../../components';
import { MedicalRecordFormData, FormDataType } from '../../../types';
import { useMedicalRecordStore } from '../../../stores';

const MedicalRecordDetailsPage = () => {
    const { medicalRecordId } = useParams();
    
    //zustand store selectors
    const {
        currentMedicalRecord,
        patients,
        submitLoading,
        loading,
        error,
        selectedMedicalRecord,
        isModalOpen,
        fetchMedicalRecordById,
        updateMedicalRecordData,
        openUpdateModal,
        closeUpdateModal,
        openStatusModal,
        currentOperation
    } = useMedicalRecordStore();

    console.log('Current state:', {
        currentMedicalRecord,
        loading,
        error,
        medicalRecordId
    });

    
    useEffect(() => {
        if (medicalRecordId) {
            fetchMedicalRecordById(medicalRecordId)
        }
    }, [medicalRecordId, fetchMedicalRecordById])

    const handleUpdateStatusClick = () => {
        if (currentMedicalRecord) {
            openStatusModal(currentMedicalRecord);
        }
    };

    const handleMedicalRecordUpdateClick = () => {
        if (currentMedicalRecord) {
            openUpdateModal(currentMedicalRecord)
        }
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedMedicalRecord?.id) {
            console.error('Invalid data or missing medical record ID')
            return
        }

        //assertion since we know it's MedicalRecordFormData in this context
        const medicalRecordData = data as MedicalRecordFormData

        await updateMedicalRecordData(selectedMedicalRecord.id, medicalRecordData)
    }
    

    //don't render if medical record is still loading
    if (!currentMedicalRecord) {
        return null
    }

    const headerActions = [
        {
            label: 'Edit',
            icon: faEdit,
            onClick: handleMedicalRecordUpdateClick,
            type: 'primary' as const
        },
        {
            label: 'Status',
            icon: faCheckCircle,
            onClick: handleUpdateStatusClick,
            type: 'outline' as const
        }
    ];

    const backButton = {
        icon: faArrowLeft,
        onClick: () => window.history.back()
    };

  return (
    <Main loading={loading} loadingType='spinner' error={error} loadingMessage='Loading medical record details...'>
        <Header
            title='Medical Record Details'
            backButton={backButton}
            actions={headerActions}
        />

        <div className={styles.appStatusBanner}>
            <div className={styles.appointmentNumber}>
                Medical Record #{currentMedicalRecord.medicalRecordNumber}
            </div>
        </div>

        {/* personal details section*/}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faUser} className={styles.cardIcon} />
                <h2>Personal Information</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faUser} /> Full Name:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.fullName}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faBirthdayCake} /> Date of Birth:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.dateOfBirth ? 
                                    formatBirthdate(String(currentMedicalRecord.personalDetails.dateOfBirth)) : 'Not specified'}
                                {
                                    currentMedicalRecord.personalDetails?.age && (
                                        <span className={styles.ageLabel}>({currentMedicalRecord.personalDetails.age} years)</span>
                                    )
                                }
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faVenusMars} /> Gender:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.gender}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faDroplet} /> Blood Type:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.bloodType || 'Not specified'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faPhone} /> Phone:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.phone}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faEnvelope} /> Email:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.email || 'Not provided'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.address || 'Not provided'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faExclamationTriangle} /> Emergency Contact:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.emergencyContact || 'Not provided'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* medical history section */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faHistory} className={styles.cardIcon} />
                <h2>Medical History</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faExclamationTriangle} /> Allergies:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.allergies || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faNotesMedical} /> Chronic Conditions:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.chronicConditions || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faStethoscope} /> Previous Surgeries:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.previousSurgeries || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faUsers} /> Family History:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.familyHistory || 'Not provided'}
                            </span>
                        </div>
                        {
                            currentMedicalRecord.medicalHistory?.general && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>General Notes:</span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.medicalHistory.general}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* growth milestone section */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faRulerVertical} className={styles.cardIcon} />
                <h2>Growth Milestones</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faRulerVertical} /> Height:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.growthMilestones?.height ? 
                                    `${currentMedicalRecord.growthMilestones.height} cm` : 'Not recorded'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faWeight} /> Weight:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.growthMilestones?.weight ? 
                                    `${currentMedicalRecord.growthMilestones.weight} kg` : 'Not recorded'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faCalculator} /> BMI:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.growthMilestones?.bmi || 'Not calculated'}
                            </span>
                        </div>
                        {
                            currentMedicalRecord.growthMilestones?.growthNotes && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Growth Notes:</span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.growthMilestones.growthNotes}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.growthMilestones?.general && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>General Notes:</span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.growthMilestones.general}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* vaccination history section */}
        {
            currentMedicalRecord.vaccinationHistory && (
                <div className={styles.detailsCard}>
                    <div className={styles.cardHeader}>
                        <FontAwesomeIcon icon={faStethoscope} className={styles.cardIcon} />
                        <h2>Vaccination History</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.detailsTable}>
                            <div className={styles.tableSection}>
                                <div className={styles.tableRow}>
                                    <span className={styles.tableValue}>{currentMedicalRecord.vaccinationHistory}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        {/*current syntoms section */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faNotesMedical} className={styles.cardIcon} />
                <h2>Current Symptoms</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faExclamationTriangle} /> Chief Complaint:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms?.chiefComplaint}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FontAwesomeIcon icon={faNotesMedical} /> Symptoms Description:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms?.symptomsDescription}</span>
                        </div>
                        {
                            currentMedicalRecord.currentSymptoms?.symptomsDuration && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faClock} /> Duration:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms.symptomsDuration}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.currentSymptoms?.painScale && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Pain Scale (1-10):</span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms.painScale}/10</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.currentSymptoms?.general && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>General Notes:</span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms.general}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* clinical information section */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faStethoscope} className={styles.cardIcon} />
                <h2>Clinical Information</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        {
                            currentMedicalRecord.diagnosis && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faClipboardList} /> Diagnosis:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.diagnosis}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.treatmentPlan && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faNotesMedical} /> Treatment Plan:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.treatmentPlan}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.prescribedMedications && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faPills} /> Prescribed Medications:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.prescribedMedications}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.consultationNotes && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faNotesMedical} /> Consultation Notes:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.consultationNotes}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.followUpDate && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FontAwesomeIcon icon={faCalendarCheck} /> Follow-up Date:
                                    </span>
                                    <span className={styles.tableValue}>
                                        {formatDate(currentMedicalRecord.followUpDate)}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* record metadata section*/}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.cardIcon} />
                <h2>Record Information</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Date Recorded:</span>
                            <span className={styles.tableValue}>
                                {
                                    currentMedicalRecord.dateRecorded ? 
                                        new Date(currentMedicalRecord.dateRecorded).toLocaleString() : 
                                        'Not specified'
                                }
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Created:</span>
                            <span className={styles.tableValue}>
                                {new Date(String(currentMedicalRecord.createdAt)).toLocaleString()}
                            </span>
                        </div>
                        {
                            currentMedicalRecord.updatedAt !== currentMedicalRecord.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {new Date(String(currentMedicalRecord.updatedAt)).toLocaleString()}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* update medical record modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType="medical"
                    onSubmit={handleSubmitUpdate}
                    patients={patients}
                    editData={selectedMedicalRecord}
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

export default MedicalRecordDetailsPage