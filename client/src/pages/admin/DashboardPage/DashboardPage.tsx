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
    faCapsules
} from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
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

    const appointments = [
        {
            patient: { name: 'John Doe', id: '#PT-1001', initials: 'JD' },
            time: '10:30 AM',
            date: 'Today',
            doctor: 'Dr. Smith',
            type: 'Checkup'
        },
        {
            patient: { name: 'Mary Smith', id: '#PT-2045', initials: 'MS' },
            time: '11:15 AM',
            date: 'Today',
            doctor: 'Dr. Johnson',
            type: 'Follow-up'
        },
        {
            patient: { name: 'Robert Johnson', id: '#PT-3120', initials: 'RJ' },
            time: '2:00 PM',
            date: 'Today',
            doctor: 'Dr. Williams',
            type: 'Emergency'
        },
        {
            patient: { name: 'Sarah Brown', id: '#PT-1876', initials: 'SB' },
            time: '3:30 PM',
            date: 'Today',
            doctor: 'Dr. Anderson',
            type: 'Vaccination'
        }
    ];

    const inventory = [
        {
            name: 'Amoxicillin 500mg',
            icon: faPills,
            category: 'Antibiotics',
            stockLevel: 'low',
            units: '12 units',
            lastOrdered: '2 days ago'
        },
        {
            name: 'Insulin Glargine',
            icon: faSyringe,
            category: 'Hormones',
            stockLevel: 'medium',
            units: '25 units',
            lastOrdered: '1 week ago'
        },
        {
            name: 'Ibuprofen 200mg',
            icon: faTablets,
            category: 'NSAIDs',
            stockLevel: 'high',
            units: '48 units',
            lastOrdered: '3 weeks ago'
        },
        {
            name: 'Loratadine 10mg',
            icon: faCapsules,
            category: 'Allergy',
            stockLevel: 'low',
            units: '8 units',
            lastOrdered: '5 days ago'
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
                <h3 className={styles.sectionTitle}>Upcoming Appointments</h3>
                <div className={styles.sectionActions}>
                    <a href="/razon-pediatric/appointment.html">
                    <span>View All</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                    </a>
                </div>
            </div>

            <div className={styles.tableResponsive}>
                <table className={styles.appointmentsTable}>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Time</th>
                            <th>Doctor</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            appointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.patientInfo}>
                                            <div className={styles.patientAvatar}>{appointment.patient.initials}</div>
                                            <div>
                                            <div className={styles.patientName}>{appointment.patient.name}</div>
                                            <div className={styles.patientId}>{appointment.patient.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.appointmentTime}>{appointment.time}</div>
                                        <div className={styles.appointmentDate}>{appointment.date}</div>
                                    </td>
                                    <td>{appointment.doctor}</td>
                                    <td>
                                        <span className={`${styles.appointmentType} ${appointment.type === 'Emergency' ? styles.emergency : ''}`}>
                                            {appointment.type}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={`${styles.actionBtn} ${styles.view}`}>View</button>
                                        <button className={`${styles.actionBtn} ${styles.cancel}`}>Cancel</button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>

        {/* inventory section */}
        <div className={styles.inventorySection}>
            <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Medicine Inventory</h3>
            <div className={styles.sectionActions}>
                <a href="/razon-pediatric/pages/inventory.html">
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
                        <th>Last Ordered</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inventory.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.medicineInfo}>
                                            <div className={styles.medicineIcon}>
                                                <FontAwesomeIcon icon={item.icon} />
                                            </div>
                                            <div>
                                                <div className={styles.medicineName}>{item.name}</div>
                                                <div className={styles.medicineCategory}>{item.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td className={`${styles.stockLevel} ${styles[item.stockLevel]}`}>{item.units}</td>
                                    <td>{item.lastOrdered}</td>
                                    <td>
                                    <button className={`${styles.actionBtn} ${styles.restock}`}>
                                        <FontAwesomeIcon icon={faPlus} /> Restock
                                    </button>
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

export default DashboardPage