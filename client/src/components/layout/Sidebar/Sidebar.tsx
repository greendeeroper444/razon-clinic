import { useState, useEffect } from 'react'
import styles from './Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { Hospital, LayoutDashboard, CalendarCheck, Bed, Pill, Menu, ChevronLeft, FileText, CreditCard, User, ScrollText, Trash } from 'lucide-react';
import { SidebarProps } from '../../../types';
import { useAuthenticationStore } from '../../../stores/authenticationStore';


const Sidebar: React.FC<SidebarProps> = ({sidebarCollapsed, toggleSidebar}) => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const { user } = useAuthenticationStore()

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkScreenSize();
        
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    
    const isActive = (path: string): boolean => location.pathname === path;

  return (
    <> 
        {
            isMobile && sidebarCollapsed && (
                <button 
                    type='button'
                    className={styles.mobileToggle}
                    onClick={toggleSidebar}
                    aria-label='Open sidebar'
                >
                    <Menu size={20} />
                </button>
            )
        }
    
        <div className={`
            ${styles.sidebar} 
            ${sidebarCollapsed ? styles.collapsed : ''} 
            ${isMobile && sidebarCollapsed ? styles.hidden : ''}
        `}>
            <div className={styles.sidebarHeader}>
                <h2>
                    <Hospital color='#4169ff' size={20} />
                    {
                        user && (user.role === 'Doctor') ? (
                            <span className={styles.logoText}>Doctor Panel</span>
                        ) : (
                            <span className={styles.logoText}>Staff Panel</span>
                        )
                    }
                    
                </h2>
                
                {/* toggle button */}
                <button 
                    type='submit'
                    className={styles.toggleButton}
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <div className={styles.sidebarMenu}>
                <div className={styles.menuTitle}>NAVIGATION</div>

                <Link
                    to='/admin/dashboard'
                    className={`${styles.menuItem} ${isActive('/admin/dashboard') ? styles.active : ''}`}
                    title='Dashboard'
                >
                    <LayoutDashboard color='#94a3b8' size={20} />
                    <span className={styles.menuText}>Dashboard</span>
                </Link>

                {
                    user && (user.role === 'Staff') && (
                        <>
                            <Link
                                to='/admin/appointments'
                                className={`${styles.menuItem} ${isActive('/admin/appointments') ? styles.active : ''}`}
                                title='Appointments'
                            >
                                <CalendarCheck color='#94a3b8' size={20} />
                                <span className={styles.menuText}>Appointments</span>
                            </Link>

                            <Link
                                to='/admin/patients'
                                className={`${styles.menuItem} ${isActive('/admin/patients') ? styles.active : ''}`}
                                title='Patients'
                            >
                                <Bed color='#94a3b8' size={20} />
                                <span className={styles.menuText}>Patients</span>
                            </Link>
                        </>
                    )
                }

                {
                    user && (user.role === 'Doctor') ? (
                        <>
                            <Link
                                to='/admin/medical-records'
                                className={`${styles.menuItem} ${isActive('/admin/medical-records') ? styles.active : ''}`}
                                title='Medical Records'
                            >
                                <FileText color='#94a3b8' size={20} />
                                <span className={styles.menuText}>Medical Records</span>
                            </Link>
                            {/* <Link
                                to='/admin/growth-milestone'
                                className={`${styles.menuItem} ${isActive('/admin/growth-milestone') ? styles.active : ''}`}
                                title='Growth Milestone'
                            >
                                <TrendingUp color='#94a3b8' size={20} />
                                <span className={styles.menuText}>Growth Milestone</span>
                            </Link> */}
                        </>
                    ) : (
                        <Link
                            to='/admin/inventory'
                            className={`${styles.menuItem} ${isActive('/admin/inventory') ? styles.active : ''}`}
                            title='Inventory'
                        >
                            <Pill color='#94a3b8' size={20} />
                            <span className={styles.menuText}>Inventory</span>
                        </Link>
                    )
                }
                
                
                <Link
                    to='/admin/billings-payment'
                    className={`${styles.menuItem} ${isActive('/admin/billings-payment') ? styles.active : ''}`}
                    title='Billings'
                >
                    <CreditCard color='#94a3b8' size={20} />
                    <span className={styles.menuText}>Billings</span>
                </Link>
                <Link
                    to='/admin/patient-management'
                    className={`${styles.menuItem} ${isActive('/admin/patient-management') ? styles.active : ''}`}
                    title='Patients'
                >
                    <User color='#94a3b8' size={20} />
                    <span className={styles.menuText}>Patient Management</span>
                </Link>

                <Link
                    to='/admin/reports'
                    className={`${styles.menuItem} ${isActive('/admin/reports') ? styles.active : ''}`}
                    title='Reports'
                >
                    <ScrollText color='#94a3b8' size={20} />
                    <span className={styles.menuText}>Reports</span>
                </Link>

               {
                    user && user.role === 'Doctor' && (
                        <Link
                            to='/admin/trash'
                            className={`${styles.menuItem} ${isActive('/admin/trash') ? styles.active : ''}`}
                            title='Reports'
                        >
                            <Trash color='#94a3b8' size={20} />
                            <span className={styles.menuText}>Trash</span>
                        </Link>
                    )
               }
            </div>
        </div>
    </>
  )
}

export default Sidebar