import React, { useEffect, useState } from 'react'
import styles from './InventoryPage.module.css';
import { Plus, Edit, Trash } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading } from '../../../components';
import { FormDataType, InventoryItemFormData } from '../../../types';
import { formatDate, getExpiryStatus, getItemIcon, getLoadingText, getStockStatus, openModalWithRefresh } from '../../../utils';
import { getInventorySummaryCards } from '../../../config/inventorySummaryCards';
import { useInventoryStore } from '../../../stores';

interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

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

    //local state for search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    //fetch inventory items with search and pagination parameters
    const fetchInventoryItemsWithParams = async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchInventoryItems({ page, limit, search });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    };

    useEffect(() => {
        fetchInventoryItemsWithParams(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    }, [pagination.currentPage, pagination.itemsPerPage, searchTerm]);

    //handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, currentPage: 1 })); //reset to first page on search
    };

    //handle page change
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    //handle items per page change
    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage,
            currentPage: 1
        }));
    };

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'item',
            openModal,
            onRefresh: () => fetchInventoryItemsWithParams(pagination.currentPage, pagination.itemsPerPage, searchTerm),
        });
    };

    const handleUpdateClick = (item: InventoryItemFormData, restockMode: boolean = false, addQuantityMode: boolean = false) => {
        openUpdateModal(item, restockMode, addQuantityMode);
    };

    const handleDeleteClick = (item: InventoryItemFormData) => {
        openDeleteModal(item);
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing inventory ID');
            return;
        }

        const inventoryData = data as InventoryItemFormData;

        try {
            if (selectedInventoryItem && selectedInventoryItem.id) {
                //update existing item
                await updateInventoryItemData(selectedInventoryItem.id, inventoryData);
            } else {
                //add new item
                await addInventoryItem(inventoryData);
            }
            //refresh the current page after update
            await fetchInventoryItemsWithParams(pagination.currentPage, pagination.itemsPerPage, searchTerm);
        } catch (error) {
            console.error('Error saving inventory item:', error);
        }
    };

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid inventory ID');
            return;
        }
        
        try {
            await deleteInventoryItem(data);
            //refresh the current page after delete
            await fetchInventoryItemsWithParams(pagination.currentPage, pagination.itemsPerPage, searchTerm);
        } catch (error) {
            console.error('Error deleting inventory item:', error);
        }
    };

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
                            value={pagination.itemsPerPage}
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

                        {/* pagination */}
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            itemsPerPage={pagination.itemsPerPage}
                            onPageChange={handlePageChange}
                            disabled={loading || isProcessing}
                            className={styles.pagination}
                        />
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