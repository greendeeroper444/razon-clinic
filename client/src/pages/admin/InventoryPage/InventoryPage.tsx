import React, { useEffect, useState, useCallback } from 'react'
import styles from './InventoryPage.module.css';
import { Plus, Edit, Archive, History } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components';
import { FormDataType, InventoryItemFormData, TableColumn } from '../../../types';
import { formatDate, getExpiryStatus, getItemIcon, getLoadingText, getStockStatus } from '../../../utils';
import { getInventorySummaryCards } from '../../../config/inventorySummaryCards';
import { useInventoryStore } from '../../../stores';
import { updateStock } from '../../../services';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';

const InventoryPage: React.FC<OpenModalProps> = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        inventoryItems,
        submitLoading,
        loading,
        error,
        isProcessing,
        summaryStats,
        selectedInventoryItem,
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        deleteInventoryItemData,
        isRestockMode,
        isAddQuantityMode,
        pagination: storePagination,
        fetchInventoryItems,
        addInventoryItem,
        updateInventoryItemData,
        deleteInventoryItem,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        currentOperation
    } = useInventoryStore();

    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchInventoryItems({ page, limit, search });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    }, [fetchInventoryItems]);

    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '');
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData]);

    useEffect(() => {
        const state = location.state as { restockItem?: InventoryItemFormData; openRestock?: boolean };
        
        if (state?.openRestock && state?.restockItem) {
            if (!loading && inventoryItems.length > 0) {
                const currentItem = inventoryItems.find(item => item.id === state.restockItem?.id);
                
                if (currentItem) {
                    openModalUpdate(currentItem, true, true);
                } else {
                    openModalUpdate(state.restockItem, true, true);
                }
                
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, loading, inventoryItems, openModalUpdate]);

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

    const handleUpdateClick = useCallback((item: InventoryItemFormData, restockMode: boolean = false, addQuantityMode: boolean = false) => {
        openModalUpdate(item, restockMode, addQuantityMode);
    }, [openModalUpdate]);

    const handleDeleteClick = useCallback((item: InventoryItemFormData) => {
        openModalDelete(item);
    }, [openModalDelete]);

    //navigate to item-specific transaction history
    const handleViewHistory = useCallback((item: InventoryItemFormData) => {
        navigate(`/admin/inventory/transactions/${item.id}`, {
            state: { itemName: item.itemName }
        });
    }, [navigate]);

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding inventory item');
            return;
        }

        const inventoryData = data as InventoryItemFormData;

        try {
            await addInventoryItem(inventoryData);

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding inventory item:', error);
        }
    }, [addInventoryItem, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate]);
    
    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing inventory ID');
            return;
        }

        const inventoryData = data as InventoryItemFormData;

        try {
            if (!selectedInventoryItem?.id) {
                await addInventoryItem(inventoryData);

            } else if (isRestockMode || isAddQuantityMode) {
                //call the service directly — avoids validateInventoryItem on the backend
                //which requires category and other fields not present in restock mode
                const quantityToSend = isAddQuantityMode
                    ? Number(inventoryData.quantityInStock) - Number(selectedInventoryItem.quantityInStock)
                    : Number(inventoryData.quantityInStock);

                await updateStock(selectedInventoryItem.id, {
                    quantityUsed: quantityToSend,
                    operation: 'restock'
                });

                toast.success('Item restocked successfully!');
                closeModalUpdate();

            } else {
                await updateInventoryItemData(selectedInventoryItem.id, inventoryData);
            }
            
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error saving inventory item:', error);
            toast.error('Failed to update stock. Please try again.');
        }
    }, [
        selectedInventoryItem,
        isRestockMode,
        isAddQuantityMode,
        addInventoryItem,
        updateInventoryItemData,
        closeModalUpdate,
        fetchData,
        storePagination?.currentPage,
        storePagination?.itemsPerPage,
        searchTerm
    ]);

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid inventory ID');
            return;
        }
        
        try {
            await deleteInventoryItem(data);
            
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error deleting inventory item:', error);
        }
    }, [deleteInventoryItem, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const summaryCards = getInventorySummaryCards(summaryStats);

    const inventoryColumns: TableColumn<InventoryItemFormData>[] = [
        {
            key: 'medicine',
            header: 'MEDICINE',
            render: (item) => (
                <div className={styles.medicineInfo}>
                    <div className={styles.medicineIcon}>
                        {
                            (() => {
                                const Icon = getItemIcon(item.category);
                                return <Icon className={styles.icon} />;
                            })()
                        }
                    </div>
                    <div>
                        <div className={styles.medicineName}>{item.itemName}</div>
                        <div className={styles.medicineCategory}>{item.category}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            header: 'CATEGORY',
            render: (item) => item.category
        },
        {
            key: 'price',
            header: 'PRICE',
            render: (item) => `₱${item.price}.00`
        },
        {
            key: 'stock',
            header: 'STOCK',
            render: (item) => (
                <span className={`${styles.stockLevel} ${styles[getStockStatus(item.quantityInStock)]}`}>
                    {item.quantityInStock}
                </span>
            )
        },
        {
            key: 'used',
            header: 'USED',
            render: (item) => item.quantityUsed || 0
        },
        {
            key: 'expiry',
            header: 'EXPIRY DATE',
            render: (item) => (
                <span className={`${styles.expiryStatus} ${styles[getExpiryStatus(item.expiryDate)]}`}>
                    {formatDate(item.expiryDate)}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'CREATED',
            render: (item) => (
                <span>
                    {formatDate(item.createdAt)}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (item) => (
                <>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.primary}`}
                        onClick={() => handleUpdateClick(item, true, true)}
                        disabled={isProcessing}
                    >
                        <Plus className={styles.icon} /> Restock
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.update}`}
                        onClick={() => handleUpdateClick(item, false, false)}
                        disabled={isProcessing}
                    >
                        <Edit className={styles.icon} /> Edit
                    </button>
                    <button
                        type='button'
                        className={`${styles.actionBtn} ${styles.history}`}
                        onClick={() => handleViewHistory(item)}
                        disabled={isProcessing}
                    >
                        <History className={styles.icon} /> History
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.cancel}`}
                        onClick={() => handleDeleteClick(item)}
                        disabled={isProcessing}
                    >
                        <Archive className={styles.icon} /> Archive
                    </button>
                </>
            )
        }
    ];

    const headerActions = [
        {
            id: 'newItemBtn',
            label: 'New Item',
            icon: <Plus className={styles.icon} />,
            onClick: handleCreateClick,
            type: 'primary' as const
        }
    ];
    
  return (
    <Main error={error}>
        <Header
            title='Inventory'
            actions={headerActions}
        />

        <div className={styles.inventoryCards}>
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

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Medicine Inventory</div>
                
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
                            message='Loading inventory data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={inventoryColumns}
                            data={inventoryItems}
                            emptyMessage='No inventory items found. Click "New Item" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(item) => item.id || ''}
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
                                />
                            )
                        }
                    </>
                )
            }
        </div>

        {
            isModalCreateOpen && (
                <Modal
                    isOpen={isModalCreateOpen}
                    onClose={closeModalCreate}
                    modalType="item"
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
                    modalType='item'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedInventoryItem}
                    isProcessing={submitLoading}
                    isRestockMode={isRestockMode}
                    isAddQuantityMode={isAddQuantityMode}
                />
            )
        }
        
        {
            isModalDeleteOpen && deleteInventoryItemData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteInventoryItemData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'item')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default InventoryPage;