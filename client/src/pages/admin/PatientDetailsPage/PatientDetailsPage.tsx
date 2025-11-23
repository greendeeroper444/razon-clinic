import { useEffect } from 'react'
import styles from './PatientDetailsPage.module.css';
import { useParams } from 'react-router-dom';
import { Calendar, User, Phone, MapPin, Cake, Venus, ArrowLeft, Edit, Users, Hand, Activity, Thermometer } from 'lucide-react';
import { calculateAge, formatBirthdate, getLoadingText } from '../../../utils';
import { Main, Header, Modal, SubmitLoading } from '../../../components';
import { FormDataType, PatientFormData } from '../../../types';
import { usePatientStore } from '../../../stores';

const PatientDetailsPage = () => {
    const { patientId } = useParams();
    //zustand store selectors
    const {
        currentPatient,
        submitLoading,
        loading,
        error,
        selectedPatient,
        isModalUpdateOpen,
        fetchPatientById,
        updatePatientData,
        openModalUpdate,
        closeModalUpdate,
        clearCurrentPatient,
        currentOperation,
    } = usePatientStore();

    useEffect(() => {
        if (patientId) {
            fetchPatientById(patientId);
        }

        //cleanup when component unmounts
        return () => {
            clearCurrentPatient()
        }
    }, [patientId, fetchPatientById, clearCurrentPatient])


    const handlePatientUpdateClick = () => {
        if (currentPatient) {
            openModalUpdate(currentPatient)
        }
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !selectedPatient?.id) {
            console.error('Invalid data or missing patient ID')
            return
        }

        //assertion since we know it's PatientFormData in this context
        const patientData = data as PatientFormData

        await updatePatientData(selectedPatient.id, patientData)
    }
    
    //don't render if patient is still loading
    if (!currentPatient) {
        return null
    }

    const headerActions = [
        {
            label: 'Edit',
            icon: <Edit />,
            onClick: handlePatientUpdateClick,
            type: 'primary' as const
        }
    ];

    const backButton = {
        icon: <ArrowLeft />,
        onClick: () => window.history.back()
    };

  return (
    <Main loading={loading} loadingType='spinner' error={error} loadingMessage='Loading patient details...'>
        <Header
            title='Patient Details'
            backButton={backButton}
            actions={headerActions}
        />

        <div className={styles.appStatusBanner}>
            <div className={styles.patientNumber}>
                Patient #{currentPatient.patientNumber}
            </div>
        </div>

        {/* single comprehensive patient details table */}
        <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
                <Calendar className={styles.cardIcon} />
                <h2>Complete Patient Details</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.detailsTable}>

                    {/* patient details information */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <User /> Patient Information
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <User /> Full Name:
                            </span>
                            <span className={styles.tableValue}>
                                {currentPatient.firstName}, {currentPatient.lastName},
                                {currentPatient.middleName} {currentPatient.suffix}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Cake /> Birthdate:
                            </span>
                            <span className={styles.tableValue}>
                                {formatBirthdate(String(currentPatient.birthdate))} 
                                <span className={styles.ageLabel}>({calculateAge(String(currentPatient.birthdate))} years)</span>
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Venus /> Sex:
                            </span>
                            <span className={styles.tableValue}>{currentPatient.sex}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Phone /> Contact Number:
                            </span>
                            <span className={styles.tableValue}>{currentPatient?.contactNumber || 'N/A'}</span>
                        </div>
                        
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <MapPin /> Address:
                            </span>
                            <span className={styles.tableValue}>{currentPatient.address}</span>
                        </div>

                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Hand /> Religion:
                            </span>
                            <span className={styles.tableValue}>{currentPatient?.religion || 'N/A'}</span>
                        </div>
                    </div>

                    {/* vital signs section */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Activity /> Vital Signs
                        </h3>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Height:</span>
                            <span className={styles.tableValue}>
                                {currentPatient?.height ? `${currentPatient.height} cm` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>Weight:</span>
                            <span className={styles.tableValue}>
                                {currentPatient?.weight ? `${currentPatient.weight} kg` : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Activity /> Blood Pressure:
                            </span>
                            <span className={styles.tableValue}>
                                {
                                    currentPatient?.bloodPressure?.systolic && currentPatient?.bloodPressure?.diastolic
                                        ? `${currentPatient.bloodPressure.systolic}/${currentPatient.bloodPressure.diastolic} mmHg`
                                        : 'N/A'
                                }
                            </span>
                        </div>
                        <div className={styles.tableRow}>
                            <span className={styles.tableLabel}>
                                <Thermometer /> Temperature:
                            </span>
                            <span className={styles.tableValue}>
                                {currentPatient?.temperature ? `${currentPatient.temperature}°C` : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* family info section */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>
                            <Users /> Family Information
                        </h3>
                        
                        {/* mother's info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Mother's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                <span className={styles.tableValue}>{currentPatient?.motherInfo?.name || 'N/A'}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{currentPatient?.motherInfo?.age || 'N/A'}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>{currentPatient?.motherInfo?.occupation || 'N/A'}</span>
                            </div>
                        </div>
                        
                        {/* father info */}
                        <div className={styles.familySubSection}>
                            <h4 className={styles.familyTitle}>Father's Information</h4>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>
                                    <User /> Name:
                                </span>
                                <span className={styles.tableValue}>{currentPatient?.fatherInfo?.name || 'N/A'}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Age:</span>
                                <span className={styles.tableValue}>{currentPatient?.fatherInfo?.age || 'N/A'}</span>
                            </div>
                            <div className={styles.tableRow}>
                                <span className={styles.tableLabel}>Occupation:</span>
                                <span className={styles.tableValue}>{currentPatient?.fatherInfo?.occupation || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType="patient"
                    onSubmit={handleSubmitUpdate}
                    editData={selectedPatient}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'patient')}
            size='medium'
            variant='overlay'
        />

    </Main>
  )
}

export default PatientDetailsPage