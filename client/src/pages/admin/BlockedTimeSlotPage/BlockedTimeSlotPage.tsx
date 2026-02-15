import React, { useEffect, useState, useCallback } from 'react'
import styles from './BlockedTimeSlotPage.module.css';
import { Plus, Edit, Trash, Calendar } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components';
import { FormDataType, BlockedTimeSlotFormData, TableColumn } from '../../../types';
import { formatDate, getLoadingText } from '../../../utils';
import { useBlockedTimeSlotStore } from '../../../stores';

const BlockedTimeSlotPage: React.FC<OpenModalProps> = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    //zustand store selectors
    const {
        blockedTimeSlots,
        submitLoading,
        loading,
        fetchLoading,
        error,
        isProcessing,
        selectedBlockedTimeSlot,
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        deleteBlockedTimeSlotData,
        pagination: storePagination,
        fetchBlockedTimeSlots,
        addBlockedTimeSlot,
        updateBlockedTimeSlotData,
        deleteBlockedTimeSlot,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        currentOperation
    } = useBlockedTimeSlotStore();

    //memoized fetch function to prevent recreation on every render
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchBlockedTimeSlots({ page, limit, search });
        } catch (error) {
            console.error('Error fetching blocked time slots:', error);
        }
    }, [fetchBlockedTimeSlots]);

    //initial load only
    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '');
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, storePagination?.itemsPerPage || 10, term);
    }, [fetchData, storePagination?.itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm);
    }, [fetchData, searchTerm]);

    const handleCreateClick = useCallback(() => {
        openModalCreate();
    }, [openModalCreate]);

    const handleUpdateClick = useCallback((item: BlockedTimeSlotFormData) => {
        openModalUpdate(item);
    }, [openModalUpdate]);

    const handleDeleteClick = useCallback((item: BlockedTimeSlotFormData) => {
        openModalDelete(item);
    }, [openModalDelete]);

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding blocked time slot')
            return
        }

        const blockedTimeSlotData = data as BlockedTimeSlotFormData;

        try {
            await addBlockedTimeSlot(blockedTimeSlotData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding blocked time slot:', error);
        }
    }, [addBlockedTimeSlot, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate])
    
    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing blocked time slot ID');
            return;
        }

        const blockedTimeSlotData = data as BlockedTimeSlotFormData;

        try {
            if (selectedBlockedTimeSlot && selectedBlockedTimeSlot.id) {
                await updateBlockedTimeSlotData(selectedBlockedTimeSlot.id, blockedTimeSlotData);
            }
            
            //refresh after operation completes
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error saving blocked time slot:', error);
        }
    }, [selectedBlockedTimeSlot, updateBlockedTimeSlotData, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid blocked time slot ID');
            return;
        }
        
        try {
            await deleteBlockedTimeSlot(data);
            
            //refresh after operation completes
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error deleting blocked time slot:', error);
        }
    }, [deleteBlockedTimeSlot, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        return start === end ? start : `${start} - ${end}`;
    };

    const getReasonBadgeColor = (reason: string) => {
        const reasonMap: { [key: string]: string } = {
            'Meeting': 'blue',
            'Holiday': 'green',
            'Maintenance': 'warning',
            'Emergency': 'danger',
            'Personal': 'purple',
            'Other': 'gray'
        };
        return reasonMap[reason] || 'gray';
    };

    const blockedTimeSlotColumns: TableColumn<BlockedTimeSlotFormData>[] = [
        {
            key: 'dateRange',
            header: 'DATE RANGE',
            render: (item) => (
                <div className={styles.dateInfo}>
                    <div className={styles.dateIcon}>
                        <Calendar className={styles.icon} />
                    </div>
                    <div>
                        <div className={styles.dateRange}>
                            {formatDateRange(item.startDate, item.endDate)}
                        </div>
                        <div className={styles.dateSubtext}>
                            {item.startDate === item.endDate ? 'Single Day' : 'Multiple Days'}
                        </div>
                    </div>
                </div>
            )
        },
        // {
        //     key: 'timeRange',
        //     header: 'TIME RANGE',
        //     render: (item) => (
        //         <div className={styles.timeInfo}>
        //             <Clock className={styles.timeIcon} />
        //             <span className={styles.timeRange}>
        //                 {item.startTime} - {item.endTime}
        //             </span>
        //         </div>
        //     )
        // },
        {
            key: 'reason',
            header: 'REASON',
            render: (item) => (
                <span className={`${styles.reasonBadge} ${styles[getReasonBadgeColor(item.reason)]}`}>
                    {item.reason}
                </span>
            )
        },
        {
            key: 'customReason',
            header: 'DETAILS',
            render: (item) => (
                <div className={styles.customReason}>
                    {item.customReason || 'No additional details'}
                </div>
            )
        },
        {
            key: 'status',
            header: 'STATUS',
            render: (item) => {
                const now = new Date();
                const startDate = new Date(item.startDate);
                const endDate = new Date(item.endDate);
                
                let status = 'upcoming';
                let statusText = 'Upcoming';
                
                if (now >= startDate && now <= endDate) {
                    status = 'active';
                    statusText = 'Active';
                } else if (now > endDate) {
                    status = 'past';
                    statusText = 'Past';
                }
                
                return (
                    <span className={`${styles.statusBadge} ${styles[status]}`}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (item) => (
                <>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.update}`}
                        onClick={() => handleUpdateClick(item)}
                        disabled={isProcessing}
                    >
                        <Edit className={styles.icon} /> Edit
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.cancel}`}
                        onClick={() => handleDeleteClick(item)}
                        disabled={isProcessing}
                    >
                        <Trash className={styles.icon} /> Delete
                    </button>
                </>
            )
        }
    ];

    const headerActions = [
        {
            id: 'newBlockBtn',
            label: 'Block Time',
            icon: <Plus className={styles.icon} />,
            onClick: handleCreateClick,
            type: 'primary' as const
        }
    ];

    // const summaryCards = [
    //     {
    //         title: 'Total Active Blocks',
    //         value: summaryStats?.totalActiveBlocks || 0,
    //         icon: Calendar,
    //         iconColor: 'blue',
    //         footer: 'Currently blocking appointments'
    //     },
    //     {
    //         title: 'Upcoming Blocks',
    //         value: summaryStats?.upcomingBlocksCount || 0,
    //         icon: Clock,
    //         iconColor: 'green',
    //         footer: 'Scheduled for future'
    //     }
    // ];
    
  return (
    <Main error={error}>
        <Header
            title='Blocked Time Slots'
            actions={headerActions}
        />

        {/* <div className={styles.summaryCards}>
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
        </div> */}

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Blocked Time Schedule</div>
                
                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search blocked slots..."
                        disabled={loading || fetchLoading}
                        className={styles.searchbar}
                    />
                    
                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading || fetchLoading}
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

            {loading || fetchLoading ? (
                <div className={styles.tableResponsive}>
                    <Loading
                        type='skeleton'
                        rows={7}
                        message='Loading blocked time slots...'
                        delay={0}
                        minDuration={1000}
                    />
                </div>
            ) : (
                <>
                    <Table
                        columns={blockedTimeSlotColumns}
                        data={blockedTimeSlots}
                        emptyMessage='No blocked time slots found. Click "Block Time" to get started.'
                        searchTerm={searchTerm}
                        getRowKey={(item) => item.id || ''}
                    />

                    {storePagination && storePagination.totalPages > 1 && (
                        <Pagination
                            currentPage={storePagination.currentPage}
                            totalPages={storePagination.totalPages}
                            totalItems={storePagination.totalItems}
                            itemsPerPage={storePagination.itemsPerPage}
                            onPageChange={handlePageChange}
                            disabled={loading || fetchLoading || isProcessing}
                        />
                    )}
                </>
            )}
        </div>

        {
            isModalCreateOpen && (
                <Modal
                    isOpen={isModalCreateOpen}
                    onClose={closeModalCreate}
                    modalType="blockedTimeSlot"
                    onSubmit={handleSubmitCreate}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType='blockedTimeSlot'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedBlockedTimeSlot}
                    isProcessing={submitLoading}
                />
            )
        }
        
        {
            isModalDeleteOpen && deleteBlockedTimeSlotData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={{
                        ...deleteBlockedTimeSlotData,
                        itemName: `${formatDateRange(deleteBlockedTimeSlotData.startDate, deleteBlockedTimeSlotData.endDate)} - ${deleteBlockedTimeSlotData.reason}`
                    }}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'blockedTimeSlot')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default BlockedTimeSlotPage