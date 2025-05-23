import { useState, useEffect, useRef } from 'react'
import styles from './NavbarComponent.module.css'
import NotificationComponent from '../NotificationComponent/NotificationComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faBell, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { User } from '../../types/auth';
import { getFirstAndLastName, getFirstLetterOfFirstAndLastName } from '../../utils/user';
import { NavbarProps } from '../../types/components';
import { getNotifications } from '../../pages/services/notificationService';

const NavbarComponent: React.FC<NavbarProps> = ({sidebarCollapsed, toggleSidebar}) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        //check if user is authenticated
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('userData');
        
        if (token && userDataString) {
            try {
                const userData = JSON.parse(userDataString) as User;
                setIsAuthenticated(true);
                setCurrentUser(userData);
                //fetch initial unread count when user is authenticated
                fetchUnreadCount();
            } catch (error) {
                //handle invalid JSON
                console.error("Error parsing user data:", error);
                //clear invalid data
                localStorage.removeItem('userData');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
    }, [location.pathname]);

    //fetch unread count independently
    const fetchUnreadCount = async () => {
        try {
            const response = await getNotifications(1, 1); //fetch 1 item to get unread count
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    //auto-refetch unread count every 10 seconds
    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    //handle unread count updates from notification component
    const handleUnreadCountChange = (count: number) => {
        setUnreadCount(count);
    };
    
    const toggleNotifications = () => {
        setShowNotifications(prev => !prev);
    };

    const toggleMobileSearch = () => {
        setShowMobileSearch(prev => !prev);
        //focus the input when search bar is shown
        setTimeout(() => {
            if (!showMobileSearch && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 100);
    };

    //close notifications when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Element;
        if (!target.closest(`.${styles.notificationIcon}`) && showNotifications) {
            setShowNotifications(false);
        }
        
        //close mobile search when clicking outside
        if (!target.closest(`.${styles.searchContainer}`) && 
            !target.closest(`.${styles.mobileSearchOverlay}`) && 
            showMobileSearch) {
            setShowMobileSearch(false);
        }
    };

    //handle window resize to close mobile search when returning to desktop size
    const handleResize = () => {
        
        const desktopBreakpoint = 768;
        
        if (window.innerWidth >= desktopBreakpoint && showMobileSearch) {
            setShowMobileSearch(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        window.addEventListener('resize', handleResize);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, [showNotifications, showMobileSearch]);

  return (
    <div className={styles.navbar}>
        <div className={styles.navbarLeft}>
            <button 
                type='submit'
                className={styles.toggleButton} 
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
            </button>
            
            {/* desktop search bar */}
            <div className={styles.searchBar}>
                <FontAwesomeIcon icon={faSearch} />
                <input type="text" placeholder='Search patients, medicines...' />
            </div>
        </div>
       
        
        {/* mobile search overlay - moved outside navbar structure */}
        {
            showMobileSearch && (
                <div className={styles.mobileSearchOverlay}>
                    <div className={styles.mobileSearchBar}>
                        <FontAwesomeIcon icon={faSearch} />
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            placeholder='Search patients, medicines...' 
                        />
                    </div>
                </div>
            )
        }
        <div className={styles.navbarRight}>
            {/* mobile search icon & bar */}
            <div className={styles.searchContainer}>
                <div className={styles.mobileSearchIcon} onClick={toggleMobileSearch}>
                    <FontAwesomeIcon icon={faSearch} />
                </div>
            </div>
            {
                currentUser && (currentUser.role === 'Doctor') ? (
                    <div className={styles.notificationIcon} onClick={toggleNotifications}>
                        <FontAwesomeIcon icon={faBell} />
                        
                        {
                            unreadCount > 0 && (
                                <span className={styles.notificationBadge}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )
                        }
                        <NotificationComponent 
                            isVisible={showNotifications} 
                            onUnreadCountChange={handleUnreadCountChange}
                        />
                    </div>
                ) : (
                    <div className={styles.notificationIcon} onClick={toggleNotifications}>
                        <FontAwesomeIcon icon={faBell} />
                        <span className={styles.notificationBadge}>
                            2
                        </span>
                        <NotificationComponent 
                            isVisible={showNotifications} 
                            onUnreadCountChange={handleUnreadCountChange}
                        />
                    </div>
                )
            }
            <div className={styles.userProfile}>
                <div className={styles.userAvatar}>{getFirstLetterOfFirstAndLastName(currentUser?.fullName)}</div>
                <div className={styles.userName}>{getFirstAndLastName(currentUser?.fullName)}</div>
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '0.8rem' }} />
            </div>
        </div>
    </div>
  )
}

export default NavbarComponent