import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import styles from './ModalComponent.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { AppointmentFormData, InventoryItemFormData, MedicalRecordFormData } from '../../types';
import { getPatients } from '../../pages/services/patientService';


import { Patient } from '../../types/patient';
import { DeleteData, FormDataType } from '../../types/crud';
import { PersonalPatientFormData } from '../../types/personalPatient';
import { AppointmentForm, DeleteForm, InventoryItemForm, MedicalRecordForm, PatientForm, StatusForm } from '../Forms';




type ModalType = 'appointment' | 'patient' | 'medical' | 'item' | 'delete' | 'status';

interface ModalComponentProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: ModalType;
    onSubmit: (data: FormDataType | string) => void;
    patients?: Array<Patient>;
    editData?: FormDataType | null;
    deleteData?: DeleteData | null;
    isProcessing?: boolean;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
    isOpen,
    onClose,
    modalType,
    onSubmit,
    patients = [],
    editData = null,
    deleteData = null,
    isProcessing = false
}) => {
    const [formData, setFormData] = useState<FormDataType>({});
    const [loadedPatients, setLoadedPatients] = useState<Patient[]>(patients);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    //helper function to format date for input field
    const formatDateForInput = (dateString: string | Date): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };

    //helper function to format date for display
    const formatDateForDisplay = (dateString: string | Date): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    //initialize form with edit data if provided or reset when modal type changes
    useEffect(() => {
        if (editData) {
            //format birthdate for input field if it exists
            const processedEditData = { ...editData };
            if (processedEditData.birthdate) {
                processedEditData.birthdate = formatDateForInput(processedEditData.birthdate as string);
            }
            
            setFormData(processedEditData);

            //set initial status for status modal
            if (modalType === 'status' && editData.status) {
                setSelectedStatus(editData.status as string);
            }
        } else {
            //set default values based on modal type
            if (modalType === 'appointment') {
                setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    preferredDate: '',
                    preferredTime: '',
                    reasonForVisit: '',
                    status: 'Pending',
                    
                    //initialize all patient information fields
                    birthdate: '',
                    sex: '',
                    height: '',
                    weight: '',
                    religion: '',
                    
                    //flattened parent information fields
                    motherName: '',
                    motherAge: '',
                    motherOccupation: '',
                    fatherName: '',
                    fatherAge: '',
                    fatherOccupation: '',
                    
                    //nested parent information objects
                    motherInfo: {
                        name: '',
                        age: '',
                        occupation: ''
                    },
                    fatherInfo: {
                        name: '',
                        age: '',
                        occupation: ''
                    },
                    contactNumber: '',
                    address: '',
                } as AppointmentFormData);
            } else if (modalType === 'patient') {
                setFormData({
                    fullName: '',
                    email: '',
                    contactNumber: '',
                    birthdate: '',
                    sex: '',
                    address: '',
                    religion: '',
                    motherInfo: {
                        name: '',
                        age: undefined,
                        occupation: ''
                    },
                    fatherInfo: {
                        name: '',
                        age: undefined,
                        occupation: ''
                    }
                } as PersonalPatientFormData);
            } if (modalType === 'medical') {
                setFormData({
                    //personal details
                    fullName: '',
                    dateOfBirth: '',
                    gender: '',
                    bloodType: '',
                    address: '',
                    phone: '',
                    email: '',
                    emergencyContact: '',

                    //medical History
                    allergies: '',
                    chronicConditions: '',
                    previousSurgeries: '',
                    familyHistory: '',

                    //growth Milestones
                    height: '',
                    weight: '',
                    bmi: '',
                    growthNotes: '',

                    //current Symptoms
                    chiefComplaint: '',
                    symptomsDescription: '',
                    symptomsDuration: '',
                    painScale: '',

                    //additional fields (existing)
                    diagnosis: '',
                    treatmentPlan: '',
                    prescribedMedications: '',
                    consultationNotes: '',
                    followUpDate: '',
                    vaccinationHistory: ''
                } as MedicalRecordFormData);
            } else if (modalType === 'status') {
                setSelectedStatus('Pending');
            } else {
                setFormData({});
            }
        }
    }, [modalType, editData]);

    //fetch patients when appointment modal opens
    useEffect(() => {
        if (isOpen && modalType === 'appointment' && loadedPatients.length === 0) {
            fetchPatients();
        }
    }, [isOpen, modalType]);

    //create a custom event when modal closes
    const handleClose = () => {
        onClose();
        //dispatch a custom event that the modal has been closed
        window.dispatchEvent(new CustomEvent('modal-closed'));
    };

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const response = await getPatients();
            setLoadedPatients(response.data.patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        //handle nested object properties (e.g., motherInfo.name, fatherInfo.age)
        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            setFormData(prevData => ({
                ...prevData,
                [parentKey]: {
                    ...((prevData as any)[parentKey] || {}),
                    [childKey]: childKey === 'age' ? (value === '' ? undefined : Number(value)) : value
                }
            }));
        } else {
            //handle flat properties
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (modalType === 'delete' && deleteData) {
            onSubmit(deleteData.id);
        } else if (modalType === 'status') {
            onSubmit({ ...editData, status: selectedStatus });
        } else {
            onSubmit(formData);
        }
        handleClose();
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };
    
    const handleConfirmDelete = () => {
        if (deleteData) {
            onSubmit(deleteData.id);
        }
    };

    //don't render if modal is not open
    if (!isOpen) return null;

    //determine title based on modal type and edit status
    let title = '';
    switch (modalType) {
        case 'appointment':
            title = editData ? 'Edit Appointment' : 'New Appointment';
            break;
        case 'patient':
            title = editData ? 'Edit Patient' : 'New Patient';
            break;
        case 'item':
            title = editData ? 'Edit Inventory Item' : 'New Inventory Item';
            break;
        case 'medical':
            title = editData ? 'Edit Medical Record' : 'New Medical Record';
            break;
        case 'delete':
            title = 'Confirm Delete';
            break;
        case 'status':
            title = 'Update Status';
            break;
        default:
            title = 'Form';
    }

    //render content based on modal type
    const renderFormContent = () => {
        switch (modalType) {
            case 'appointment':
                return (
                    <AppointmentForm
                        formData={formData as AppointmentFormData}
                        onChange={handleChange}
                        isLoading={isLoading}
                        patients={loadedPatients}
                    />
                );
            case 'patient':
                return (
                    <>
                        {/* display birthdate if editing and birthdate exists */}
                        {
                            editData && (editData as PersonalPatientFormData).birthdate && (
                                <div className={styles.birthdateDisplay}>
                                    <p><strong>Current Birthdate:</strong> {formatDateForDisplay((editData as PersonalPatientFormData).birthdate as string)}</p>
                                </div>
                            )
                        }
                        <PatientForm
                            formData={formData as PersonalPatientFormData}
                            onChange={handleChange}
                        />
                    </>
                );
            case 'item':
                return (
                    <InventoryItemForm
                        formData={formData as InventoryItemFormData}
                        onChange={handleChange}
                    />
                );
            case 'medical':
                return (
                    <MedicalRecordForm
                        formData={formData as MedicalRecordFormData}
                        onChange={handleChange}
                        isLoading={isLoading}
                        patients={loadedPatients}
                    />
                );
            case 'status':
                return (
                    <StatusForm
                        currentStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                    />
                );
            case 'delete':
                return deleteData ? (
                    <DeleteForm
                        itemName={deleteData.itemName}
                        itemType={deleteData.itemType}
                        onCancel={handleClose}
                        onConfirm={handleConfirmDelete}
                        isDeleting={isProcessing}
                    />
                ) : (
                    <p>Missing delete information</p>
                );
            default:
                return <p>Unknown form type</p>;
        }
    };

    //for delete modal, we don't need the form submit or footer buttons
    if (modalType === 'delete') {
        return (
            <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} ${styles.deleteModal}`}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{title}</h2>
                        <button
                            type='button'
                            className={styles.closeButton}
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className={styles.modalBody}>
                        {renderFormContent()}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{title}</h2>
                <button
                    type='button'
                    className={styles.closeButton}
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                    {renderFormContent()}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        type='button'
                        className={styles.btnSecondary}
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        className={styles.btnPrimary}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default ModalComponent