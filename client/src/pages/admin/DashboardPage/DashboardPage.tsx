import { useEffect, useMemo } from 'react'
import styles from './DashboardPage.module.css';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { AppointmentResponse, InventoryItemFormData, TableColumn } from '../../../types';
import { formatDate, formatTime, getStatusClass, getItemIcon, getStockStatus, getExpiryStatus, generateInitials, generate20Only} from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { Calendar, Header, Loading, Main, Table } from '../../../components';
import { useAppointmentStore, useInventoryStore, useDashboardStore } from '../../../stores';
import { getDashboardSummaryCardsFromAPI } from '../../../config/dashboardSummaryCards';

const DashboardPage = () => {
    const navigate = useNavigate();
    
    const { appointments, loading: appointmentsLoading, error: appointmentsError, fetchAppointments } = useAppointmentStore();
    const { inventoryItems, loading: inventoryLoading, error: inventoryError, fetchInventoryItems } = useInventoryStore();
    const { 
        dashboardStats, 
        lowStockItems,
        loading: dashboardLoading, 
        statsLoading,
        statsError,
        fetchDashboardStats,
        refreshAll 
    } = useDashboardStore();

    useEffect(() => {
        fetchDashboardStats();
        fetchAppointments({});
        fetchInventoryItems({});
    }, [fetchDashboardStats, fetchAppointments, fetchInventoryItems]);

    const dashboardCards = useMemo(() => {
        if (dashboardStats) {
            return getDashboardSummaryCardsFromAPI(dashboardStats);
        }
        return [];
    }, [dashboardStats]);

    const handleRefresh = async () => {
        await refreshAll();
        await fetchAppointments({});
        await fetchInventoryItems({});
    };

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
                        {generateInitials(appointment.firstName)}
                    </div>
                    <div className={styles.patientText}>
                        <div className={styles.patientName}>
                            {generate20Only(appointment.firstName)}
                        </div>
                        <div className={styles.appointmentId}>
                            APT-ID: {appointment.appointmentNumber}
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

    const lowStockInventoryItems = useMemo(() => {
        if (lowStockItems.length > 0) {
            return lowStockItems.map(item => ({
                id: item.id,
                itemName: item.itemName,
                category: item.category as 'Vaccine' | 'Consumable Supply',
                price: item.price,
                quantityInStock: item.quantityInStock,
                quantityUsed: item.quantityUsed,
                expiryDate: item.expiryDate,
                isArchived: false
            }));
        }
        return inventoryItems;
    }, [lowStockItems, inventoryItems]);

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

    const isLoading = dashboardLoading || statsLoading;
    const hasError = statsError || appointmentsError || inventoryError;

  return (
    <Main 
        loading={isLoading} 
        loadingType='skeleton' 
        error={hasError}
        loadingDelay={300}
        loadingMinDuration={800}
    >
        <Header
            title='Clinic Overview'
            actions={
                <button 
                    type='button'
                    className={styles.refreshBtn}
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <RefreshCw className={`${styles.icon} ${isLoading ? styles.spinning : ''}`} />
                    Refresh
                </button>
            }
        />

        {/* dashboard cards */}
        <div className={styles.dashboardCards}>
            {
                statsLoading ? (
                    <Loading 
                        type='skeleton' 
                        rows={6} 
                        message='Loading dashboard statistics...'
                        delay={0}
                        minDuration={500}
                    />
                ) : dashboardCards.length > 0 ? (
                    <>
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
                                    <div className={`${styles.cardFooter} ${card.footerType ? styles[card.footerType] : ''}`}>
                                        {card.footer}
                                    </div>
                                </div>
                            ))
                        }
                        <Calendar />
                    </>
                ) : (
                    <div className={styles.noData}>
                        <p>No dashboard data available</p>
                    </div>
                )
            }
        </div>

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
                appointmentsLoading ? (
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

        <div className={styles.inventorySection}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                    Low Stock Items ({lowStockInventoryItems.length})
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
                            message='Loading low stock items...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <Table
                        columns={inventoryColumns}
                        data={lowStockInventoryItems}
                        emptyMessage='No low stock items found'
                        getRowKey={(item) => item.id || ''}
                    />
                )
            }
        </div>
    </Main>
  )
}

export default DashboardPage