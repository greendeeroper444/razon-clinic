import React, { useEffect, useState } from 'react'
import { User, Calendar, CreditCard, FileText, DollarSign } from 'lucide-react'
import style from './BillingDetailsForm.module.css'
import { formatDate, getMedicalRecordId, getStatusClass } from '../../../../utils';
import { useBillingStore } from '../../../../stores';

interface BillingDetailsFormProps {
  billingId: string;
}

const BillingDetailsForm: React.FC<BillingDetailsFormProps> = ({ billingId }) => {
    const { currentBilling, fetchLoading, fetchBillingById, clearCurrentBilling } = useBillingStore();
    const [hasError, setHasError] = useState(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const loadBilling = async () => {
        if (!billingId) {
            setHasError(true);
            setIsLoadingLocal(false);
            return;
        }

        try {
            setIsLoadingLocal(true);
            setHasError(false);
            await fetchBillingById(billingId);
            
            if (isMounted) {
                setIsLoadingLocal(false);
            }
        } catch (error) {
            console.error('Error loading billing:', error);
            if (isMounted) {
                setHasError(true);
                setIsLoadingLocal(false);
                }
            }
        };

        loadBilling();

        return () => {
            isMounted = false;
            clearCurrentBilling();
        };
    }, [billingId]);

    if (isLoadingLocal || fetchLoading) {
        return (
            <div className={style.loading}>
                <div className={style.spinner}></div>
                <p>Loading billing details...</p>
            </div>
        );
    }

    if (hasError || !currentBilling) {
        return (
            <div className={style.error}>
                <p>Failed to load billing details. Please try again.</p>
            </div>
        );
    }

  return (
    <div className={style.detailsContainer}>
        <div className={style.section}>
            <div className={style.sectionHeader}>
                <User size={18} />
                <h3>Patient Information</h3>
            </div>
            <div className={style.detailsGrid}>
                <div className={style.detailItem}>
                    <span className={style.label}>Patient Name:</span>
                    <span className={style.value}>{currentBilling.patientName || 'N/A'}</span>
                </div>
                <div className={style.detailItem}>
                    <span className={style.label}>Medical Record:</span>
                    <span className={style.value}>
                        {getMedicalRecordId(currentBilling.medicalRecordId)}
                    </span>
                </div>
            </div>
        </div>

        <div className={style.section}>
            <div className={style.sectionHeader}>
                <FileText size={18} />
                <h3>Billing Information</h3>
            </div>
            <div className={style.detailsGrid}>
                <div className={style.detailItem}>
                    <span className={style.label}>Bill ID:</span>
                    <span className={style.value}>{currentBilling.id || 'N/A'}</span>
                </div>
                <div className={style.detailItem}>
                    <span className={style.label}>Date Issued:</span>
                    <span className={style.value}>
                        <Calendar size={14} className={style.icon} />
                        {formatDate(currentBilling.createdAt)}
                    </span>
                </div>
                <div className={style.detailItem}>
                    <span className={style.label}>Description:</span>
                    <span className={style.value}>
                        {currentBilling.description || 'No description provided'}
                    </span>
                </div>
            </div>
        </div>

        <div className={style.section}>
            <div className={style.sectionHeader}>
                <DollarSign size={18} />
                <h3>Payment Information</h3>
            </div>
            <div className={style.detailsGrid}>
                <div className={style.detailItem}>
                    <span className={style.label}>Amount:</span>
                    <span className={`${style.value} ${style.amount}`}>
                    ₱{(currentBilling.amount || 0).toFixed(2)}
                    </span>
                </div>
                <div className={style.detailItem}>
                    <span className={style.label}>Payment Status:</span>
                    <span className={`${style.statusBadge} ${getStatusClass(currentBilling.paymentStatus, style)}`}>
                        <CreditCard size={14} className={style.icon} />
                        {currentBilling.paymentStatus}
                    </span>
                </div>
                {
                    currentBilling.paymentMethod && (
                        <div className={style.detailItem}>
                            <span className={style.label}>Payment Method:</span>
                            <span className={style.value}>{currentBilling.paymentMethod}</span>
                        </div>
                    )
                }

                {
                    currentBilling.updatedAt && (
                        <div className={style.detailItem}>
                            <span className={style.label}>Last Updated:</span>
                            <span className={style.value}>{formatDate(currentBilling.updatedAt)}</span>
                        </div>
                    )
                }
            </div>
        </div>

        {
            currentBilling.notes && (
                <div className={style.section}>
                    <div className={style.sectionHeader}>
                        <FileText size={18} />
                        <h3>Additional Notes</h3>
                    </div>
                    <div className={style.notesContent}>
                        <p>{currentBilling.notes}</p>
                    </div>
                </div>
            )
        }
     </div>
  )
}

export default BillingDetailsForm