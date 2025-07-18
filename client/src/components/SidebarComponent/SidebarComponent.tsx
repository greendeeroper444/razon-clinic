import { useState, useEffect } from 'react'
import styles from './SidebarComponent.module.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClinicMedical, 
    faTachometerAlt, 
    faCalendarCheck, 
    faProcedures, 
    faPills, 
    faSignOutAlt, 
    faArchive,
    faBars,
    faChevronLeft,
    faFileMedical,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { logoutUser } from '../../pages/services/authService';
import { useAuth } from '../../hooks/usesAuth';
import { SidebarProps } from '../../types';


const SidebarComponent: React.FC<SidebarProps> = ({sidebarCollapsed, toggleSidebar}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const { currentUser, clearAuth } = useAuth();

    
    //check if screen size is mobile
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        //initial check
        checkScreenSize();
        
        //add event listener
        window.addEventListener('resize', checkScreenSize);
        
        //cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    
    const isActive = (path: string): boolean => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logoutUser();
            
            clearAuth();
            
            //show success toast
            toast.success('Successfully logged out');
            
            //redirect to login page
            navigate('/');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to logout');
            }
        }
    };

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
                    <FontAwesomeIcon icon={faBars} />
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
                    <FontAwesomeIcon icon={faClinicMedical} color='#4169ff' size='1x' />
                    {
                        currentUser && (currentUser.role === 'Doctor') ? (
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
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
            </div>

            <div className={styles.sidebarMenu}>
                <div className={styles.menuTitle}>NAVIGATION</div>

                <Link
                    to='/admin/dashboard'
                    className={`${styles.menuItem} ${isActive('/admin/dashboard') ? styles.active : ''}`}
                    title='Dashboard'
                >
                    <FontAwesomeIcon icon={faTachometerAlt} color='#94a3b8' />
                    <span className={styles.menuText}>Dashboard</span>
                </Link>

                {
                    currentUser && (currentUser.role === 'Staff') && (
                        <Link
                            to='/admin/appointments'
                            className={`${styles.menuItem} ${isActive('/admin/appointments') ? styles.active : ''}`}
                            title='Appointments'
                        >
                            <FontAwesomeIcon icon={faCalendarCheck} color='#94a3b8' />
                            <span className={styles.menuText}>Appointments</span>
                        </Link>
                    )
                }

                <Link
                    to='/admin/patients'
                    className={`${styles.menuItem} ${isActive('/admin/patients') ? styles.active : ''}`}
                    title='Patients'
                >
                    <FontAwesomeIcon icon={faProcedures} color='#94a3b8' />
                    <span className={styles.menuText}>Patients</span>
                </Link>

                {
                    currentUser && (currentUser.role === 'Doctor') ? (
                        <Link
                            to='/admin/medical-records'
                            className={`${styles.menuItem} ${isActive('/admin/medical-records') ? styles.active : ''}`}
                            title='Medical Records'
                        >
                            <FontAwesomeIcon icon={faFileMedical} color='#94a3b8' />
                            <span className={styles.menuText}>Medical Records</span>
                        </Link>
                    ) : (
                        <Link
                            to='/admin/inventory'
                            className={`${styles.menuItem} ${isActive('/admin/inventory') ? styles.active : ''}`}
                            title='Inventory'
                        >
                            <FontAwesomeIcon icon={faPills} color='#94a3b8' />
                            <span className={styles.menuText}>Inventory</span>
                        </Link>
                    )
                }
                
                
                <Link
                    to='/admin/billings-payment'
                    className={`${styles.menuItem} ${isActive('/admin/billings-payment') ? styles.active : ''}`}
                    title='Billings'
                >
                    <FontAwesomeIcon icon={faCreditCard} color='#94a3b8' />
                    <span className={styles.menuText}>Billings</span>
                </Link>
                <Link
                    to='/admin/archives'
                    className={`${styles.menuItem} ${isActive('/admin/archives') ? styles.active : ''}`}
                    title='Archive'
                >
                    <FontAwesomeIcon icon={faArchive} color='#94a3b8' />
                    <span className={styles.menuText}>Archive</span>
                </Link>

                <div
                    className={styles.menuItem}
                    onClick={handleLogout}
                    title='Logout'
                >
                    <FontAwesomeIcon icon={faSignOutAlt} color='#94a3b8' />
                    <span className={styles.menuText}>Logout</span>
                </div>
            </div>
        </div>
    </>
  )
}

export default SidebarComponent