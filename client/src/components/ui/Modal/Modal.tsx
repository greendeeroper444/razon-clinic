import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import styles from './Modal.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { AppointmentForm, BillingsForm, BillingDetailsForm, BlockedTimeSlotForm, DeleteForm, InventoryItemForm, MedicalRecordForm, PatientForm, StatusForm } from '../../features/Forms'
import { formatDateForDisplay, formatDateForInput } from '../../../utils'
import { AppointmentFormData, AppointmentStatus, BillingFormData, BlockedTimeSlotFormData, FormDataType, InventoryItemFormData, MedicalRecordFormData, ModalProps, PatientFormData } from '../../../types'
import Button from '../Button/Button'


const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    modalType,
    onSubmit,
    editData = null,
    deleteData = null,
    isProcessing = false,
    isRestockMode,
    isAddQuantityMode,
    billingId 
}) => {
    const [formData, setFormData] = useState<FormDataType>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [saveAsNew, setSaveAsNew] = useState<boolean>(false);


    //initialize form with edit data if provided or reset when modal type changes
    useEffect(() => {
        //reset saveAsNew flag when modal opens/closes or editData changes
        setSaveAsNew(false);
        
        if (editData) {
            //format birthdate for input field if it exists
            const processedEditData = { ...editData };
            if ((modalType === 'appointment' || modalType === 'patient') && 'birthdate' in processedEditData && processedEditData.birthdate) {
                processedEditData.birthdate = formatDateForInput(processedEditData.birthdate as string);
            }
            
            setFormData(processedEditData);

            //set initial status for status modal
            if (modalType === 'status' && 'status' in editData && editData.status) {
                setSelectedStatus(editData.status as string);
            }
        } else {
            //set default values based on modal type
            if (modalType === 'appointment') {
                setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    //initialize all patient information fields
                    birthdate: '',
                    sex: '',
                    height: '',
                    weight: '',
                    
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
                    religion: '',
                    preferredDate: '',
                    preferredTime: '',
                    reasonForVisit: '',
                    status: 'Pending',
                } as AppointmentFormData);
            } else if (modalType === 'patient') {
                setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    email: '',
                    contactNumber: '',
                    birthdate: '',
                    sex: '',
                    address: '',
                    religion: '',
                    height: '',
                    weight: '',
                    bloodPressure: {
                        systolic: '',
                        diastolic: ''
                    },
                    temperature: '',
                    motherInfo: {
                        name: '',
                        age: '',
                        occupation: ''
                    },
                    fatherInfo: {
                        name: '',
                        age: '',
                        occupation: ''
                    }
                } as PatientFormData);
            } else if (modalType === 'item') {
                setFormData({
                    itemName: '',
                    category: '',
                    price: 0,
                    quantityInStock: 0,
                    quantityUsed: 0,
                    expiryDate: '',
                    medicine: '',
                    minLevel: 0,
                    expirationDate: '',
                    location: '',
                } as InventoryItemFormData);
            } else if (modalType === 'blockedTimeSlot') {
                setFormData({
                    startDate: '',
                    endDate: '',
                    startTime: '',
                    endTime: '',
                    reason: '',
                    customReason: ''
                } as BlockedTimeSlotFormData);
            } else if (modalType === 'medical') {
                setFormData({
                    appointmentId: '',
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
            } else if (modalType === 'billing') {
                setFormData({
                    medicalRecordId: '',
                    patientName: '',
                    itemName: [],
                    itemQuantity: [],
                    itemPrices: [],
                    amount: 0,
                    paymentStatus: 'Unpaid',
                    medicalRecordDate: new Date().toISOString()
                } as BillingFormData);
            } else if (modalType === 'status') {
                setSelectedStatus('Pending');
            } else {
                setFormData({});
            }
        }
    }, [modalType, editData]);

    //create a custom event when modal closes
    const handleClose = () => {
        setSaveAsNew(false);
        onClose();
        //dispatch a custom event that the modal has been closed
        window.dispatchEvent(new CustomEvent('modal-closed'));
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


    const handleStatusChange = (status: string) => {
        setSelectedStatus(status as AppointmentStatus);
    };
    
    //we can clear field after submit
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (modalType === 'delete' && deleteData) {
            onSubmit(deleteData.id);
        } else if (modalType === 'status') {
            onSubmit({ ...editData, status: selectedStatus } as any);
        } else if (modalType === 'medical' && saveAsNew) {
            // Remove the id to create a new record instead of updating
            const { id, ...dataWithoutId } = formData as any;
            onSubmit(dataWithoutId);
        } else {
            onSubmit(formData);
            
            //clear fields for appoitment
            if (modalType === 'appointment') {
                setFormData(prev => ({
                    ...prev,
                    preferredTime: '',
                }));
            }
        }
        // handleClose();
    };

    //handler for "Save as New" button
    const handleSaveAsNew = (e: FormEvent) => {
        e.preventDefault();
        setSaveAsNew(true);
        //trigger form submission
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        e.currentTarget.closest('form')?.dispatchEvent(submitEvent);
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
        case 'blockedTimeSlot':
            title = editData ? 'Edit Blocked Time Slot' : 'Block New Time Slot';
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
        case 'billing':
            title = editData ? 'Edit Billing' : 'New Billing';
            break;
        case 'billing-details':
            title = 'Billing Details';
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
                    />
                );
            case 'patient':
                return (
                    <>
                        {/* display birthdate if editing and birthdate exists */}
                        {
                            editData && (editData as PatientFormData).birthdate && (
                                <div className={styles.birthdateDisplay}>
                                    <p><strong>Current Birthdate:</strong> {formatDateForDisplay((editData as PatientFormData).birthdate as string)}</p>
                                </div>
                            )
                        }
                        <PatientForm
                            formData={formData as PatientFormData}
                            onChange={handleChange}
                        />
                    </>
                );
            case 'item':
                return (
                    <InventoryItemForm
                        formData={formData as InventoryItemFormData}
                        onChange={handleChange}
                        isRestockMode={isRestockMode}
                        isAddQuantityMode={isAddQuantityMode}
                    />
                );
            case 'blockedTimeSlot':
                return (
                    <BlockedTimeSlotForm
                        formData={formData as BlockedTimeSlotFormData}
                        onChange={handleChange}
                    />
                );
            case 'medical':
                return (
                    <MedicalRecordForm
                        formData={formData as MedicalRecordFormData}
                        onChange={handleChange}
                        isLoading={isLoading}
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
            case 'billing':
                return (
                    <BillingsForm
                        formData={formData as BillingFormData}
                        onChange={handleChange}
                        isLoading={isLoading}
                    />
                );
            case 'billing-details':
                return billingId ? (
                    <BillingDetailsForm billingId={billingId} />
                ) : (
                    <p>Missing billing ID</p>
                );
            default:
                return <p>Unknown form type</p>;
        }
    };

    //no need the form submit or footer buttons
    if (modalType === 'delete' || modalType === 'billing-details') {
        return (
            <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} ${styles.deleteModal}`}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{title}</h2>
                        <Button
                            variant='close'
                            type='button'
                            title='Close'
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
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
                <Button
                    variant='close'
                    type='button'
                    title='Close'
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                    {renderFormContent()}
                </div>

                <div className={styles.modalFooter}>
                    <Button
                        variant='secondary'
                        type='button'
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    
                    {
                        modalType === 'medical' && editData && (
                            <Button
                                variant='outline'
                                type='button'
                                onClick={handleSaveAsNew}
                                isLoading={isProcessing && saveAsNew}
                                loadingText='Creating New...'
                                title='Save as a new record instead of updating the existing one'
                            >
                                Save as New
                            </Button>
                        )
                    }
                    
                    <Button
                        variant='primary'
                        type='submit'
                        isLoading={isProcessing && !saveAsNew}
                        loadingText={editData ? 'Updating...' : 'Saving...'}
                    >
                        {editData ? 'Update' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Modal