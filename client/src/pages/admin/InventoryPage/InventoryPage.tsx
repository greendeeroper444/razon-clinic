import React, { useState, useEffect } from 'react'
import styles from './InventoryPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faPills, 
    faExclamationTriangle, 
    faClock, 
    faCube, 
    faSyringe, 
    faTablets, 
    faCapsules, 
    faPrescriptionBottle, 
    faPrescriptionBottleAlt, 
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import { 
    getInventoryItems, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    getLowStockItems,
    getExpiringItems
} from '../../services/inventoryItemService';
import { InventoryItemFormData } from '../../../types';
import { toast } from 'sonner';

interface InventoryItem {
    id: string;
    itemName: string;
    category: string;
    quantityInStock: number;
    quantityUsed: number;
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
}

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

    // fetch inventory items on component mount
    useEffect(() => {
        fetchInventoryItems();
        fetchSummaryStats();
    }, []);

    // listen for modal close event to refresh data
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

    const handleAddItem = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        const itemId = item._id || item.id;
        if (!itemId) {
            console.error('Item ID is missing:', item);
            return;
        }
        
        const formData: InventoryItemFormData = {
            itemName: item.itemName,
            category: item.category,
            quantityInStock: item.quantityInStock,
            quantityUsed: item.quantityUsed,
            expiryDate: item.expiryDate.split('T')[0],
            _id: itemId
        };
        setEditData(formData);
        setIsModalOpen(true);
    };

    const handleDeleteItem = (item: InventoryItem) => {
        const itemId = item._id || item.id;
        
        if (!itemId) {
            console.error('Item ID is missing:', item);
            return;
        }
        
        const deleteData = {
            id: itemId,
            itemName: item.itemName,
            itemType: 'Inventory Item'
        };
        
        console.log('Delete data being set:', deleteData); // Debug log
        
        setDeleteInventoryItemData(deleteData);
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setDeleteInventoryItemData(null);
    };

    const handleSubmitUpdate = async (data: InventoryItemFormData) => {
        try {
            setIsProcessing(true);
            if (editData && editData._id) {
                //update existing item
                await updateInventoryItem(editData._id, data);
            } else {
                //add new item
                await addInventoryItem(data);
            }
            fetchInventoryItems();
            fetchSummaryStats();
        } catch (error) {
            console.error('Error saving inventory item:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelete = async (itemId: string | any) => {
        //handle both direct ID and object with ID
        const actualId = typeof itemId === 'string' ? itemId : itemId?.id || itemId;
        
        if (!actualId || actualId === 'undefined' || actualId === undefined) {
            console.error('Invalid item ID for deletion:', actualId);
            return;
        }
        
        try {
            setIsProcessing(true);
            await deleteInventoryItem(actualId);
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

    const getItemIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'vaccine':
                return faSyringe;
            case 'tablets':
                return faTablets;
            case 'capsules':
                return faCapsules;
            case 'medical supply':
                return faPrescriptionBottle;
            default:
                return faPills;
        }
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return 'critical';
        if (quantity <= 10) return 'low';
        if (quantity <= 50) return 'medium';
        return 'high';
    };

    const getExpiryStatus = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 30) return 'expiring';
        return 'good';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const summaryCards = [
        {
            title: "Total Medicines",
            icon: faPills,
            iconColor: "blue",
            value: summaryStats.total,
            footer: "Total inventory items"
        },
        {
            title: "Low Stock Items",
            icon: faExclamationTriangle,
            iconColor: "red",
            value: summaryStats.lowStock,
            footer: "Need restocking"
        },
        {
            title: "Expiring Soon",
            icon: faClock,
            iconColor: "red",
            value: summaryStats.expiring,
            footer: "Within 30 days"
        },
        {
            title: "Recently Added",
            icon: faCube,
            iconColor: "green",
            value: summaryStats.recentlyAdded,
            footer: "This month"
        }
    ];

    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Inventory</h1>
                <div className={styles.contentActions}>
                    <button 
                        type='button'
                        className={styles.btnPrimary} 
                        id="newMedicineBtn"
                        onClick={handleAddItem}
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
                                                            className={`${styles.actionBtn} ${styles.primary}`}
                                                            onClick={() => handleEditItem(item)}
                                                            disabled={isProcessing}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                                        </button>
                                                        <button 
                                                            className={`${styles.actionBtn} ${styles.cancel}`}
                                                            onClick={() => handleDeleteItem(item)}
                                                            disabled={isProcessing}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> Delete
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
                        modalType="item"
                        onSubmit={handleSubmitUpdate}
                        editData={editData}
                        isProcessing={isProcessing}
                    />
                )
            }

            {/* delete inventory item modal */}
            {
                isDeleteModalOpen && deleteInventoryItemData && (
                    <ModalComponent
                        isOpen={isDeleteModalOpen}
                        onClose={handleDeleteModalClose}
                        modalType="delete"
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