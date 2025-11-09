import { useState, useEffect, useCallback } from 'react'
import styles from './BillingsPaymentPage.module.css'
import { Plus, Download, CreditCard } from 'lucide-react';
import { BillingFormData, FormDataType, TableColumn } from '../../../types'
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components'
import { OpenModalProps } from '../../../hooks/hook'
import { formatDate, getFirstLetterOfFirstAndLastName, getLoadingText, getMedicalRecordId, getStatusClass, openModalWithRefresh } from '../../../utils'
import { useBillingStore } from '../../../stores'
import { getBillingSummaryCards } from '../../../config/billingSummaryCards';
import { toast } from 'sonner';
import { generateBillingReceiptPDF } from '../../../templates';

const BillingsPaymentPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedBillingId, setSelectedBillingId] = useState<string>('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        summaryStats,
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
        try {
            await exportBillings();
        } catch (error) {
            console.error('Export error:', error);
        }
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
        setSelectedBillingId(billId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedBillingId('');
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


    const handleDownloadReceipt = useCallback((billing: BillingFormData) => {
        if (!billing) {
            toast.error('No billing data available');
            return;
        }

        // if (!billing.patientName || !billing.medicalRecordId) {
        //     toast.error('Incomplete billing data. Cannot generate receipt.');
        //     return;
        // }

        //prevent multiple simultaneous downloads
        if (isGeneratingPDF) {
            toast.warning('Please wait, generating receipt...');
            return;
        }

        setIsGeneratingPDF(true);
        const loadingToast = toast.loading('Generating receipt PDF...');

        try {
            generateBillingReceiptPDF(billing);
            
            toast.dismiss(loadingToast);
            toast.success('Receipt downloaded successfully!', {
                description: `Receipt for ${billing.patientName}`
            });
        } catch (error) {
            console.error('Error generating receipt:', error);
            
            toast.dismiss(loadingToast);
            toast.error('Failed to generate receipt', {
                description: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    }, [isGeneratingPDF]);

    const billingColumns: TableColumn<BillingFormData>[] = [
        {
            key: 'patientName',
            header: 'PATIENT NAME',
            render: (billing) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                        {
                            (() => {
                                const patientName = billing.patientName
                                return patientName 
                                    ? getFirstLetterOfFirstAndLastName(patientName)
                                    : 'N/A'
                            })()
                        }
                    </div>
                    <div>
                        <div className={styles.patientName}>
                            {billing.patientName}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'medicalRecordId',
            header: 'MEDICAL RECORD',
            render: (billing) => (
                <span className={styles.medicalRecord}>
                    {getMedicalRecordId(billing.id)}
                </span>
            )
        },
        {
            key: 'amount',
            header: 'AMOUNT',
            render: (billing) => (
                <span className={styles.amount}>
                    ₱{(billing.amount || 0).toFixed(2)}
                </span>
            )
        },
        {
            key: 'paymentStatus',
            header: 'STATUS',
            render: (billing) => (
               <span className={`${styles.statusBadge} ${getStatusClass(billing.paymentStatus, styles)}`}>
                    {billing.paymentStatus}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'DATE ISSUED',
            render: (billing) => (
                <div className={styles.dateInfo}>
                    <span>{formatDate(billing.createdAt)}</span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (billing) => (
                <div className={styles.actionButtons}>
                    <button
                        type='button'
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(billing.id);
                        }}
                        className={`${styles.actionBtn} ${styles.view}`}
                        title="View Details"
                    >
                        View
                    </button>

                    <button
                        type='button'
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReceipt(billing);
                        }}
                        className={`${styles.actionBtn} ${styles.download}`}
                        title="Download Receipt"
                    >
                        <Download size={16} />
                    </button>

                    {
                        billing.paymentStatus !== 'Paid' && (
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleProcessPayment(billing.id);
                                }}
                                className={styles.btnPay}
                                title="Process Payment"
                                disabled={isProcessing}
                            >
                                <CreditCard />
                            </button>
                        )
                    }
                </div>
            )
        }
    ];

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

    const summaryCards = getBillingSummaryCards(summaryStats);

  return (
    <Main error={error}>
        <Header
            title='Billing & Payments'
            actions={headerActions}
        />

        {/* summary cards */}
        <div className={styles.contentCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <card.icon /> 
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
                        <Table
                            columns={billingColumns}
                            data={billings}
                            emptyMessage='No billings found. Click "New Billing" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(bill) => bill.id || ''}
                            className={styles.billingTable}
                        />

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


        {
            isDetailsModalOpen && (
                <Modal
                    isOpen={isDetailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    modalType='billing-details'
                    onSubmit={() => {}}
                    billingId={selectedBillingId}
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