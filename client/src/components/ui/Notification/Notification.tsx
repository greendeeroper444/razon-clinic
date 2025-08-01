import { useEffect, useState, useCallback } from 'react'
import styles from './Notification.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom'
import { faCalendar, faPrescriptionBottleAlt, faFolder, faCheckDouble, faUserPlus, faBoxes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getNotifications, markAllAsRead, markAsRead } from '../../../services';
import { useAuth } from '../../../hooks/usesAuth';
import { NotificationProps, NotificationTypeToUICategory, NotificationFormData } from '../../../types';
import { formatTimeAgo } from '../../../utils';

interface ExtendedNotificationProps extends NotificationProps {
    onUnreadCountChange?: (count: number) => void;
}

const Notification: React.FC<ExtendedNotificationProps> = ({ 
    isVisible, 
    onUnreadCountChange 
}) => {
    const [notifications, setNotifications] = useState<NotificationFormData[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    
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
        // const interval = setInterval(() => {
        //     fetchNotifications();
        // }, 10000); // 10 seconds

        // return () => clearInterval(interval);
        fetchNotifications();
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
    const handleNotificationClick = async (notification: NotificationFormData) => {
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
    

    
    //helper function to check if notification is clickable
    const isNotificationClickable = (notification: NotificationFormData) => {
        const appointmentTypes = ['AppointmentReminder', 'AppointmentCreated', 'AppointmentUpdated', 'AppointmentCancelled'];
        return appointmentTypes.includes(notification.type) && notification.entityId && notification.entityType === 'Appointment';
    };
    
    if (!isVisible) return null;


  return (
    <div className={styles.notificationPanel}>
        <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <span className={styles.notificationCount}>{unreadCount} new</span>
        </div>
      
        {
            currentUser && (currentUser.role === 'Staff') && (
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
                                            <div className={styles.notificationTime}>{formatTimeAgo(notification.createdAt)}</div>
                                        </div>
                                        {/* {!notification.isRead && <div className={styles.unreadDot}></div>} */}
                                    </div>
                                );
                            })
                        )
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

export default Notification