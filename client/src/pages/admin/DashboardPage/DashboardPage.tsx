import { useEffect, useMemo } from 'react'
import styles from './DashboardPage.module.css';
import { ChevronRight, Plus } from 'lucide-react';
import { AppointmentResponse, InventoryItemFormData, TableColumn } from '../../../types';
import { getFirstLetterOfFirstAndLastName, formatDate, formatTime, getStatusClass, getItemIcon, getStockStatus, getExpiryStatus} from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { Calendar, Header, Loading, Main, Table } from '../../../components';
import { useAppointmentStore, useInventoryStore } from '../../../stores';
import { getDashboardSummaryCards } from '../../../config/dashboardSummaryCards';

const DashboardPage = () => {
    const navigate = useNavigate();
    
    const { appointments, loading, error, fetchAppointments } = useAppointmentStore();
    const { inventoryItems, loading: inventoryLoading, error: inventoryError, fetchInventoryItems } = useInventoryStore();

    useEffect(() => {
        fetchAppointments({});
        fetchInventoryItems({});
    }, [fetchAppointments, fetchInventoryItems])

    const dashboardCards = useMemo(() => 
        getDashboardSummaryCards(appointments, inventoryItems),
        [appointments, inventoryItems]
    );

    const handleViewClick = (appointment: AppointmentResponse) => {
        navigate(`/admin/appointments/details/${appointment.id}`);
    };

    const handleRestockClick = (item: InventoryItemFormData) => {
        navigate('/admin/inventory', { 
            state: { 
                restockItem: item,
                openRestock: true 
            } 
        });
    };

    const appointmentColumns: TableColumn<AppointmentResponse>[] = [
        {
            key: 'patient',
            header: 'PATIENT NAME',
            render: (appointment) => (
                <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                        {
                            (() => {
                                const firstName = appointment.firstName
                                return firstName 
                                    ? getFirstLetterOfFirstAndLastName(firstName)
                                    : 'N/A'
                            })()
                        }
                    </div>
                    <div>
                        <div className={styles.patientName}>
                            {appointment.firstName}
                        </div>
                        <div className={styles.patientId}>
                            APT-ID: {appointment.appointmentNumber || 'Walk-in'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'date',
            header: 'PREFERRED DATE',
            render: (appointment) => (
                <div className={styles.appointmentDate}>
                    {formatDate(appointment.preferredDate)}
                </div>
            )
        },
        {
            key: 'time',
            header: 'PREFERRED TIME',
            render: (appointment) => (
                <div className={styles.appointmentTime}>
                    {formatTime(appointment.preferredTime)}
                </div>
            )
        },
        {
            key: 'status',
            header: 'STATUS',
            render: (appointment) => (
                <span className={`${styles.statusBadge} ${getStatusClass(appointment.status, styles)}`}>
                    {appointment.status}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (appointment) => (
                <>
                    <button 
                        type='button' 
                        className={`${styles.actionBtn} ${styles.view}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(appointment);
                        }}
                    >
                        View
                    </button>
                </>
            )
        }
    ];

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
            key: 'actions',
            header: 'ACTIONS',
            render: (item) => (
                <>
                    <button 
                        type='button' 
                        className={`${styles.actionBtn} ${styles.restock}`}
                        onClick={() => handleRestockClick(item)}
                    >
                        <Plus className={styles.icon} /> Restock
                    </button>
                </>
            )
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
                                {card.icon}
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
                        <ChevronRight />
                    </a>
                </div>
            </div>

            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading upcoming appointment data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <Table
                        columns={appointmentColumns}
                        data={appointments}
                        emptyMessage='No appointments found.'
                        getRowKey={(appointment) => appointment.id}
                    />
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
                        <ChevronRight />
                    </a>
                </div>
            </div>

            {
                inventoryLoading ? (
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
                    <Table
                        columns={inventoryColumns}
                        data={inventoryItems}
                        emptyMessage='No inventory items found'
                        getRowKey={(item) => item.id || ''}
                    />
                )
            }
        </div>
    </Main>
  )
}

export default DashboardPage