import React from 'react'
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
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import { OpenModalProps } from '../../../hooks/hook';

const InventoryPage: React.FC<OpenModalProps> = ({openModal}) => {
    const summaryCards = [
        {
            title: "Total Medicines",
            icon: faPills,
            iconColor: "blue",
            value: 147,
            footer: "Across 12 categories"
        },
        {
            title: "Low Stock Items",
            icon: faExclamationTriangle,
            iconColor: "red",
            value: 7,
            footer: "2 critical items"
        },
        {
            title: "Expiring Soon",
            icon: faClock,
            iconColor: "red",
            value: 5,
            footer: "Within 30 days"
        },
        {
            title: "Recently Added",
            icon: faCube,
            iconColor: "green",
            value: 12,
            footer: "This month"
        }
    ];

    const inventoryItems = [
        {
            name: "Amoxicillin 500mg",
            description: "Capsule, 100s",
            icon: faPills,
            category: "Antibiotics",
            stock: {
                amount: "12 units",
                level: "low"
            },
            minLevel: "25 units",
            expiry: {
                date: "Dec 2023",
                status: "safe"
            },
            location: "Main Pharmacy"
        },
        {
            name: "Insulin Glargine",
            description: "Injection, 10mL",
            icon: faSyringe,
            category: "Diabetes",
            stock: {
                amount: "25 units",
                level: "medium"
            },
            minLevel: "15 units",
            expiry: {
                date: "Aug 2023",
                status: "warning"
            },
            location: "Refrigerator"
        },
        {
            name: "Ibuprofen 200mg",
            description: "Tablet, 500s",
            icon: faTablets,
            category: "Pain Relief",
            stock: {
                amount: "48 units",
                level: "high"
            },
            minLevel: "20 units",
            expiry: {
                date: "Mar 2024",
                status: "safe"
            },
            location: "Main Pharmacy"
        },
        {
            name: "Loratadine 10mg",
            description: "Tablet, 100s",
            icon: faCapsules,
            category: "Antihistamine",
            stock: {
                amount: "8 units",
                level: "low"
            },
            minLevel: "15 units",
            expiry: {
                date: "May 2023",
                status: "danger"
            },
            location: "Main Pharmacy"
        },
        {
            name: "Omeprazole 20mg",
            description: "Capsule, 30s",
            icon: faPrescriptionBottle,
            category: "Gastrointestinal",
            stock: {
                amount: "18 units",
                level: "medium"
            },
            minLevel: "10 units",
            expiry: {
                date: "Nov 2023",
                status: "safe"
            },
            location: "Main Pharmacy"
        },
        {
            name: "Atorvastatin 40mg",
            description: "Tablet, 90s",
            icon: faPrescriptionBottleAlt,
            category: "Cardiovascular",
            stock: {
                amount: "32 units",
                level: "high"
            },
            minLevel: "15 units",
            expiry: {
                date: "Jan 2024",
                status: "safe"
            },
            location: "Main Pharmacy"
        }
    ];

  return (
    <div className={styles.content}>
        <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Inventory</h1>
            <div className={styles.contentActions}>
                <button 
                    type='submit'
                    className={styles.btnPrimary} 
                    id="newMedicineBtn"
                    onClick={() => openModal && openModal('item')}
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
                <table className={styles.inventoryTable}>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Min. Level</th>
                            <th>Expiry Date</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inventoryItems.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.medicineInfo}>
                                        <div className={styles.medicineIcon}>
                                            <FontAwesomeIcon icon={item.icon} />
                                        </div>
                                        <div>
                                            <div className={styles.medicineName}>{item.name}</div>
                                            <div className={styles.medicineCategory}>{item.description}</div>
                                        </div>
                                        </div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td className={`${styles.stockLevel} ${styles[item.stock.level]}`}>
                                        {item.stock.amount}
                                    </td>
                                    <td>{item.minLevel}</td>
                                    <td>
                                        <span className={`${styles.expiryStatus} ${styles[item.expiry.status]}`}>
                                            {item.expiry.date}
                                        </span>
                                    </td>
                                    <td>{item.location}</td>
                                    <td>
                                        <button className={`${styles.actionBtn} ${styles.primary}`}>
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        {/* <button className={`${styles.actionBtn} ${styles.cancel}`}>
                                            <FontAwesomeIcon icon={faTrash} /> Delete
                                        </button> */}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}

export default InventoryPage