import React, { useState, useEffect } from 'react'
import styles from './InventoryPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faPills, 
    faExclamationTriangle, 
    faClock, 
    faCube,
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import { ModalComponent } from '../../../components';
import { 
    getInventoryItems, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    getLowStockItems,
    getExpiringItems
} from '../../../services';
import { FormDataType, InventoryItem, InventoryItemFormData } from '../../../types';
import { toast } from 'sonner';
import { formatDate, getExpiryStatus, getItemIcon, getStockStatus, openModalWithRefresh } from '../../../utils';
import { getInventorySummaryCards } from '../../../config/inventorySummaryCards';


const InventoryPage: React.FC<OpenModalProps> = ({openModal}) => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editData, setEditData] = useState<InventoryItemFormData | null>(null);
    const [deleteInventoryItemData, setDeleteInventoryItemData] = useState<{id: string, itemName: string, itemType: string} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [summaryStats, setSummaryStats] = useState({
        total: 0,
        lowStock: 0,
        expiring: 0,
        recentlyAdded: 0
    });
    const [isRestockMode, setIsRestockMode] = useState(false);
    const [isAddQuantityMode, setIsAddQuantityMode] = useState(false);
    
    //fetch inventory items on component mount
    useEffect(() => {
        fetchInventoryItems();
        fetchSummaryStats();
    }, []);

    //listen for modal close event to refresh data
    useEffect(() => {
        const handleModalClosed = () => {
            fetchInventoryItems();
            fetchSummaryStats();
        };

        window.addEventListener('modal-closed', handleModalClosed);
        return () => window.removeEventListener('modal-closed', handleModalClosed);
    }, []);

    const fetchInventoryItems = async () => {
        try {
            setIsLoading(true);
            const response = await getInventoryItems();
            setInventoryItems(response.data.inventoryItems || []);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSummaryStats = async () => {
        try {
            const [lowStockResponse, expiringResponse] = await Promise.all([
                getLowStockItems(10),
                getExpiringItems(30)
            ]);

            //calculate recently added (items added in the last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentlyAdded = inventoryItems.filter(item => 
                new Date(item.createdAt) > thirtyDaysAgo
            ).length;

            setSummaryStats({
                total: inventoryItems.length,
                lowStock: lowStockResponse.data.lowStockItems?.length || 0,
                expiring: expiringResponse.data.expiringItems?.length || 0,
                recentlyAdded: recentlyAdded
            });
        } catch (error) {
            console.error('Error fetching summary stats:', error);
        }
    };

    const handleOpenModal = () => {
        openModalWithRefresh({
            modalType: 'item',
            openModal,
            onRefresh: fetchInventoryItems,
        });
    };

    const handleUpdateClick = (item: InventoryItem, restockMode: boolean = false, addQuantityMode: boolean = false) => {
        const itemId = item.id;
        if (!itemId) {
            console.error('Item ID is missing:', item);
            return;
        }
        
        const formData: InventoryItemFormData = {
            itemName: item.itemName,
            category: item.category,
            price: item.price,
            quantityInStock: item.quantityInStock,
            quantityUsed: item.quantityUsed,
            expiryDate: item.expiryDate.split('T')[0],
            id: itemId
        };
        setEditData(formData);
        setIsModalOpen(true);
        setIsRestockMode(restockMode);
        setIsAddQuantityMode(addQuantityMode);
    };

    

    const handleDeleteClick = (item: InventoryItem) => {
        const itemId = item.id;
        
        if (!itemId) {
            console.error('Item ID is missing:', item);
            return;
        }
        
        const deleteData = {
            id: itemId,
            itemName: item.itemName,
            itemType: 'Inventory Item'
        };
        
        setDeleteInventoryItemData(deleteData);
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditData(null);
        setIsRestockMode(false);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setDeleteInventoryItemData(null);
    };

    const handleSubmitUpdate = async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing medical ID');
            return;
        }

        //asertion simce we know it's MedicalRecordFormData in this context
        const medicalData = data as InventoryItemFormData;

        try {
            setIsProcessing(true);
            if (editData && editData.id) {
                //update existing item
                await updateInventoryItem(editData.id, medicalData);
            } else {
                //add new item
                await addInventoryItem(medicalData);
            }
            fetchInventoryItems();
            fetchSummaryStats();
        } catch (error) {
            console.error('Error saving inventory item:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelete = async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid patient ID');
            return;
        }
        
        try {
            setIsProcessing(true);
            await deleteInventoryItem(data);
            fetchInventoryItems();
            fetchSummaryStats();
            setIsDeleteModalOpen(false);
            setDeleteInventoryItemData(null);
            toast.success('Inventory deleted successfully!')
        } catch (error) {
            console.error('Error deleting inventory item:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const summaryCards = getInventorySummaryCards(summaryStats);

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Inventory</h1>
            <div className={styles.contentActions}>
                <button 
                    type='button'
                    className={styles.btnPrimary} 
                    id="newItemBtn"
                    onClick={handleOpenModal}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Item
                </button>
            </div>
        </div>

        {/* inventory cards */}
        <div className={styles.inventoryCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <FontAwesomeIcon icon={card.icon} />
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

            <div className={styles.tableResponsive}>
                {
                    isLoading ? (
                        <div className={styles.loadingState}>Loading inventory items...</div>
                    ) : (
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
                                            <td colSpan={6} className={styles.emptyState}>
                                                No inventory items found. Click "Add Item" to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        inventoryItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className={styles.medicineInfo}>
                                                        <div className={styles.medicineIcon}>
                                                            <FontAwesomeIcon icon={getItemIcon(item.category)} />
                                                        </div>
                                                        <div>
                                                            <div className={styles.medicineName}>{item.itemName}</div>
                                                            <div className={styles.medicineCategory}>{item.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.category}</td>
                                                <td>
                                                    ₱{item.price}.00
                                                </td>
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
                                                        className={`${styles.actionBtn} ${styles.update}`}
                                                        onClick={() => handleUpdateClick(item, false, false)}
                                                        disabled={isProcessing}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                    </button>
                                                    <button 
                                                        type='button'
                                                        className={`${styles.actionBtn} ${styles.cancel}`}
                                                        onClick={() => handleDeleteClick(item)}
                                                        disabled={isProcessing}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                                    </button>
                                                    <button 
                                                        type='button'
                                                        className={`${styles.actionBtn} ${styles.primary}`}
                                                        onClick={() => handleUpdateClick(item, true, true)}
                                                        disabled={isProcessing}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} /> Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>
        </div>

        {/* update inventory item modal */}
        {
                isModalOpen && (
                    <ModalComponent
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        modalType='item'
                        onSubmit={handleSubmitUpdate}
                        editData={editData}
                        isProcessing={isProcessing}
                        isRestockMode={isRestockMode}
                        isAddQuantityMode={isAddQuantityMode}
                    />
                )
            }

        {/* delete inventory item modal */}
        {
            isDeleteModalOpen && deleteInventoryItemData && (
                <ModalComponent
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteModalClose}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deleteInventoryItemData}
                    isProcessing={isProcessing}
                />
            )
        }
    </div>
  )
}

export default InventoryPage