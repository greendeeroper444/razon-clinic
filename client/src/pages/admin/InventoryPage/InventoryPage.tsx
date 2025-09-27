import React, { useEffect, useState, useCallback } from 'react'
import styles from './InventoryPage.module.css';
import { Plus, Edit, Trash } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading } from '../../../components';
import { FormDataType, InventoryItemFormData } from '../../../types';
import { formatDate, getExpiryStatus, getItemIcon, getLoadingText, getStockStatus, openModalWithRefresh } from '../../../utils';
import { getInventorySummaryCards } from '../../../config/inventorySummaryCards';
import { useInventoryStore } from '../../../stores';

const InventoryPage: React.FC<OpenModalProps> = ({openModal}) => {

    //zustand store selectors
    const {
        inventoryItems,
        submitLoading,
        loading,
        error,
        isProcessing,
        summaryStats,
        selectedInventoryItem,
        isModalOpen,
        isDeleteModalOpen,
        deleteInventoryItemData,
        isRestockMode,
        isAddQuantityMode,
        pagination: storePagination,
        fetchInventoryItems,
        addInventoryItem,
        updateInventoryItemData,
        deleteInventoryItem,
        openUpdateModal,
        openDeleteModal,
        closeUpdateModal,
        closeDeleteModal,
        currentOperation
    } = useInventoryStore();

    //local state for search only
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    //memoized fetch function to prevent recreation on every render
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchInventoryItems({ page, limit, search });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    }, [fetchInventoryItems]);

    //initial load only
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
            modalType: 'item',
            openModal,
            onRefresh: () => fetchData(
                storePagination?.currentPage || 1, 
                storePagination?.itemsPerPage || 10, 
                searchTerm
            ),
        });
    }, [openModal, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleUpdateClick = useCallback((item: InventoryItemFormData, restockMode: boolean = false, addQuantityMode: boolean = false) => {
        openUpdateModal(item, restockMode, addQuantityMode);
    }, [openUpdateModal]);

    const handleDeleteClick = useCallback((item: InventoryItemFormData) => {
        openDeleteModal(item);
    }, [openDeleteModal]);

    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing inventory ID');
            return;
        }

        const inventoryData = data as InventoryItemFormData;

        try {
            if (selectedInventoryItem && selectedInventoryItem.id) {
                await updateInventoryItemData(selectedInventoryItem.id, inventoryData);
            } else {
                await addInventoryItem(inventoryData);
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
            console.error('Error saving inventory item:', error);
        }
    }, [selectedInventoryItem, updateInventoryItemData, addInventoryItem, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid inventory ID');
            return;
        }
        
        try {
            await deleteInventoryItem(data);
            
            //refresh after operation completes
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

    const headerActions = [
        {
            id: 'newItemBtn',
            label: 'New Item',
            icon: <Plus className={styles.icon} /> ,
            onClick: handleOpenModal,
            type: 'primary' as const
        }
    ];
    
    
  return (
    <Main error={error} >
        <Header
            title='Inventory'
            actions={headerActions}
        />

        {/* inventory cards */}
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

        {/* inventory table */}
        <div className={styles.inventoryTableContainer}>
            <div className={styles.inventoryTableHeader}>
                <div className={styles.inventoryTableTitle}>Medicine Inventory</div>
                
                {/* search and items per page controls */}
                <div className={styles.inventoryControls}>
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
                        <div className={styles.tableResponsive}>
                            <table className={styles.inventoryTable}>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Used</th>
                                        <th>Expiry Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        inventoryItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={styles.emptyState}>
                                                    {searchTerm ? 
                                                        `No inventory items found matching "${searchTerm}". Try a different search term.` : 
                                                        'No inventory items found. Click "New Item" to get started.'
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            inventoryItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
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
                                                    </td>
                                                    <td>{item.category}</td>
                                                    <td>₱{item.price}.00</td>
                                                    <td className={`${styles.stockLevel} ${styles[getStockStatus(item.quantityInStock)]}`}>
                                                        {item.quantityInStock}
                                                    </td>
                                                    <td>{item.quantityUsed || 0}</td>
                                                    <td>
                                                        <span className={`${styles.expiryStatus} ${styles[getExpiryStatus(item.expiryDate)]}`}>
                                                            {formatDate(item.expiryDate)}
                                                        </span>
                                                    </td>
                                                    <td>
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
                                                            className={`${styles.actionBtn} ${styles.cancel}`}
                                                            onClick={() => handleDeleteClick(item)}
                                                            disabled={isProcessing}
                                                        >
                                                            <Trash className={styles.icon} /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* pagination - only show if storePagination exists and has valid data */}
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

        {/* update/add inventory item modal */}
        {
            isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeUpdateModal}
                    modalType='item'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedInventoryItem}
                    isProcessing={submitLoading}
                    isRestockMode={isRestockMode}
                    isAddQuantityMode={isAddQuantityMode}
                />
            )
        }

        {/* delete inventory item modal */}
        {
            isDeleteModalOpen && deleteInventoryItemData && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
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

export default InventoryPage