import { useState, useEffect, useCallback } from 'react'
import { getNotifications } from '../pages/services/notificationService'
import { Notification, NotificationFilters } from '../types'

interface UseNotificationsResult {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
}

export const useNotifications = (
    initialFilters: NotificationFilters,
    autoFetch: boolean = true
): UseNotificationsResult => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
        setLoading(true);
        setError(null);
        const response = await getNotifications(initialFilters);
        setNotifications(response.data.data);
        } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        } finally {
        setLoading(false);
        }
    }, [initialFilters]);

    const fetchUnreadCount = useCallback(async () => {
        if (!initialFilters.recipientType || !initialFilters.recipientId) return;
        
        try {
            const response = await getUnreadNotificationCount(
                initialFilters.recipientType,
                initialFilters.recipientId
            );
            setUnreadCount(response.data.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [initialFilters.recipientType, initialFilters.recipientId]);

    useEffect(() => {
        if (autoFetch) {
        fetchNotifications();
        fetchUnreadCount();
        }
    }, [autoFetch, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount
    };
};

export default useNotifications;