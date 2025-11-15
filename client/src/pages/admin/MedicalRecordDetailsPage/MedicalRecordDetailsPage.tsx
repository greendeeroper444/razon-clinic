import { useEffect } from 'react'
import styles from './MedicalRecordDetailsPage.module.css';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, FileText, MapPin, Cake, Venus, ArrowLeft, Edit, Ruler, Weight, Users, Droplet, Mail, AlertTriangle, Stethoscope, Pill, ClipboardList, CalendarCheck2, Calculator, History } from 'lucide-react';
import { formatBirthdate, formatDate, formatDateTime, getLoadingText } from '../../../utils';
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
        isModalUpdateOpen,
        fetchMedicalRecordById,
        updateMedicalRecordData,
        openModalUpdate,
        closeModalUpdate,
        clearCurrentMedicalRecord,
        currentOperation
    } = useMedicalRecordStore();

    
    useEffect(() => {
        if (medicalRecordId) {
            fetchMedicalRecordById(medicalRecordId)
        }

        //cleanup when component unmounts
        return () => {
            clearCurrentMedicalRecord()
        }

    }, [medicalRecordId, fetchMedicalRecordById, clearCurrentMedicalRecord])

    const handleMedicalRecordUpdateClick = () => {
        if (currentMedicalRecord) {
            openModalUpdate(currentMedicalRecord)
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
            icon: <Edit />,
            onClick: handleMedicalRecordUpdateClick,
            type: 'primary' as const
        },
    ];

    const backButton = {
        icon: <ArrowLeft />,
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
                <User className={styles.cardIcon} />
                <h2>Personal Information</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <User /> Full Name:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.fullName}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Cake /> Date of Birth:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.dateOfBirth ? 
                                    formatBirthdate(String(currentMedicalRecord.personalDetails.dateOfBirth)) : 'N/A'}
                                {
                                    currentMedicalRecord.personalDetails?.age && (
                                        <span className={styles.ageLabel}>({currentMedicalRecord.personalDetails.age} years)</span>
                                    )
                                }
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Venus /> Gender:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.gender}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Droplet /> Blood Type:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.bloodType || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Phone /> Phone:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.personalDetails?.phone}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Mail /> Email:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.email || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <MapPin /> Address:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.address || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <AlertTriangle /> Emergency Contact:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.personalDetails?.emergencyContact || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* medical history section */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <History className={styles.cardIcon} />
                <h2>Medical History</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <AlertTriangle /> Allergies:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.allergies || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FileText /> Chronic Conditions:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.chronicConditions || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Stethoscope /> Previous Surgeries:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.previousSurgeries || 'None reported'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Users/> Family History:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.medicalHistory?.familyHistory || 'N/A'}
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
                <Ruler className={styles.cardIcon} />
                <h2>Growth Milestones</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Ruler /> Height:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.growthMilestones?.height ? 
                                    `${currentMedicalRecord.growthMilestones.height} cm` : 'Not recorded'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Weight /> Weight:
                            </span>
                            <span className={styles.tableValue}>
                                {currentMedicalRecord.growthMilestones?.weight ? 
                                    `${currentMedicalRecord.growthMilestones.weight} kg` : 'Not recorded'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Calculator /> BMI:
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
                        <Stethoscope className={styles.cardIcon} />
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
                <FileText className={styles.cardIcon} />
                <h2>Current Symptoms</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <AlertTriangle /> Chief Complaint:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms?.chiefComplaint}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <FileText /> Symptoms Description:
                            </span>
                            <span className={styles.tableValue}>{currentMedicalRecord.currentSymptoms?.symptomsDescription}</span>
                        </div>
                        {
                            currentMedicalRecord.currentSymptoms?.symptomsDuration && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <Clock /> Duration:
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
                <Stethoscope className={styles.cardIcon} />
                <h2>Clinical Information</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>
                    <div className={styles.tableSection}>
                        {
                            currentMedicalRecord.diagnosis && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <ClipboardList /> Diagnosis:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.diagnosis}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.treatmentPlan && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FileText /> Treatment Plan:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.treatmentPlan}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.prescribedMedications && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <Pill /> Prescribed Medications:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.prescribedMedications}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.consultationNotes && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <FileText /> Consultation Notes:
                                    </span>
                                    <span className={styles.tableValue}>{currentMedicalRecord.consultationNotes}</span>
                                </div>
                            )
                        }
                        {
                            currentMedicalRecord.followUpDate && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>
                                        <CalendarCheck2 /> Follow-up Date:
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
                <Calendar className={styles.cardIcon} />
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
                                        (formatDateTime(currentMedicalRecord.dateRecorded)) : 
                                        'N/A'
                                }
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Created:</span>
                            <span className={styles.tableValue}>
                                {formatDateTime(String(currentMedicalRecord.createdAt))}
                            </span>
                        </div>
                        {
                            currentMedicalRecord.updatedAt !== currentMedicalRecord.createdAt && (
                                <div className={styles.tableRow}>
                                    <span className={styles.tableLabel}>Last Updated:</span>
                                    <span className={styles.tableValue}>
                                        {formatDateTime(String(currentMedicalRecord.updatedAt))}
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
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
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