import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NotificationComponent.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faPrescriptionBottleAlt, 
  faFolder, 
  faCheckDouble, 
  faUserPlus,
  faBoxes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { NotificationComponentProps } from '../../types/notification';
import { Notification, NotificationTypeToUICategory } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications, markAllAsRead, markAsRead } from '../../pages/services/notificationService';
import { User } from '../../types/auth';

interface ExtendedNotificationComponentProps extends NotificationComponentProps {
    onUnreadCountChange?: (count: number) => void;
}

const NotificationComponent: React.FC<ExtendedNotificationComponentProps> = ({ 
    isVisible, 
    onUnreadCountChange 
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
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
    
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getNotifications(1, 20);
            
            if (response.data.success) {
                setNotifications(response.data.data);
                const newUnreadCount = response.data.unreadCount || 0;
                setUnreadCount(newUnreadCount);
                
                //notify parent component about unread count change
                if (onUnreadCountChange) {
                    onUnreadCountChange(newUnreadCount);
                }
            } else {
                setError('Failed to load notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Error loading notifications');
        } finally {
            setLoading(false);
        }
    }, [onUnreadCountChange]);
    
    //fetch notifications when component becomes visible
    useEffect(() => {
        if (isVisible) {
            fetchNotifications();
        }
    }, [isVisible, fetchNotifications]);

    //auto-refetch notifications every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [fetchNotifications]);
    
    const handleMarkAllAsRead = async () => {
        try {
            const response = await markAllAsRead();
            
            if (response.data.success) {
                //update local state to mark all as read
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                
                //notify parent component about unread count change
                if (onUnreadCountChange) {
                    onUnreadCountChange(0);
                }
            } else {
                setError('Failed to mark notifications as read');
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
            setError('Error updating notifications');
        }
    };
    
    //handle notification clicks
    const handleNotificationClick = async (notification: Notification) => {
        try {
            //mark as read if it's not already read
            if (!notification.isRead) {
                const response = await markAsRead(notification.id);
                
                if (response.data.success) {
                    //update local state to mark this notification as read
                    setNotifications(notifications.map(n => 
                        n.id === notification.id ? { ...n, isRead: true } : n
                    ));
                    //decrease unread count
                    const newUnreadCount = Math.max(0, unreadCount - 1);
                    setUnreadCount(newUnreadCount);
                    
                    //notify parent component about unread count change
                    if (onUnreadCountChange) {
                        onUnreadCountChange(newUnreadCount);
                    }
                }
            }
            
            //check if it's an appointment-related notification and has an entityId
            const appointmentTypes = ['AppointmentReminder', 'AppointmentCreated', 'AppointmentUpdated', 'AppointmentCancelled'];
            
            if (appointmentTypes.includes(notification.type) && notification.entityId && notification.entityType === 'Appointment') {
                //navigate to the appointment details page
                navigate(`/admin/appointments/details/${notification.entityId}`);
            }
            //more navigation logic for other notification types here
            //for example:
            // else if (notification.type === 'PatientCreated' && notification.entityId) {
            //     navigate(`/admin/patients/details/${notification.entityId}`);
            // }
        } catch (err) {
            console.error('Error marking notification as read:', err);
            //still navigate even if marking as read fails
            const appointmentTypes = ['AppointmentReminder', 'AppointmentCreated', 'AppointmentUpdated', 'AppointmentCancelled'];
            
            if (appointmentTypes.includes(notification.type) && notification.entityId && notification.entityType === 'Appointment') {
                navigate(`/admin/appointments/details/${notification.entityId}`);
            }
        }
    };
    
    //function to render appropriate icon based on notification type
    const renderNotificationIcon = (type: string) => {
        const uiCategory = NotificationTypeToUICategory[type as keyof typeof NotificationTypeToUICategory] || 'system';
        
        switch (uiCategory) {
        case 'appointment':
            return <FontAwesomeIcon icon={faCalendar} />;
        case 'medical':
            return <FontAwesomeIcon icon={faPrescriptionBottleAlt} />;
        case 'patient':
            return <FontAwesomeIcon icon={faUserPlus} />;
        case 'inventory':
            return <FontAwesomeIcon icon={faBoxes} />;
        default:
            return <FontAwesomeIcon icon={faFolder} />;
        }
    };
    
    //function to format date relative to now
    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };
    
    //helper function to check if notification is clickable
    const isNotificationClickable = (notification: Notification) => {
        const appointmentTypes = ['AppointmentReminder', 'AppointmentCreated', 'AppointmentUpdated', 'AppointmentCancelled'];
        return appointmentTypes.includes(notification.type) && notification.entityId && notification.entityType === 'Appointment';
    };
    
    if (!isVisible) return null;



    const notificationsStaff = [
        {
            id: 1,
            type: "medical",
            title: "Prescription Refill",
            message: "Currently unavailable due to stock depletion.",
            time: "1 hour ago",
            isRead: false
        },
        {
            id: 2,
            type: "medical",
            title: "Insulin Glargine",
            message: "Limited stock available.",
            time: "3 hours ago",
            isRead: true
        }

    ];

  return (
    <div className={styles.notificationPanel}>
        <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <span className={styles.notificationCount}>{unreadCount} new</span>
        </div>
      
        {
            currentUser && (currentUser.role === 'Doctor') ? (
                <div className={styles.notificationList}>
                    {
                        loading ? (
                        <div className={styles.loadingState}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <p>Loading notifications...</p>
                        </div>
                        ) : error ? (
                            <div className={styles.errorState}>
                                <p>{error}</p>
                                <button type='button' onClick={fetchNotifications}>Retry</button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No notifications to display</p>
                            </div>
                        ) : (
                            notifications.map(notification => {
                                const uiCategory = NotificationTypeToUICategory[notification.type as keyof typeof NotificationTypeToUICategory] || 'system';
                                const clickable = isNotificationClickable(notification);
                                
                                return (
                                    <div 
                                        key={notification.id} 
                                        className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''} ${clickable ? styles.clickable : styles.notClickable}`}
                                        onClick={() => clickable && handleNotificationClick(notification)}
                                    >
                                        <div className={`${styles.notificationIcon} ${styles[uiCategory]}`}>
                                            {renderNotificationIcon(notification.type)}
                                        </div>
                                        <div className={styles.notificationContent}>
                                            <div className={styles.notificationTitle}>{notification.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                                            <div className={styles.notificationMessage}>{notification.message}</div>
                                            <div className={styles.notificationTime}>{formatTime(notification.createdAt)}</div>
                                        </div>
                                        {/* {!notification.isRead && <div className={styles.unreadDot}></div>} */}
                                    </div>
                                );
                            })
                        )
                    }
                </div>
            ) : (
                <div className={styles.notificationList}>
                {
                    notificationsStaff.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                        >
                            <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                                {notification.type === 'appointment' && <FontAwesomeIcon icon={faCalendar} />}
                                {notification.type === 'medical' && <FontAwesomeIcon icon={faPrescriptionBottleAlt} />}
                                {notification.type === 'archive' && <FontAwesomeIcon icon={faFolder} />}
                            </div>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationTitle}>{notification.title}</div>
                                <div className={styles.notificationMessage}>{notification.message}</div>
                                <div className={styles.notificationTime}>{notification.time}</div>
                            </div>
                            {!notification.isRead && <div className={styles.unreadDot}></div>}
                        </div>
                    ))
                }
            </div>
            )
        }
        
        <div className={styles.notificationFooter}>
            <button 
                type='button'
                className={styles.markAllRead}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || loading}
            >
                <FontAwesomeIcon icon={faCheckDouble} /> Mark all as read
            </button>
            <button type='button' className={styles.viewAll}>
                View all
            </button>
        </div>
    </div>
  )
}

export default NotificationComponent