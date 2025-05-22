import React, { useState } from 'react'
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
    faArchive
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';

const PatientsPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showPatientDetail, setShowPatientDetail] = useState(false);

    const STATS_CARDS = [
        { title: 'Total Patients', value: '1,248', footer: 'Registered in system', icon: faUserInjured, color: 'blue' },
        { title: 'New This Month', value: '47', footer: '+12% from the last month', icon: faUserPlus, color: 'green' },
        { title: 'Active Patients', value: '982', footer: 'Visited in last 6 months', icon: faHeartbeat, color: 'purple' },
        { title: 'Average Visits', value: '3.2', footer: 'Per patient per year', icon: faCalendarAlt, color: 'orange' }
    ];

    const PATIENTS = [
        { id: 'PT-1001', name: 'John Doe', initials: 'JD', gender: 'Male', age: 42, lastVisit: 'Jun 2, 2023', status: 'Active', doctor: 'Dr. Smith' },
        { id: 'PT-2045', name: 'Mary Smith', initials: 'MS', gender: 'Female', age: 35, lastVisit: 'May 28, 2023', status: 'Active', doctor: 'Dr. Johnson' },
        { id: 'PT-3120', name: 'Robert Johnson', initials: 'RJ', gender: 'Male', age: 58, lastVisit: 'Apr 15, 2023', status: 'Active', doctor: 'Dr. Williams' },
        { id: 'PT-1876', name: 'Sarah Brown', initials: 'SB', gender: 'Female', age: 29, lastVisit: 'Mar 22, 2023', status: 'Active', doctor: 'Dr. Anderson' },
        { id: 'PT-2456', name: 'Lisa White', initials: 'LW', gender: 'Female', age: 45, lastVisit: 'Jan 10, 2023', status: 'Inactive', doctor: 'Dr. Smith' },
        { id: 'PT-3987', name: 'Emma Wilson', initials: 'EW', gender: 'Female', age: 31, lastVisit: 'Jun 5, 2023', status: 'Active', doctor: 'Dr. Johnson' }
    ];

    const PATIENT_INFO = {
        id: 'PT-1001',
        name: 'Greendee Roper B. Panogalon',
        initials: 'JD',
        gender: 'Male',
        birthDate: 'Mar 15, 2003',
        age: 42,
        phone: '0997-455-96539',
        address: 'Mabuhay, Carmen, Davao del Norte',
        bloodType: 'A+',
        heightWeight: '5\'10" / 180 lbs',
        allergies: 'Penicillin, Peanuts',
        doctor: 'Dr. Razon',
        lastVisit: 'Jun 2, 2023',
        nextAppointment: 'Jul 15, 2025',
        medications: [
            { name: 'Lisinopril', dosage: '10mg daily (Hypertension)' },
            { name: 'Atorvastatin', dosage: '20mg nightly (Cholesterol)' }
        ]
    };

    const togglePatientDetail = () => {
        setShowPatientDetail(!showPatientDetail);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

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
                                    <th>Last Visit</th>
                                    <th>Status</th>
                                    <th>Primary Doctor</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    PATIENTS.map((patient, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className={styles.patientInfo}>
                                                    <div className={styles.patientAvatar}>{patient.initials}</div>
                                                    <div>
                                                        <div className={styles.patientName}>{patient.name}</div>
                                                        <div className={styles.patientId}>#{patient.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.patientGender} ${styles[patient.gender.toLowerCase()]}`}>{patient.gender}</span>
                                            </td>
                                            <td>{patient.age}</td>
                                            <td>{patient.lastVisit}</td>
                                            <td>
                                                <span className={`${styles.patientStatus} ${styles[patient.status.toLowerCase()]}`}>{patient.status}</span>
                                            </td>
                                            <td>{patient.doctor}</td>
                                            <td>
                                                <button className={`${styles.actionBtn} ${styles.primary}`} onClick={togglePatientDetail}>
                                                    <FontAwesomeIcon icon={faEye} /> View
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.cancel}`} onClick={togglePatientDetail}>
                                                    <FontAwesomeIcon icon={faArchive} /> Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        {/* patient detail view */}
        {
            showPatientDetail && (
                <div className={styles.patientDetailContainer}>
                    <div className={styles.patientHeader}>
                        <div className={styles.patientAvatarLg}>{PATIENT_INFO.initials}</div>
                        <div className={styles.patientHeaderInfo}>
                        <div className={styles.patientNameLg}>{PATIENT_INFO.name}</div>
                        <div className={styles.patientMeta}>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faIdCard} />
                                <span>#{PATIENT_INFO.id}</span>
                            </div>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faVenusMars} />
                                <span>{PATIENT_INFO.gender}</span>
                            </div>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faBirthdayCake} />
                                <span>{PATIENT_INFO.age} years ({PATIENT_INFO.birthDate})</span>
                            </div>
                            <div className={styles.patientMetaItem}>
                                <FontAwesomeIcon icon={faPhone} />
                                <span>{PATIENT_INFO.phone}</span>
                            </div>
                        </div>
                        <div className={styles.patientMetaItem}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{PATIENT_INFO.address}</span>
                        </div>
                        </div>
                        <div className={styles.patientActions}>
                            <button className={styles.btnOutline}>
                                <FontAwesomeIcon icon={faEdit} /> Edit
                            </button>
                            <button 
                            className={styles.btnPrimary} 
                                id="newAppointmentBtn" 
                                onClick={() => openModal && openModal('appointment')}
                            >
                                <FontAwesomeIcon icon={faCalendarPlus} /> New Appointment
                            </button>
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
                        {
                            [
                                { title: 'Blood Type', value: PATIENT_INFO.bloodType },
                                { title: 'Height/Weight', value: PATIENT_INFO.heightWeight },
                                { title: 'Allergies', value: PATIENT_INFO.allergies },
                                { title: 'Primary Doctor', value: PATIENT_INFO.doctor },
                                { title: 'Last Visit', value: PATIENT_INFO.lastVisit },
                                { title: 'Next Appointment', value: PATIENT_INFO.nextAppointment }
                            ].map((info, index) => (
                                <div className={styles.infoCard} key={index}>
                                <div className={styles.infoCardTitle}>{info.title}</div>
                                <div className={styles.infoCardValue}>{info.value}</div>
                                </div>
                            ))
                        }
                        </div>

                        <h3 className={styles.sectionTitle}>Current Medications</h3>
                        <div className={styles.infoGrid}>
                        {
                            PATIENT_INFO.medications.map((med, index) => (
                                <div className={styles.infoCard} key={index}>
                                <div className={styles.infoCardTitle}>{med.name}</div>
                                <div className={styles.infoCardValue}>{med.dosage}</div>
                                </div>
                            ))
                        }
                        </div>
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
    </div>
  )
}

export default PatientsPage