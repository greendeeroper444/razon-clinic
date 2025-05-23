import React, { useState } from 'react'
import styles from './MedicalRecordsPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faUser, 
  faHistory, 
  faRuler, 
  faSyringe, 
  faStethoscope, 
  faDiagnoses,
  faPrescriptionBottle,
  faNotesMedical,
  faCalendarAlt,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faTimes,
  faList,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const MedicalRecordsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Static medical records data
  const medicalRecords = [
    {
      id: 1,
      patientId: 'P001',
      fullName: 'John Smith',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      bloodType: 'O+',
      address: '123 Main St, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
      emergencyContact: 'Jane Smith - +1 (555) 987-6543',
      allergies: 'Penicillin, Peanuts',
      chronicConditions: 'Hypertension, Type 2 Diabetes',
      previousSurgeries: 'Appendectomy (2010)',
      familyHistory: 'Heart disease (father), Diabetes (mother)',
      height: '175',
      weight: '80',
      bmi: '26.1',
      growthNotes: 'Within normal range',
      covidVaccine: 'Pfizer - 3 doses (2021-2022)',
      fluVaccine: 'Annual flu shot - 2023',
      hepatitisB: 'Completed series (childhood)',
      otherVaccines: 'Tetanus (2020)',
      chiefComplaint: 'Chest pain and shortness of breath',
      symptomsDescription: 'Sharp chest pain during physical activity, difficulty breathing',
      symptomsDuration: '3 days',
      painScale: '7',
      primaryDiagnosis: 'Angina pectoris',
      secondaryDiagnosis: 'Anxiety disorder',
      diagnosisDate: '2025-01-15',
      diagnosticTests: 'ECG, Chest X-ray, Blood tests',
      treatmentGoals: 'Reduce chest pain, improve cardiovascular health',
      recommendedTreatments: 'Cardiac rehabilitation, lifestyle modifications',
      lifestyle: 'Low-sodium diet, regular exercise, stress management',
      medications: 'Metoprolol 50mg, Atorvastatin 20mg',
      dosage: 'As prescribed',
      frequency: 'Daily',
      duration: '3 months',
      consultationDate: '2025-01-15',
      consultingPhysician: 'Dr. Sarah Johnson',
      clinicalNotes: 'Patient presents with typical angina symptoms. Recommend cardiac workup.',
      recommendations: 'Follow-up in 2 weeks, cardiac stress test',
      followUpDate: '2025-01-29',
      followUpType: 'In-Person',
      followUpNotes: 'Monitor symptoms, review test results',
      status: 'Active',
      createdDate: '2025-01-15'
    },
    {
      id: 2,
      patientId: 'P002',
      fullName: 'Maria Garcia',
      dateOfBirth: '1992-07-22',
      gender: 'Female',
      bloodType: 'A-',
      address: '456 Oak Avenue, Los Angeles, CA 90210',
      phone: '+1 (555) 234-5678',
      email: 'maria.garcia@email.com',
      emergencyContact: 'Carlos Garcia - +1 (555) 876-5432',
      allergies: 'Latex, Shellfish',
      chronicConditions: 'Asthma, Migraine headaches',
      previousSurgeries: 'None',
      familyHistory: 'Asthma (mother), Migraines (sister)',
      height: '162',
      weight: '58',
      bmi: '22.1',
      growthNotes: 'Healthy weight range',
      covidVaccine: 'Moderna - 2 doses + booster (2021-2022)',
      fluVaccine: 'Annual flu shot - 2023',
      hepatitisB: 'Completed series (childhood)',
      otherVaccines: 'HPV series (2010-2011)',
      chiefComplaint: 'Severe headache and nausea',
      symptomsDescription: 'Throbbing headache on left side, sensitivity to light, nausea',
      symptomsDuration: '2 days',
      painScale: '8',
      primaryDiagnosis: 'Migraine with aura',
      secondaryDiagnosis: '',
      diagnosisDate: '2025-01-20',
      diagnosticTests: 'Neurological exam, Blood pressure check',
      treatmentGoals: 'Pain relief, prevent future episodes',
      recommendedTreatments: 'Medication therapy, trigger identification',
      lifestyle: 'Regular sleep schedule, stress reduction, hydration',
      medications: 'Sumatriptan 50mg, Propranolol 40mg',
      dosage: 'As needed for migraine, daily for prevention',
      frequency: 'PRN / Daily',
      duration: '6 months',
      consultationDate: '2025-01-20',
      consultingPhysician: 'Dr. Michael Chen',
      clinicalNotes: 'Classic migraine presentation with aura. Responding well to treatment.',
      recommendations: 'Keep headache diary, identify triggers',
      followUpDate: '2025-02-20',
      followUpType: 'Telemedicine',
      followUpNotes: 'Review headache diary, adjust medications if needed',
      status: 'Active',
      createdDate: '2025-01-20'
    },
    {
      id: 3,
      patientId: 'P003',
      fullName: 'Robert Johnson',
      dateOfBirth: '1978-11-05',
      gender: 'Male',
      bloodType: 'B+',
      address: '789 Pine Street, Chicago, IL 60601',
      phone: '+1 (555) 345-6789',
      email: 'robert.johnson@email.com',
      emergencyContact: 'Linda Johnson - +1 (555) 765-4321',
      allergies: 'None known',
      chronicConditions: 'Chronic lower back pain',
      previousSurgeries: 'L4-L5 disc surgery (2020)',
      familyHistory: 'Arthritis (father), Back problems (brother)',
      height: '183',
      weight: '92',
      bmi: '27.5',
      growthNotes: 'Slightly overweight',
      covidVaccine: 'J&J - 1 dose + booster (2021-2022)',
      fluVaccine: 'Annual flu shot - 2023',
      hepatitisB: 'Completed series (adulthood)',
      otherVaccines: 'Tetanus (2019)',
      chiefComplaint: 'Lower back pain radiating to left leg',
      symptomsDescription: 'Sharp, shooting pain from lower back down left leg, worse with sitting',
      symptomsDuration: '1 week',
      painScale: '6',
      primaryDiagnosis: 'Lumbar radiculopathy',
      secondaryDiagnosis: 'Muscle strain',
      diagnosisDate: '2025-01-18',
      diagnosticTests: 'MRI lumbar spine, X-ray',
      treatmentGoals: 'Pain reduction, improve mobility',
      recommendedTreatments: 'Physical therapy, pain management',
      lifestyle: 'Weight loss, core strengthening, ergonomic improvements',
      medications: 'Ibuprofen 600mg, Gabapentin 300mg',
      dosage: 'TID with meals, BID',
      frequency: 'Three times daily, Twice daily',
      duration: '4 weeks',
      consultationDate: '2025-01-18',
      consultingPhysician: 'Dr. Emily Rodriguez',
      clinicalNotes: 'Recurrent back pain post-surgery. Consider additional interventions.',
      recommendations: 'Physical therapy referral, weight management counseling',
      followUpDate: '2025-02-15',
      followUpType: 'In-Person',
      followUpNotes: 'Assess response to treatment, consider imaging if no improvement',
      status: 'Active',
      createdDate: '2025-01-18'
    }
  ];

  const [formData, setFormData] = useState({
    fullName: '', dateOfBirth: '', gender: '', bloodType: '', address: '', phone: '', email: '', emergencyContact: '',
    allergies: '', chronicConditions: '', previousSurgeries: '', familyHistory: '',
    height: '', weight: '', bmi: '', growthNotes: '',
    covidVaccine: '', fluVaccine: '', hepatitisB: '', otherVaccines: '',
    chiefComplaint: '', symptomsDescription: '', symptomsDuration: '', painScale: '',
    primaryDiagnosis: '', secondaryDiagnosis: '', diagnosisDate: '', diagnosticTests: '',
    treatmentGoals: '', recommendedTreatments: '', lifestyle: '',
    medications: '', dosage: '', frequency: '', duration: '',
    consultationDate: '', consultingPhysician: '', clinicalNotes: '', recommendations: '',
    followUpDate: '', followUpType: '', followUpNotes: ''
  });

  const handleOpenModal = () => setShowForm(true);
  const handleCloseModal = () => setShowForm(false);
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRecord(null);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Medical Record Data:', formData);
    handleCloseModal();
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const formSections = [
    {
      title: "Personal Details", icon: faUser,
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
        { name: 'bloodType', label: 'Blood Type', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' }
      ]
    },
    {
      title: "Medical History", icon: faHistory,
      fields: [
        { name: 'allergies', label: 'Known Allergies', type: 'textarea' },
        { name: 'chronicConditions', label: 'Chronic Conditions', type: 'textarea' },
        { name: 'previousSurgeries', label: 'Previous Surgeries', type: 'textarea' },
        { name: 'familyHistory', label: 'Family Medical History', type: 'textarea' }
      ]
    },
    {
      title: "Growth Milestones", icon: faRuler,
      fields: [
        { name: 'height', label: 'Height (cm)', type: 'number' },
        { name: 'weight', label: 'Weight (kg)', type: 'number' },
        { name: 'bmi', label: 'BMI', type: 'number', step: '0.1' },
        { name: 'growthNotes', label: 'Growth Notes', type: 'textarea' }
      ]
    },
    {
      title: "Current Symptoms", icon: faStethoscope,
      fields: [
        { name: 'chiefComplaint', label: 'Chief Complaint', type: 'text', required: true },
        { name: 'symptomsDescription', label: 'Symptoms Description', type: 'textarea', required: true },
        { name: 'symptomsDuration', label: 'Duration of Symptoms', type: 'text' },
        { name: 'painScale', label: 'Pain Scale (1-10)', type: 'number', min: '1', max: '10' }
      ]
    }
  ];

  return (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Medical Records</h1>
        <div className={styles.contentActions}>
          <button type='button' className={styles.btnPrimary} onClick={handleOpenModal}>
            <FontAwesomeIcon icon={faPlus} /> New Medical Record
          </button>
          <button type='button' className={styles.btnOutline}>
            <FontAwesomeIcon icon={faFileAlt} /> Generate Report
          </button>
        </div>
      </div>

      {/* search and filter section */}
      <div className={styles.searchFilterSection}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterBox}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Records</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* medical record table */}
      <div className={styles.tableContainer}>
        <table className={styles.recordsTable}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Primary Diagnosis</th>
              <th>Consulting Physician</th>
              <th>Date Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id} className={styles.tableRow}>
                <td className={styles.patientId}>{record.patientId}</td>
                <td className={styles.patientName}>{record.fullName}</td>
                <td>{new Date(record.dateOfBirth).toLocaleDateString()}</td>
                <td>{record.gender}</td>
                <td className={styles.diagnosis}>{record.primaryDiagnosis}</td>
                <td>{record.consultingPhysician}</td>
                <td>{new Date(record.createdDate).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.status} ${styles[record.status.toLowerCase()]}`}>
                    {record.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                      className={`${styles.actionBtn} ${styles.view}`}
                    onClick={() => handleViewRecord(record)}
                    title="View Details"
                  >
                    {/* <FontAwesomeIcon icon={faEye} /> */}View
                  </button>
                  <button   className={`${styles.actionBtn} ${styles.update}`} title="Update">
                    {/* <FontAwesomeIcon icon={faEdit} /> */}Update
                  </button>
                  <button   className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                    {/* <FontAwesomeIcon icon={faTrash} /> */}Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* record detail modal */}
      {showDetails && selectedRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.detailsContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <FontAwesomeIcon icon={faUser} className={styles.modalIcon} />
                Medical Record Details - {selectedRecord.fullName}
              </h2>
              <button className={styles.closeButton} onClick={handleCloseDetails}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.detailsContent}>
              <div className={styles.detailsGrid}>
                {/* personal details */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faUser} /> Personal Details
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Full Name:</strong> {selectedRecord.fullName}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Date of Birth:</strong> {new Date(selectedRecord.dateOfBirth).toLocaleDateString()}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Gender:</strong> {selectedRecord.gender}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Blood Type:</strong> {selectedRecord.bloodType}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Phone:</strong> {selectedRecord.phone}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Email:</strong> {selectedRecord.email}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Address:</strong> {selectedRecord.address}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Emergency Contact:</strong> {selectedRecord.emergencyContact}
                    </div>
                  </div>
                </div>

                {/* medical history */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faHistory} /> Medical History
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Allergies:</strong> {selectedRecord.allergies}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Chronic Conditions:</strong> {selectedRecord.chronicConditions}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Previous Surgeries:</strong> {selectedRecord.previousSurgeries}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Family History:</strong> {selectedRecord.familyHistory}
                    </div>
                  </div>
                </div>

                {/* growth milestones */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faRuler} /> Growth Milestones
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Height:</strong> {selectedRecord.height} cm
                    </div>
                    <div className={styles.detailField}>
                      <strong>Weight:</strong> {selectedRecord.weight} kg
                    </div>
                    <div className={styles.detailField}>
                      <strong>BMI:</strong> {selectedRecord.bmi}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Notes:</strong> {selectedRecord.growthNotes}
                    </div>
                  </div>
                </div>

                {/* current symptoms */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faStethoscope} /> Current Symptoms
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Chief Complaint:</strong> {selectedRecord.chiefComplaint}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Description:</strong> {selectedRecord.symptomsDescription}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Duration:</strong> {selectedRecord.symptomsDuration}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Pain Scale:</strong> {selectedRecord.painScale}/10
                    </div>
                  </div>
                </div>

                {/* diagnosis */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faDiagnoses} /> Diagnosis
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Primary Diagnosis:</strong> {selectedRecord.primaryDiagnosis}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Secondary Diagnosis:</strong> {selectedRecord.secondaryDiagnosis}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Diagnosis Date:</strong> {new Date(selectedRecord.diagnosisDate).toLocaleDateString()}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Diagnostic Tests:</strong> {selectedRecord.diagnosticTests}
                    </div>
                  </div>
                </div>

                {/* treatment plan */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faNotesMedical} /> Treatment Plan
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Goals:</strong> {selectedRecord.treatmentGoals}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Treatments:</strong> {selectedRecord.recommendedTreatments}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Lifestyle:</strong> {selectedRecord.lifestyle}
                    </div>
                  </div>
                </div>

                {/* medications */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faPrescriptionBottle} /> Medications
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Medications:</strong> {selectedRecord.medications}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Dosage:</strong> {selectedRecord.dosage}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Frequency:</strong> {selectedRecord.frequency}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Duration:</strong> {selectedRecord.duration}
                    </div>
                  </div>
                </div>

                {/* consultation notes */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faNotesMedical} /> Consultation Notes
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Consultation Date:</strong> {new Date(selectedRecord.consultationDate).toLocaleDateString()}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Physician:</strong> {selectedRecord.consultingPhysician}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Clinical Notes:</strong> {selectedRecord.clinicalNotes}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Recommendations:</strong> {selectedRecord.recommendations}
                    </div>
                  </div>
                </div>

                {/* follow-up */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Follow-up Appointment
                  </h3>
                  <div className={styles.detailFields}>
                    <div className={styles.detailField}>
                      <strong>Follow-up Date:</strong> {new Date(selectedRecord.followUpDate).toLocaleDateString()}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Type:</strong> {selectedRecord.followUpType}
                    </div>
                    <div className={styles.detailField}>
                      <strong>Notes:</strong> {selectedRecord.followUpNotes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <FontAwesomeIcon icon={faPlus} className={styles.modalIcon} />
                Create New Medical Record
              </h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.medicalForm}>
              <div className={styles.formContent}>
                {formSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <FontAwesomeIcon icon={section.icon} className={styles.sectionIcon} />
                      <h3 className={styles.sectionTitle}>{section.title}</h3>
                    </div>
                    
                    <div className={styles.sectionContent}>
                      <div className={styles.fieldsGrid}>
                        {section.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              {field.label}
                              {field.required && <span className={styles.required}>*</span>}
                            </label>
                            
                            {field.type === 'textarea' ? (
                              <textarea
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                className={styles.fieldTextarea}
                                required={field.required}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                className={styles.fieldSelect}
                                required={field.required}
                              >
                                <option value="">Select {field.label}</option>
                                {field.options.map((option, optionIndex) => (
                                  <option key={optionIndex} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                className={styles.fieldInput}
                                required={field.required}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Medical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalRecordsPage