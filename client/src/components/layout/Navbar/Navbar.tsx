import { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faBell, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { getFirstAndLastName, getFirstLetterOfFirstAndLastName } from '../../../utils'
import { getNotifications } from '../../../services'
import { NavbarProps } from '../../../types'
import Notification from '../../ui/Notification/Notification'
import { useAuthenticationStore } from '../../../stores/authenticationStore'

const Navbar: React.FC<NavbarProps> = ({sidebarCollapsed, toggleSidebar}) => {
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const {
        user,
        isAuthenticated,
    } = useAuthenticationStore()


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
        // if (isAuthenticated && user?.role !== 'Doctor') {
        //     const interval = setInterval(() => {
        //         fetchUnreadCount();
        //     }, 1000);

        //     return () => clearInterval(interval);
        // }
        if (isAuthenticated && user?.role !== 'Doctor') {
            fetchUnreadCount();
        }
    }, [isAuthenticated, user?.role]);

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
                user && (user.role === 'Staff') && (
                    <div className={styles.notificationIcon} onClick={toggleNotifications}>
                        <FontAwesomeIcon icon={faBell} />
                        
                        {
                            unreadCount > 0 && (
                                <span className={styles.notificationBadge}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )
                        }
                        <Notification
                            isVisible={showNotifications} 
                            onUnreadCountChange={handleUnreadCountChange}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>
                )
            }
            <div className={styles.userProfile}>
                <div className={styles.userAvatar}>{getFirstLetterOfFirstAndLastName(user?.firstName)}</div>
                <div className={styles.userName}>{getFirstAndLastName(user?.firstName)}</div>
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '0.8rem' }} />
            </div>
        </div>
    </div>
  )
}

export default Navbar