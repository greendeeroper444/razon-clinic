import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import styles from './Modal.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { AppointmentForm, BillingsForm, BillingDetailsForm, BlockedTimeSlotForm, CancelAppointmentForm, DeleteForm, InventoryItemForm, MedicalRecordForm, PatientForm, PersonnelForm, StatusForm } from '../../features/Forms'
import { formatDateForDisplay, formatDateForInput } from '../../../utils'
import { AppointmentFormData, AppointmentStatus, BillingFormData, BlockedTimeSlotFormData, FormDataType, InventoryItemFormData, MedicalRecordFormData, ModalProps, PatientFormData, PersonnelFormData } from '../../../types'
import Button from '../Button/Button'


const Modal: React.FC<ModalProps & { isNewRecord?: boolean }> = ({
    isOpen,
    onClose,
    modalType,
    onSubmit,
    editData = null,
    deleteData = null,
    isProcessing = false,
    isRestockMode,
    isAddQuantityMode,
    billingId,
    isNewRecord = false
}) => {
    const [formData, setFormData] = useState<FormDataType>({} as FormDataType);
    const [isLoading, _setIsLoading] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [cancellationReason, setCancellationReason] = useState<string>('');

    useEffect(() => {
        // exit early for cancel modal — reset once on open, then don't interfere while typing
        if (modalType === 'cancel') {
            setCancellationReason('');
            return;
        }

        if (editData) {
            const processedEditData = { ...editData };
            if ((modalType === 'appointment' || modalType === 'patient' || modalType === 'personnel') && 'birthdate' in processedEditData && processedEditData.birthdate) {
                processedEditData.birthdate = formatDateForInput(processedEditData.birthdate as string);
            }
            
            if (modalType === 'personnel') {
                const personnelData = processedEditData as any;
                if (!personnelData.contactNumber && personnelData.email && 'contactNumber' in processedEditData) {
                    processedEditData.contactNumber = personnelData.email;
                }
            }
            
            setFormData(processedEditData);

            if (modalType === 'status' && 'status' in editData && editData.status) {
                setSelectedStatus(editData.status as string);
            }
        } else {
            if (modalType === 'appointment') {
                setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    birthdate: '',
                    sex: '',
                    height: '',
                    weight: '',
                    temperature: '',
                    bloodPressure: {
                        systolic: '',
                        diastolic: ''
                    },
                    motherName: '',
                    motherAge: '',
                    motherOccupation: '',
                    fatherName: '',
                    fatherAge: '',
                    fatherOccupation: '',
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
            } else if (modalType === 'personnel') {
                setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    email: '',
                    contactNumber: '',
                    password: '',
                    birthdate: '',
                    sex: '',
                    address: '',
                    role: ''
                } as FormDataType);
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
                    reason: 'Other',
                    customReason: ''
                } as BlockedTimeSlotFormData);
            } else if (modalType === 'medical') {
                setFormData({
                    appointmentId: '',
                    fullName: '',
                    dateOfBirth: '',
                    gender: '',
                    bloodType: '',
                    address: '',
                    phone: '',
                    email: '',
                    emergencyContact: '',
                    allergies: '',
                    chronicConditions: '',
                    previousSurgeries: '',
                    familyHistory: '',
                    height: '',
                    weight: '',
                    bmi: '',
                    growthNotes: '',
                    chiefComplaint: '',
                    symptomsDescription: '',
                    symptomsDuration: '',
                    painScale: '',
                    diagnosis: '',
                    treatmentPlan: '',
                    prescribedMedications: '',
                    consultationNotes: '',
                    followUpDate: '',
                    vaccinationHistory: ''
                } as MedicalRecordFormData);
            } else if (modalType === 'billing') {
                setFormData({
                    id: '',
                    medicalRecordId: '',
                    patientName: '',
                    itemName: [],
                    itemQuantity: [],
                    itemPrices: [],
                    doctorFee: 0,
                    amount: 0,
                    discount: 0,
                    amountPaid: 0,
                    change: 0,
                    paymentStatus: 'Unpaid',
                    medicalRecordDate: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                } as BillingFormData);
            } else if (modalType === 'status') {
                setSelectedStatus('Pending');
            } else {
                setFormData({} as FormDataType);
            }
        }
    }, [modalType, editData]);

    const handleClose = () => {
        onClose();
        window.dispatchEvent(new CustomEvent('modal-closed'));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            setFormData((prevData: FormDataType) => ({
                ...prevData,
                [parentKey]: {
                    ...((prevData as any)[parentKey] || {}),
                    [childKey]: childKey === 'age' ? (value === '' ? undefined : Number(value)) : value
                }
            }));
        } else {
            setFormData((prevData: FormDataType) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status as AppointmentStatus);
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (modalType === 'delete' && deleteData) {
            onSubmit(deleteData.id);
        } else if (modalType === 'status') {
            onSubmit({ ...editData, status: selectedStatus } as any);
        } else if (modalType === 'cancel') {
            if (!cancellationReason.trim()) return;
            onSubmit({ cancellationReason: cancellationReason.trim() } as any);
        } else {
            onSubmit(formData);
            if (modalType === 'appointment') {
                setFormData((prev: FormDataType) => ({
                    ...prev,
                    preferredTime: '',
                }));
            }
        }
    };

    const handleSaveAsNew = (e: FormEvent) => {
        e.preventDefault();
        const { id: _, ...dataWithoutId } = formData as any;
        onSubmit(dataWithoutId);
    };

    const handleConfirmDelete = () => {
        if (deleteData) {
            onSubmit(deleteData.id);
        }
    };

    if (!isOpen) return null;

    const isEditing = !!editData && !isNewRecord;

    let title = '';
    switch (modalType) {
        case 'appointment':
            title = isEditing ? 'Edit Appointment' : 'New Appointment';
            break;
        case 'patient':
            title = isEditing ? 'Edit Patient' : 'New Patient';
            break;
        case 'personnel':
            title = isEditing ? 'Edit Personnel' : 'New Personnel';
            break;
        case 'item':
            title = isEditing ? 'Edit Inventory Item' : 'New Inventory Item';
            break;
        case 'blockedTimeSlot':
            title = isEditing ? 'Edit Blocked Time Slot' : 'Block New Time Slot';
            break;
        case 'medical':
            title = isEditing ? 'Edit Medical Record' : isNewRecord ? 'Create as New Record' : 'New Medical Record';
            break;
        case 'delete':
            title = 'Confirm Delete';
            break;
        case 'status':
            title = 'Update Status';
            break;
        case 'billing':
            title = isEditing ? 'Edit Billing' : 'New Billing';
            break;
        case 'billing-details':
            title = 'Billing Details';
            break;
        case 'cancel':
            title = 'Cancel Appointment';
            break;
        default:
            title = 'Form';
    }

    const renderFormContent = () => {
        switch (modalType) {
            case 'appointment':
                return (
                    <AppointmentForm
                        formData={formData as AppointmentFormData}
                        onChange={handleChange}
                        isLoading={isLoading}
                        patients={[]}
                    />
                );
            case 'patient':
                return (
                    <>
                        {
                            isEditing && (editData as PatientFormData).birthdate && (
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
            case 'personnel':
                return (
                    <PersonnelForm
                        formData={formData as PersonnelFormData}
                        onChange={handleChange}
                    />
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
            case 'cancel':
                return (
                    <CancelAppointmentForm
                        reason={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
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
                        {modalType === 'cancel' ? 'Go Back' : 'Cancel'}
                    </Button>

                    {
                        modalType === 'medical' && (isEditing || isNewRecord) && (
                            <Button
                                variant='primary'
                                type='button'
                                onClick={handleSaveAsNew}
                                isLoading={isProcessing}
                                loadingText='Creating New...'
                                title='Save as a new record instead of updating the existing one'
                            >
                                Save as New
                            </Button>
                        )
                    }

                    {
                        !(isNewRecord && modalType === 'medical') && (
                            <Button
                                variant={modalType === 'cancel' ? 'danger' : 'primary'}
                                type='submit'
                                isLoading={isProcessing}
                                loadingText={modalType === 'cancel' ? 'Cancelling...' : isEditing ? 'Updating...' : 'Saving...'}
                                disabled={modalType === 'cancel' && !cancellationReason.trim()}
                            >
                                {modalType === 'cancel' ? 'Confirm Cancellation' : isEditing ? 'Update' : 'Save'}
                            </Button>
                        )
                    }
                </div>
            </form>
        </div>
    </div>
  )
}

export default Modal