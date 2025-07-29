import { useState, useEffect } from 'react'
import styles from './BillingsPaymentPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch, faDownload, faCreditCard, faCheck, faExclamationTriangle, faTimes, faUser, faCalendar, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { BillingResponse } from '../../../types'
import { ModalComponent } from '../../../components'
import { OpenModalProps } from '../../../hooks/hook'
import { getAllBillings } from '../../../services'
import { formatDate, getPaymentStatusClass, getStatusIcon, openModalWithRefresh } from '../../../utils'

const BillingsPaymentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedBill, setSelectedBill] = useState<BillingResponse | null>(null);
    
    //new state for API data
    const [billingData, setBillingData] = useState<BillingResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    //fetch billings data
    const fetchBillings = async (page: number = 1, search: string = '', status: string = 'All') => {
        setLoading(true);
        setError(null);
        
        try {
            const params: any = {
                page,
                limit
            };
            
            if (search.trim()) {
                params.patientName = search.trim();
            }
            
            if (status !== 'All') {
                params.paymentStatus = status;
            }
            
            const response = await getAllBillings(params);
            
            if (response.data.success) {
                setBillingData(response.data.data);
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
            } else {
                setError('Failed to fetch billing data');
            }
        } catch (err) {
            console.error('Error fetching billings:', err);
            setError('Failed to load billing data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillings();
    }, []);

    //handle search and filter changes
    useEffect(() => {
        // const timeoutId = setTimeout(() => {
        //     fetchBillings(1, searchTerm, filterStatus);
        // }, 500); //debounce search

        // return () => clearTimeout(timeoutId);
        fetchBillings();
    }, [searchTerm, filterStatus]);


    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'billing',
            openModal,
            onRefresh: () => fetchBillings(currentPage, searchTerm, filterStatus),
        });
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleSubmitUpdate = () => {

    };

    const handleProcessPayment = (billId: string) => {
    };

    const handleViewDetails = (billId: string) => {
        const bill = billingData.find(b => b._id === billId);
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
            fetchBillings(page, searchTerm, filterStatus);
        }
    };

    //helper function to get medical record ID as string
    const getMedicalRecordId = (medicalRecordId: any): string => {
        if (!medicalRecordId) return 'N/A';
        
        //if it's a string (ObjectId), return the last 8 characters
        if (typeof medicalRecordId === 'string') {
            return medicalRecordId.slice(-8).toUpperCase();
        }
        
        //if it's an object (populated), get the _id field
        if (typeof medicalRecordId === 'object' && medicalRecordId._id) {
            return medicalRecordId._id.toString().slice(-8).toUpperCase();
        }
        
        return 'N/A';
    };

    //calculate summary data
    const totalAmount = billingData.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const paidAmount = billingData.filter(bill => bill.paymentStatus === 'Paid').reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const unpaidAmount = billingData.filter(bill => bill.paymentStatus === 'Unpaid').reduce((sum, bill) => sum + (bill.amount || 0), 0);

    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Billing & Payments</h1>
                <div className={styles.contentActions}>
                    <button 
                        type='button'
                        className={styles.btnPrimary} 
                        id='newBillingBtn'
                        onClick={handleOpenModal}
                    >
                        <FontAwesomeIcon icon={faPlus} /> New Bill
                    </button>
                    <button type='button' className={styles.btnOutline}>
                        <FontAwesomeIcon icon={faDownload} /> Export
                    </button>
                </div>
            </div>

            {/* summary cards */}
            <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>
                        <FontAwesomeIcon icon={faCreditCard} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Total Revenue</h3>
                        <p className={styles.cardAmount}>₱{totalAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={`${styles.cardIcon} ${styles.iconSuccess}`}>
                        <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Paid Amount</h3>
                        <p className={`${styles.cardAmount} ${styles.amountSuccess}`}>₱{paidAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={`${styles.cardIcon} ${styles.iconDanger}`}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Outstanding</h3>
                        <p className={`${styles.cardAmount} ${styles.amountDanger}`}>₱{unpaidAmount.toFixed(2)}</p>
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

            {/* errpr message */}
            {
                error && (
                    <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span>{error}</span>
                        <button type='button' onClick={() => fetchBillings(currentPage, searchTerm, filterStatus)}>
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
                                    {/* <th>Bill ID</th> */}
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
                                    billingData.map((bill) => (
                                        <tr key={bill._id}>
                                            {/* <td>
                                                <span className={styles.billId}>
                                                    {bill._id?.slice(-8).toUpperCase()}
                                                </span>
                                            </td> */}
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
                                                        onClick={() => handleViewDetails(bill._id)}
                                                        className={styles.btnView}
                                                        title="View Details"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    {
                                                        bill.paymentStatus !== 'Paid' && (
                                                            <button
                                                                type='button'
                                                                onClick={() => handleProcessPayment(bill._id)}
                                                                className={styles.btnPay}
                                                                title="Process Payment"
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
                !loading && billingData.length > 0 && (
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
                !loading && !error && billingData.length === 0 && (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faCreditCard} className={styles.emptyIcon} />
                        <h3>No billing records found</h3>
                        <p>Try adjusting your search criteria or create a new bill.</p>
                    </div>
                )
            }

            {/* bill detaisl modal */}
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
                                        <span>{selectedBill._id?.slice(-8).toUpperCase()}</span>
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

            {/* modal component */}
            {
                isModalOpen && (
                    <ModalComponent
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        modalType="billing"
                        onSubmit={handleSubmitUpdate}
                    />
                )
            }
        </div>
    )
}

export default BillingsPaymentPage