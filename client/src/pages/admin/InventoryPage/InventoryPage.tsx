import React, { useEffect } from 'react'
import styles from './InventoryPage.module.css';
import { Plus, Edit, Trash } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, SubmitLoading } from '../../../components';
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


    useEffect(() => {
        fetchInventoryItems();
    }, [fetchInventoryItems]);

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'item',
            openModal,
            onRefresh: fetchInventoryItems,
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
                                                No inventory items found. Click "New Item" to get started.
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