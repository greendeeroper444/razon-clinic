import { useState, useEffect, useMemo } from 'react'
import styles from './BillingsPaymentPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch, faDownload, faCreditCard, faCheck, faExclamationTriangle, faTimes, faUser, faCalendar, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { BillingFormData, BillingResponse, FormDataType } from '../../../types'
import { Header, Main, Modal, SubmitLoading } from '../../../components'
import { OpenModalProps } from '../../../hooks/hook'
import { formatDate, getLoadingText, getMedicalRecordId, getPaymentStatusClass, getStatusIcon, openModalWithRefresh } from '../../../utils'
import { useBillingStore } from '../../../stores'

const BillingsPaymentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<BillingResponse | null>(null);
    
    //zustand store selectors
    const {
        billings,
        submitLoading,
        loading,
        error,
        isModalOpen,
        isDeleteModalOpen,
        selectedBilling,
        deleteBillingData,
        isProcessing,
        currentPage,
        totalPages,
        totalRecords,
        searchTerm,
        filterStatus,
        fetchBillings,
        setSearchTerm,
        setFilterStatus,
        applyFilters,
        setCurrentPage,
        // openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        addBilling,
        updateBillingData,
        deleteBilling,
        processPayment,
        exportBillings,
        currentOperation
    } = useBillingStore();

    //debounce search and filter changes
    useEffect(() => {
        // const timeoutId = setTimeout(() => {
        //     applyFilters();
        // }, 500); //debounce search

        // return () => clearTimeout(timeoutId);
        applyFilters();
    }, [searchTerm, filterStatus, applyFilters]);

    useEffect(() => {
        fetchBillings();
    }, [fetchBillings]);

    // const handleOpenModal = () => {
    //     if (openModal) {
    //         openModal('billing');
    //     } else {
    //         openAddModal();
    //     }
    // };
    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'billing',
            openModal,
            onRefresh: () => fetchBillings(currentPage, searchTerm, filterStatus),
        });
    };
    
    const handleExport = async () => {
        await exportBillings();
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing billing ID');
            return;
        }

        const billingData = data as BillingFormData;

        try {
            if (selectedBill?.id) {
                await updateBillingData(selectedBill.id, billingData);
            } else {
                await addBilling(billingData);
            }
        } catch (error) {
            console.error('Error updating billing:', error);
        }
    };

    const handleProcessPayment = async (billId: string) => {
        await processPayment(billId);
    };

    const handleViewDetails = (billId: string) => {
        const bill = billings.find(b => b.id === billId);
        setSelectedBill(bill || null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBill(null);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // const handleDeleteBilling = (billing: BillingResponse) => {
    //     openDeleteModal(billing);
    // };

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid billing ID');
            return;
        }

        try {
            await deleteBilling(data);
        } catch (error) {
            console.error('Error deleting billing:', error);
        }
    };

    

    //calculate summary data using useMemo for performance
    const summaryData = useMemo(() => {
        const totalAmount = billings.reduce((sum, bill) => sum + (bill.amount || 0), 0);
        const paidAmount = billings.filter(bill => bill.paymentStatus === 'Paid').reduce((sum, bill) => sum + (bill.amount || 0), 0);
        const unpaidAmount = billings.filter(bill => bill.paymentStatus === 'Unpaid').reduce((sum, bill) => sum + (bill.amount || 0), 0);
        
        return { totalAmount, paidAmount, unpaidAmount };
    }, [billings]);

    const headerActions = [
        {
            id: 'newBillingBtn',
            label: 'New Billing',
            icon: faPlus,
            onClick: handleOpenModal,
            type: 'primary' as const
        },
        {
            label: 'Export',
            icon: faDownload,
            onClick: handleExport,
            type: 'outline' as const
        }
    ];

  return (
    <Main loading={loading} error={error} loadingMessage='Loading billings...'>
        <Header
            title='Billing & Payments'
            actions={headerActions}
        />

        {/* summary cards */}
        <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                    <FontAwesomeIcon icon={faCreditCard} />
                </div>
                <div className={styles.cardContent}>
                    <h3>Total Revenue</h3>
                    <p className={styles.cardAmount}>₱{summaryData.totalAmount.toFixed(2)}</p>
                </div>
            </div>
            <div className={styles.summaryCard}>
                <div className={`${styles.cardIcon} ${styles.iconSuccess}`}>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className={styles.cardContent}>
                    <h3>Paid Amount</h3>
                    <p className={`${styles.cardAmount} ${styles.amountSuccess}`}>₱{summaryData.paidAmount.toFixed(2)}</p>
                </div>
            </div>
            <div className={styles.summaryCard}>
                <div className={`${styles.cardIcon} ${styles.iconDanger}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <div className={styles.cardContent}>
                    <h3>Outstanding</h3>
                    <p className={`${styles.cardAmount} ${styles.amountDanger}`}>₱{summaryData.unpaidAmount.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* search and filter section */}
        <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by patient name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.filterControls}>
                <select 
                    title='Select Status'
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Unpaid">Unpaid</option>
                </select>
            </div>
        </div>

        {/* error message */}
        {
            error && (
                <div className={styles.errorMessage}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{error}</span>
                    <button type='button' onClick={() => fetchBillings()}>
                        Retry
                    </button>
                </div>
            )
        }

        {/* loading state */}
        {
            loading && (
                <div className={styles.loadingState}>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Loading billing data...</span>
                </div>
            )
        }

        {/* billing table */}
        {
            !loading && !error && (
                <div className={styles.tableContainer}>
                    <table className={styles.billingTable}>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Medical Record</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date Issued</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                billings.map((bill) => (
                                    <tr key={bill.id}>
                                        <td>
                                            <div className={styles.patientInfo}>
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>{bill.patientName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.medicalRecord}>
                                                {getMedicalRecordId(bill.medicalRecordId)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.amount}>
                                                ₱{(bill.amount || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${getPaymentStatusClass(bill.paymentStatus, styles)}`}>
                                                <FontAwesomeIcon icon={getStatusIcon(bill.paymentStatus)} />
                                                {bill.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.dateInfo}>
                                                <FontAwesomeIcon icon={faCalendar} />
                                                <span>{formatDate(bill.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    type='button'
                                                    onClick={() => handleViewDetails(bill.id)}
                                                    className={styles.btnView}
                                                    title="View Details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                {
                                                    bill.paymentStatus !== 'Paid' && (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleProcessPayment(bill.id)}
                                                            className={styles.btnPay}
                                                            title="Process Payment"
                                                            disabled={isProcessing}
                                                        >
                                                            <FontAwesomeIcon icon={faCreditCard} />
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )
        }

        {/* pagination */}
        {
            !loading && billings.length > 0 && (
                <div className={styles.pagination}>
                    <button 
                        type='button'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationBtn}
                    >
                        Previous
                    </button>
                    
                    <span className={styles.paginationInfo}>
                        Page {currentPage} of {totalPages} ({totalRecords} total records)
                    </span>
                    
                    <button 
                        type='button'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationBtn}
                    >
                        Next
                    </button>
                </div>
            )
        }

        {/* empty state */}
        {
            !loading && !error && billings.length === 0 && (
                <div className={styles.emptyState}>
                    <FontAwesomeIcon icon={faCreditCard} className={styles.emptyIcon} />
                    <h3>No billing records found</h3>
                    <p>Try adjusting your search criteria or create a new bill.</p>
                </div>
            )
        }

        {/* bill details modal */}
        {
            showModal && selectedBill && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Bill Details</h2>
                            <button type='button' title='Close' onClick={closeModal} className={styles.closeBtn}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.billDetails}>
                                <div className={styles.detailRow}>
                                    <strong>Bill ID:</strong> 
                                    <span>{selectedBill.id?.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <strong>Patient:</strong> 
                                    <span>{selectedBill.patientName}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <strong>Medical Record:</strong> 
                                    <span>{getMedicalRecordId(selectedBill.medicalRecordId)}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <strong>Amount:</strong> 
                                    <span>₱{(selectedBill.amount || 0).toFixed(2)}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <strong>Status:</strong> 
                                    <span className={getPaymentStatusClass(selectedBill.paymentStatus, styles)}>
                                        {selectedBill.paymentStatus}
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <strong>Date Issued:</strong> 
                                    <span>{formatDate(selectedBill.createdAt)}</span>
                                </div>
                                {
                                    selectedBill.items && selectedBill.items.length > 0 && (
                                        <div className={styles.itemsSection}>
                                            <strong>Items:</strong>
                                            <div className={styles.itemsList}>
                                                {
                                                    selectedBill.items.map((item, index) => (
                                                        <div key={index} className={styles.itemRow}>
                                                            <span>{item.itemName}</span>
                                                            <span>Qty: {item.quantity}</span>
                                                            <span>₱{(item.unitPrice * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        {/* update billing modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType='billing'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedBilling}
                    isProcessing={isProcessing}
                />
            )
        }

        {/* delete billing modal */}
        {
            isDeleteModalOpen && deleteBillingData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteBillingData}
                    isProcessing={isProcessing}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'billing')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default BillingsPaymentPage