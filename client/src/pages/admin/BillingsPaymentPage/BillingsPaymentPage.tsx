import { useState, useEffect, useMemo, useCallback } from 'react'
import styles from './BillingsPaymentPage.module.css'
import { Plus, Download, CreditCard, Check, AlertTriangle, User, Calendar, Eye } from 'lucide-react';
import { BillingFormData, FormDataType } from '../../../types'
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading } from '../../../components'
import { OpenModalProps } from '../../../hooks/hook'
import { formatDate, getLoadingText, getMedicalRecordId, getPaymentStatusClass, getStatusIcon, openModalWithRefresh } from '../../../utils'
import { useBillingStore } from '../../../stores'
import { useNavigate } from 'react-router-dom';

const BillingsPaymentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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
        pagination: storePagination,
        isProcessing,
        fetchBillings,
        closeUpdateModal,
        closeDeleteModal,
        addBilling,
        updateBillingData,
        deleteBilling,
        processPayment,
        exportBillings,
        currentOperation
    } = useBillingStore();

    //calculate summary stats using useMemo for performance
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchBillings({ page, limit, search });
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, [fetchBillings]);

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '');
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData]);

    //handle search
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, storePagination?.itemsPerPage || 10, term);
    }, [fetchData, storePagination?.itemsPerPage]);

    //handle page change
    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

    //handle items per page change
    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm);
    }, [fetchData, searchTerm]);

    const handleOpenModal = useCallback(() => {
        openModalWithRefresh({
            modalType: 'billing',
            openModal,
            onRefresh: () => fetchData(
                storePagination?.currentPage || 1, 
                storePagination?.itemsPerPage || 10, 
                searchTerm
            ),
        });
    }, [openModal, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);
    
    const handleExport = async () => {
        await exportBillings();
    };

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing billing ID');
            return;
        }

        const billingData = data as BillingFormData;

        try {
            if (selectedBilling?.id) {
                await updateBillingData(selectedBilling.id, billingData);
            } else {
                await addBilling(billingData);
            }

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error updating billing:', error);
        }
    }, [selectedBilling, updateBillingData, addBilling, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleProcessPayment = async (billId: string) => {
        await processPayment(billId);
    };

    const handleViewClick = (billId: string) => {
        console.log("This is view billing: ",billId)
    };

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid billing ID');
            return;
        }

        try {
            await deleteBilling(data);

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error deleting billing:', error);
        }
    }, [deleteBilling, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    

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
            icon: <Plus />,
            onClick: handleOpenModal,
            type: 'primary' as const
        },
        {
            label: 'Export',
            icon: <Download />,
            onClick: handleExport,
            type: 'outline' as const
        }
    ];

  return (
    <Main error={error}>
        <Header
            title='Billing & Payments'
            actions={headerActions}
        />

        {/* summary cards */}
        <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                    <CreditCard />
                </div>
                <div className={styles.cardContent}>
                    <h3>Total Revenue</h3>
                    <p className={styles.cardAmount}>₱{summaryData.totalAmount.toFixed(2)}</p>
                </div>
            </div>
            <div className={styles.summaryCard}>
                <div className={`${styles.cardIcon} ${styles.iconSuccess}`}>
                    <Check />
                </div>
                <div className={styles.cardContent}>
                    <h3>Paid Amount</h3>
                    <p className={`${styles.cardAmount} ${styles.amountSuccess}`}>₱{summaryData.paidAmount.toFixed(2)}</p>
                </div>
            </div>
            <div className={styles.summaryCard}>
                <div className={`${styles.cardIcon} ${styles.iconDanger}`}>
                    <AlertTriangle />
                </div>
                <div className={styles.cardContent}>
                    <h3>Outstanding</h3>
                    <p className={`${styles.cardAmount} ${styles.amountDanger}`}>₱{summaryData.unpaidAmount.toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        {/* billing table */}

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Billing & Payments</div>

                {/* search and items per page controls */}
                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search medicines..."
                        disabled={loading}
                        className={styles.searchbar}
                    />
                    
                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading billings data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <>
                        <div className={styles.tableResponsive}>
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
                                        billings.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={styles.emptyState}>
                                                    {
                                                        searchTerm ? 
                                                        `No billings found matching "${searchTerm}". Try a different search term.` : 
                                                        'No billings found. Click "New Item" to get started.'
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            billings.map((bill) => (
                                                <tr key={bill.id}>
                                                    <td>
                                                        <div className={styles.patientInfo}>
                                                            <User />
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
                                                            {
                                                                (() => {
                                                                    const Icon = getStatusIcon(bill.paymentStatus);
                                                                    return <Icon className={styles.icon} />;
                                                                })()
                                                            }
                                                            {bill.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.dateInfo}>
                                                            <Calendar />
                                                            <span>{formatDate(bill.createdAt)}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionButtons}>
                                                            <button
                                                                type='button'
                                                                onClick={() => handleViewClick(bill.id)}
                                                                className={styles.btnView}
                                                                title="View Details"
                                                            >
                                                                <Eye />
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
                                                                        <CreditCard />
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>

                        {
                            storePagination && storePagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={storePagination.currentPage}
                                    totalPages={storePagination.totalPages}
                                    totalItems={storePagination.totalItems}
                                    itemsPerPage={storePagination.itemsPerPage}
                                    onPageChange={handlePageChange}
                                    disabled={loading || isProcessing}
                                    className={styles.pagination}
                                />
                            )
                        }
                    </>
                )
            }

        </div>

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