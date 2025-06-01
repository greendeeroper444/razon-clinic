import React, { useState, useEffect, useCallback } from 'react'
import styles from './DashboardPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarDay, 
    faUserClock, 
    faExclamationTriangle, 
    faUserMd,
    faChevronRight,
    faArrowUp,
    faPlus,
    faPills,
    faSyringe,
    faTablets,
    faCapsules,
    faPrescriptionBottle,
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { getAppointments } from '../../services/appoinmentService';
import { AppointmentResponse } from '../../../types/appointment';
import { getFirstLetterOfFirstAndLastName, getMiddleNameInitial } from '../../../utils/user';
import { formatDate, formatTime } from '../../../utils/formatDateTime';
import { useNavigate } from 'react-router-dom';
import { getInventoryItems } from '../../services/inventoryItemService';

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

const DashboardPage = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [inventoryLoading, setInventoryLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    //fetch appointments function
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAppointments();
            if (response.data.success) {
                //show only first 5 appointments for dashboard
                setAppointments(response.data.data.slice(0, 5));
            } else {
                setError('Failed to fetch appointments');
            }
        } catch (err) {
            setError('An error occurred while fetching appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    //fetch inventory items function
    const fetchInventoryItems = useCallback(async () => {
        try {
            setInventoryLoading(true);
            const response = await getInventoryItems();
            if (response.data.inventoryItems) {
                //show only first 4 inventory items for dashboard
                setInventoryItems(response.data.inventoryItems.slice(0, 4));
            } else {
                setInventoryError('Failed to fetch inventory items');
            }
        } catch (err) {
            setInventoryError('An error occurred while fetching inventory items');
            console.error('Error fetching inventory items:', err);
        } finally {
            setInventoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchInventoryItems();
    }, [fetchAppointments, fetchInventoryItems]);

    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`);
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

    const formatInventoryDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Pending':
                return styles.statusPending;
            case 'Scheduled':
                return styles.statusScheduled;
            case 'Completed':
                return styles.statusCompleted;
            case 'Cancelled':
                return styles.statusCancelled;
            case 'Rebooked':
                return styles.statusRebooked;
            default:
                return '';
        }
    };

    const dashboardCards = [
        {
            title: 'Today\'s Appointments',
            value: '18',
            icon: faCalendarDay,
            iconColor: 'purple',
            footer: <><FontAwesomeIcon icon={faArrowUp} className={styles.positive} /> <span className={styles.positive}>3 more than yesterday</span></>
        },
        {
            title: 'Patients Waiting',
            value: '5',
            icon: faUserClock,
            iconColor: 'orange',
            footer: <>Average wait time: <span>15 min</span></>
        },
        {
            title: 'Low Stock Items',
            value: '7',
            icon: faExclamationTriangle,
            iconColor: 'red',
            footer: <><FontAwesomeIcon icon={faArrowUp} className={styles.negative} /> <span className={styles.negative}>2 critical items</span></>
        },
        {
            title: 'Available Doctors',
            value: '4',
            icon: faUserMd,
            iconColor: 'green',
            footer: <span>2 GPs, 1 Dentist, 1 Specialist</span>
        }
    ];

    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Clinic Overview</h1>
            </div>

            {/* dashboard cards */}
            <div className={styles.dashboardCards}>
                {
                    dashboardCards.map((card, index) => (
                        <div className={styles.card} key={index}>
                            <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <FontAwesomeIcon icon={card.icon} />
                            </div>
                            </div>
                            <div className={styles.cardValue}>{card.value}</div>
                            <div className={styles.cardFooter}>{card.footer}</div>
                        </div>
                    ))
                }
            </div>

            {/* upcoming appointments */}
            <div className={styles.appointmentsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        Upcoming Appointments ({appointments.length})
                    </h3>
                    <div className={styles.sectionActions}>
                        <a href="#" onClick={() => navigate('/admin/appointments')}>
                            <span>View All</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </a>
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.appointmentsTable}>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Preferred Date</th>
                                <th>Preferred Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.noData}>
                                        Loading appointments...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className={styles.noData}>
                                        {error}
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.noData}>
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>
                                            <div className={styles.patientInfo}>
                                                <div className={styles.patientAvatar}>
                                                    {
                                                        (() => {
                                                            const firstName = appointment.firstName || appointment.firstName;
                                                            return firstName 
                                                                ? getFirstLetterOfFirstAndLastName(firstName)
                                                                : 'N/A';
                                                        })()
                                                    }
                                                </div>
                                                <div>
                                                    <div className={styles.patientName}>
                                                        {appointment.firstName} {appointment.lastName} {getMiddleNameInitial(appointment.middleName)}
                                                    </div>
                                                    <div className={styles.patientId}>
                                                        APT-ID: {appointment.appointmentNumber || 'Walk-in'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.appointmentDate}>
                                                {formatDate(appointment.preferredDate)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.appointmentTime}>
                                                {formatTime(appointment.preferredTime)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                type='button' 
                                                className={`${styles.actionBtn} ${styles.view}`}
                                                onClick={() => handleViewClick(appointment)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* inventory section */}
            <div className={styles.inventorySection}>
                <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                    Medicine Inventory ({inventoryItems.length})
                </h3>
                <div className={styles.sectionActions}>
                    <a href="#" onClick={() => navigate('/admin/inventory')}>
                    <span>Manage Inventory</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                    </a>
                </div>
                </div>

                <div className={styles.tableResponsive}>
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
                            {inventoryLoading ? (
                                <tr>
                                    <td colSpan={6} className={styles.noData}>
                                        Loading inventory items...
                                    </td>
                                </tr>
                            ) : inventoryError ? (
                                <tr>
                                    <td colSpan={6} className={styles.noData}>
                                        {inventoryError}
                                    </td>
                                </tr>
                            ) : inventoryItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={styles.noData}>
                                        No inventory items found.
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
                                                {formatInventoryDate(item.expiryDate)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={`${styles.actionBtn} ${styles.restock}`} onClick={() => navigate('/admin/inventory')}>
                                                <FontAwesomeIcon icon={faPlus} /> Restock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage