import { useEffect } from 'react'
import styles from './DashboardPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faUserClock, faExclamationTriangle, faUserMd, faChevronRight, faArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AppointmentResponse } from '../../../types';
import { getFirstLetterOfFirstAndLastName, getMiddleNameInitial, formatDate, formatTime, getAppointmentStatusClass, getItemIcon, getStockStatus, getExpiryStatus } from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { Calendar, Header, Loading, Main } from '../../../components';
import { useAppointmentStore, useInventoryStore } from '../../../stores';

const DashboardPage = () => {
    const navigate = useNavigate();
    //zustand store selectors
    const { appointments, loading, error, fetchAppointments } = useAppointmentStore();
    const { inventoryItems, loading: inventoryLoading, error: inventoryError, fetchInventoryItems } = useInventoryStore();

    useEffect(() => {
        fetchAppointments();
        fetchInventoryItems();
    }, [fetchAppointments, fetchInventoryItems])


    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`);
    };


    const formatInventoryDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
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
    <Main 
        loading={loading} 
        loadingType='skeleton' 
        error={error}
        loadingDelay={300}
        loadingMinDuration={800}
    >
        <Header
            title='Clinic Overview'
        />

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

            <Calendar />
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

            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading upcominng appointment data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
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
                                {
                                    appointments.length === 0 ? (
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
                                                    <span className={`${styles.statusBadge} ${getAppointmentStatusClass(appointment.status, styles)}`}>
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
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
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

            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading medicines data...'
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
                                                <td>
                                                    ₱{item.price}.00
                                                </td>
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
                                                    <button type='button' className={`${styles.actionBtn} ${styles.restock}`} onClick={() => navigate('/admin/inventory')}>
                                                        <FontAwesomeIcon icon={faPlus} /> Restock
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
    </Main>
  )
}

export default DashboardPage