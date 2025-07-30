import React, { useState, useEffect, useMemo } from 'react'
import styles from './PatientsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faIdCard, faVenusMars, faBirthdayCake, faPhone, faMapMarkerAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import { Main, Header, Modal } from '../../../components';
import { FormDataType, PatientApiResponse, PersonalPatientDisplayData, PersonalPatientFormData } from '../../../types';
import { getPersonalPatients, updatePersonalPatient, deletePersonalPatient } from '../../../services';
import { toast } from 'sonner';
import { calculateAge2, openModalWithRefresh } from '../../../utils';
import { getPatientSummaryCards } from '../../../config/patientSummaryCards';



const PatientsPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showPatientDetail, setShowPatientDetail] = useState<boolean>(false);
    const [patients, setPatients] = useState<PersonalPatientDisplayData[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PersonalPatientDisplayData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [editData, setEditData] = useState<PersonalPatientFormData | null>(null);
    const [deletePersonalPatientData, setDeletePersonalPatientData] = useState<{
        id: string;
        itemName: string;
        itemType: string;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    //calculate summary stats using useMemo for performance
    const summaryStats = useMemo(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return {
            total: patients.length,
            active: patients.filter(p => !p.isArchive).length,
            archived: patients.filter(p => p.isArchive).length,
            thisMonth: patients.filter(p => {
                const patientDate = new Date(p.birthdate);
                return patientDate.getMonth() === currentMonth && 
                       patientDate.getFullYear() === currentYear;
            }).length
        };
    }, [patients]);

    //get summary cards using the reusable function
    const summaryCards = useMemo(() => 
        getPatientSummaryCards(summaryStats), 
        [summaryStats]
    );

    //generate initials from full name
    const generateInitials = (firstName: string): string => {
        if (!firstName || typeof firstName !== 'string') {
            return 'NA';
        }
        
        return firstName
            .trim() //remove leading/trailing whitespace
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    };

    //transform API data to display format
    const transformPatientData = (apiData: PatientApiResponse[]): PersonalPatientDisplayData[] => {
        return apiData.map(patient => ({
            ...patient,
            age: calculateAge2(patient.birthdate),
            initials: generateInitials(patient.firstName)
        }));
    };

    //fetch patients data
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await getPersonalPatients();
            const transformedData = transformPatientData(response.data.personalPatients || []);
            setPatients(transformedData);
        } catch (error) {
            setError('An error occurred while fetching patients');
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPatients();
    }, []);

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'patient',
            openModal,
            onRefresh: fetchPatients
        });
    };

    //handle view patient details
    const handleViewPatient = (patient: PersonalPatientDisplayData) => {
        setSelectedPatient(patient);
        setShowPatientDetail(true);
    };

  
    //handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setDeletePersonalPatientData(null);
    };

    const handleEditPatient = (patient: PersonalPatientFormData) => {
        const editFormData: PersonalPatientFormData & { patientId?: string } = {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            middleName: patient.middleName,
            email: patient.email,
            contactNumber: patient.contactNumber,
            birthdate: patient.birthdate,
            sex: patient.sex,
            address: patient.address,
            religion: patient.religion || '',
            motherInfo: patient.motherInfo || {
                name: '',
                age: undefined,
                occupation: ''
            },
            fatherInfo: patient.fatherInfo || {
                name: '',
                age: undefined,
                occupation: ''
            },
            isArchive: patient.isArchive
        };
        setEditData(editFormData);
        setIsModalOpen(true);
    };

    
    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string' || !editData || !editData.id) {
            console.error('Invalid data or missing patient ID');
            return;
        }

        //assertion since we know it's PersonalPatientFormData in this context
        const patientData = data as PersonalPatientFormData;

        try {
            setIsProcessing(true);
            
            await updatePersonalPatient(editData.id, patientData);
            
            //refresh the patients list after successful update/add
            await fetchPatients();
            
            //close modal and reset state
            setIsModalOpen(false);
            setEditData(null);


            toast.success('Patient updated successfully!')
            
        } catch (error) {
            console.error('Error updating patient:', error);
        } finally {
            setIsProcessing(false);
        }
    };


    //handle archive/delete patient
    const handleDeletePatient = (patient: PersonalPatientFormData) => {
        if (!patient.id) {
            console.error('Patient ID is missing');
            return;
        }
        
        setDeletePersonalPatientData({
            id: patient.id,
            itemName: patient.firstName || 'Unknown Patient',
            itemType: 'Patient'
        });
        setIsDeleteModalOpen(true);
    };

    //handle delete confirmation
    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }

        try {
            setIsProcessing(true);
            await deletePersonalPatient(data);
            await fetchPatients();
            setIsDeleteModalOpen(false);
            setDeletePersonalPatientData(null);

            toast.success('Patient deleted successfully!')
        } catch (error) {
            console.error('Error deleting patient:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const headerActions = [
        {
            id: 'newPatientBtn',
            label: 'New Patient',
            icon: faPlus,
            onClick: handleOpenModal,
            type: 'primary' as const
        }
    ];

  return (
    <Main loading={loading} error={error} loadingMessage='Loading patients...'>
        <Header
            title='Patients'
            actions={headerActions}
        />

        {/* patients cards */}
        <div className={styles.patientCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <FontAwesomeIcon icon={card.icon} />
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

        {/* patient table */}
        {
            !showPatientDetail && (
                <div className={styles.patientTableContainer}>
                    <div className={styles.patientTableHeader}>
                        <div className={styles.patientTableTitle}>Patient Records</div>
                    </div>

                    <div className={styles.tableResponsive}>
                        <table className={styles.patientTable}>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Gender</th>
                                    <th>Age</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    loading ? (
                                        <tr>
                                            <td colSpan={6} style={{textAlign: 'center'}}>Loading...</td>
                                        </tr>
                                    ) : patients.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{textAlign: 'center'}}>No patients found</td>
                                        </tr>
                                    ) : (
                                        patients.map((patient, index) => (
                                            <tr key={patient.id || index}>
                                                <td>
                                                    <div className={styles.patientInfo}>
                                                        <div className={styles.patientAvatar}>{patient.initials}</div>
                                                        <div style={{ textAlign: 'start' }}>
                                                            <div className={styles.patientName}>{patient.firstName} {patient.lastName}</div>
                                                            <div className={styles.patientId}>#{patient.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles.patientGender} ${styles[patient.sex?.toLowerCase() || 'unknown']}`}>{patient.sex || 'N/A'}</span>
                                                </td>
                                                <td>{patient.age || 'N/A'}</td>
                                                <td>{patient.contactNumber || 'N/A'}</td>
                                                <td>
                                                    <span className={`${styles.patientStatus} ${patient.isArchive ? styles.archived : styles.active}`}>
                                                        {patient.isArchive ? 'Archived' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        type='button'
                                                        className={`${styles.actionBtn} ${styles.primary}`} 
                                                        onClick={() => handleViewPatient(patient)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faEye} /> View */} View
                                                    </button>
                                                    <button 
                                                        type='button'
                                                        className={`${styles.actionBtn} ${styles.update}`}
                                                        onClick={() => handleEditPatient(patient)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faEdit} /> Edit */} Update
                                                    </button>
                                                    <button 
                                                        type='button'
                                                        className={`${styles.actionBtn} ${styles.cancel}`} 
                                                        onClick={() => handleDeletePatient(patient)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faArchive} /> Archive */}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        {/* patient detail view */}
        {
            showPatientDetail && selectedPatient && (
                <div className={styles.patientDetailContainer}>
                    <button type='button' title='Back' className={styles.btnBack} onClick={() => setShowPatientDetail(false)}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div className={styles.patientHeader}>
                        <div className={styles.patientAvatarLg}>{selectedPatient.initials}</div>
                        <div className={styles.patientHeaderInfo}>
                            <div className={styles.patientNameLg}>{selectedPatient.firstName || 'Unknown Patient'}</div>
                            <div className={styles.patientMeta}>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faIdCard} />
                                    <span>#{selectedPatient.id}</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faVenusMars} />
                                    <span>{selectedPatient.sex || 'N/A'}</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faBirthdayCake} />
                                    <span>{selectedPatient.age || 'N/A'} years ({selectedPatient.birthdate || 'N/A'})</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faPhone} />
                                    <span>{selectedPatient.contactNumber || 'N/A'}</span>
                                </div>
                            </div>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{selectedPatient.address || 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.patientActions}>
                            {/* <button 
                                className={styles.btnOutline}
                                onClick={() => handleEditPatient(selectedPatient)}
                            >
                                <FontAwesomeIcon icon={faEdit} /> Edit
                            </button> */}
                            {/* <button 
                                className={styles.btnPrimary} 
                                id="newAppointmentBtn" 
                                onClick={() => openModal && openModal('appointment')}
                            >
                                <FontAwesomeIcon icon={faCalendarPlus} /> New Appointment
                            </button> */}
                            
                        </div>
                    </div>

                    <div className={styles.patientTabs}>
                        {
                            ['overview', 'medical', 'appointments', 'billing', 'documents'].map((tab) => (
                                <div 
                                    key={tab}
                                    className={`${styles.patientTab} ${activeTab === tab ? styles.active : ''}`} 
                                    onClick={() => handleTabChange(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </div>
                            ))
                        }
                    </div>

                    <div className={`${styles.patientTabContent} ${activeTab === 'overview' ? styles.active : ''}`}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoCardTitle}>Email</div>
                                <div className={styles.infoCardValue}>{selectedPatient.email || 'Not provided'}</div>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoCardTitle}>Religion</div>
                                <div className={styles.infoCardValue}>{selectedPatient.religion || 'Not specified'}</div>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoCardTitle}>Status</div>
                                <div className={styles.infoCardValue}>{selectedPatient.isArchive ? 'Archived' : 'Active'}</div>
                            </div>
                        </div>

                        {/* mother's Information */}
                        {
                            selectedPatient.motherInfo && (
                                <>
                                    <h3 className={styles.sectionTitle}>Mother's Information</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Name</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.motherInfo.name || 'Not provided'}</div>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Age</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.motherInfo.age || 'Not provided'}</div>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Occupation</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.motherInfo.occupation || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </>
                            )
                        }

                        {/* father's Information */}
                        {
                            selectedPatient.fatherInfo && (
                                <>
                                    <h3 className={styles.sectionTitle}>Father's Information</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Name</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.fatherInfo.name || 'Not provided'}</div>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Age</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.fatherInfo.age || 'Not provided'}</div>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <div className={styles.infoCardTitle}>Occupation</div>
                                            <div className={styles.infoCardValue}>{selectedPatient.fatherInfo.occupation || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    </div>

                    <div className={`${styles.patientTabContent} ${activeTab === 'medical' ? styles.active : ''}`}>
                        <p>Medical history and records would be displayed here.</p>
                    </div>

                    <div className={`${styles.patientTabContent} ${activeTab === 'appointments' ? styles.active : ''}`}>
                        <p>Appointment history would be displayed here.</p>
                    </div>

                    <div className={`${styles.patientTabContent} ${activeTab === 'billing' ? styles.active : ''}`}>
                        <p>Billing and insurance information would be displayed here.</p>
                    </div>

                    <div className={`${styles.patientTabContent} ${activeTab === 'documents' ? styles.active : ''}`}>
                        <p>Patient documents and files would be displayed here.</p>
                    </div>
                </div>
            )
        }

        {/* update patient modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    modalType='patient'
                    onSubmit={handleSubmitUpdate}
                    editData={editData}
                    isProcessing={isProcessing}
                />
            )
        }

        {/* delete patient modal */}
        {
            isDeleteModalOpen && deletePersonalPatientData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteModalClose}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deletePersonalPatientData}
                    isProcessing={isProcessing}
                />
            )
        }
    </Main>
  )
}

export default PatientsPage