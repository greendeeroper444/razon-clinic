import React, { useState, useEffect } from 'react'
import styles from './PatientsPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faUserInjured, 
    faUserPlus, 
    faHeartbeat, 
    faCalendarAlt,
    faEye,
    faIdCard,
    faVenusMars,
    faBirthdayCake,
    faPhone,
    faMapMarkerAlt,
    faEdit,
    faCalendarPlus,
    faArchive,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import { PersonalPatientFormData } from '../../../types/personalPatient';
import { 
    getPersonalPatients, 
    updatePersonalPatient, 
    deletePersonalPatient 
} from '../../services/personalPatient';
import { toast } from 'sonner';



const PatientsPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showPatientDetail, setShowPatientDetail] = useState(false);
    const [patients, setPatients] = useState<PersonalPatientFormData[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PersonalPatientFormData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editData, setEditData] = useState<PersonalPatientFormData | null>(null);
    const [deletePersonalPatientData, setDeletePersonalPatientData] = useState<{
        id: string;
        itemName: string;
        itemType: string;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const STATS_CARDS = [
        { 
            title: 'Total Patients', 
            value: patients.length.toString(), 
            footer: 'Registered in system', 
            icon: faUserInjured, 
            color: 'blue' 
        },
        { 
            title: 'Active Patients', 
            value: patients.filter(p => !p.isArchive).length.toString(), 
            footer: 'Currently active', 
            icon: faHeartbeat, 
            color: 'green' 
        },
        { 
            title: 'Archived Patients', 
            value: patients.filter(p => p.isArchive).length.toString(), 
            footer: 'Archived patients', 
            icon: faArchive, 
            color: 'orange' 
        },
        { 
            title: 'This Month', 
            value: patients.filter(p => {
                const patientDate = new Date(p.birthdate);
                const currentDate = new Date();
                return patientDate.getMonth() === currentDate.getMonth();
            }).length.toString(), 
            footer: 'Registered this month', 
            icon: faUserPlus, 
            color: 'purple' 
        }
    ];

    //calculate age from birthdate
    const calculateAge = (birthdate: string): number => {
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    //generate initials from full name
    const generateInitials = (fullName: string): string => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    };

    //transform API data to display format
    const transformPatientData = (apiData: any[]): PersonalPatientFormData[] => {
        return apiData.map(patient => ({
            ...patient,
            age: calculateAge(patient.birthdate),
            initials: generateInitials(patient.fullName)
        }));
    };

    //fetch patients data
    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const response = await getPersonalPatients();
            const transformedData = transformPatientData(response.data.personalPatients || []);
            setPatients(transformedData);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchPatients();
    }, []);

    //handle view patient details
    const handleViewPatient = (patient: PersonalPatientFormData) => {
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
            patientId: patient.id,
            fullName: patient.fullName,
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

    
    const handleSubmitUpdate = async (data: PersonalPatientFormData) => {
        if (!editData) return;

        try {
            setIsProcessing(true);
            
            await updatePersonalPatient(editData.patientId, data);
            
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
        setDeletePersonalPatientData({
            id: patient.id,
            itemName: patient.fullName,
            itemType: 'Patient'
        });
        setIsDeleteModalOpen(true);
    };

    //handle delete confirmation
    const handleConfirmDelete = async (patientId: string) => {
        try {
            setIsProcessing(true);
            await deletePersonalPatient(patientId);
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

    const togglePatientDetail = () => {
        setShowPatientDetail(!showPatientDetail);
        setSelectedPatient(null);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    //listen for modal close events to refresh data
    useEffect(() => {
        const handleModalClosed = () => {
            fetchPatients();
        };

        window.addEventListener('modal-closed', handleModalClosed);
        return () => {
            window.removeEventListener('modal-closed', handleModalClosed);
        };
    }, []);

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Patients</h1>
            <div className={styles.contentActions}>
                <button 
                    type='submit'
                    className={styles.btnPrimary} 
                    id="newPatientBtn" 
                    onClick={() => openModal && openModal('patient')}
                >
                    <FontAwesomeIcon icon={faPlus} /> New Patient
                </button>
            </div>
        </div>

        {/* patients cards */}
        <div className={styles.patientCards}>
            {
                STATS_CARDS.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.color]}`}>
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
                                    isLoading ? (
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
                                                        <div>
                                                            <div className={styles.patientName}>{patient.fullName}</div>
                                                            <div className={styles.patientId}>#{patient.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles.patientGender} ${styles[patient.sex.toLowerCase()]}`}>{patient.sex}</span>
                                                </td>
                                                <td>{patient.age}</td>
                                                <td>{patient.contactNumber}</td>
                                                <td>
                                                    <span className={`${styles.patientStatus} ${patient.isArchive ? styles.archived : styles.active}`}>
                                                        {patient.isArchive ? 'Archived' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className={`${styles.actionBtn} ${styles.primary}`} 
                                                        onClick={() => handleViewPatient(patient)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faEye} /> View */} View
                                                    </button>
                                                    <button 
                                                        className={`${styles.actionBtn} ${styles.update}`}
                                                        onClick={() => handleEditPatient(patient)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faEdit} /> Edit */} Delete
                                                    </button>
                                                    <button 
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
                    <button type='button' className={styles.btnBack} onClick={() => window.history.back()}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div className={styles.patientHeader}>
                        <div className={styles.patientAvatarLg}>{selectedPatient.initials}</div>
                        <div className={styles.patientHeaderInfo}>
                            <div className={styles.patientNameLg}>{selectedPatient.fullName}</div>
                            <div className={styles.patientMeta}>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faIdCard} />
                                    <span>#{selectedPatient.id}</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faVenusMars} />
                                    <span>{selectedPatient.sex}</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faBirthdayCake} />
                                    <span>{selectedPatient.age} years ({selectedPatient.birthdate})</span>
                                </div>
                                <div className={styles.patientMetaItem}>
                                    <FontAwesomeIcon icon={faPhone} />
                                    <span>{selectedPatient.contactNumber}</span>
                                </div>
                            </div>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{selectedPatient.address}</span>
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
                        {['overview', 'medical', 'appointments', 'billing', 'documents'].map((tab) => (
                            <div 
                                key={tab}
                                className={`${styles.patientTab} ${activeTab === tab ? styles.active : ''}`} 
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </div>
                        ))}
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
                <ModalComponent
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    modalType="patient"
                    onSubmit={handleSubmitUpdate}
                    editData={editData}
                    isProcessing={isProcessing}
                />
            )
        }

        {/* delete patient modal */}
        {
            isDeleteModalOpen && deletePersonalPatientData && (
                <ModalComponent
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteModalClose}
                    modalType="delete"
                    onSubmit={handleConfirmDelete}
                    deleteData={deletePersonalPatientData}
                    isProcessing={isProcessing}
                />
            )
        }
    </div>
  )
}

export default PatientsPage