import axios from 'axios'
import API_BASE_URL from '../../ApiBaseUrl'
import { Notification, NotificationResponse } from '../../types';

export const getNotifications = async (
    page: number = 1, 
    limit: number = 10, 
    isRead?: boolean
) => {
    let url = `${API_BASE_URL}/api/notifications/getNotifications?page=${page}&limit=${limit}`;
    
    if (isRead !== undefined) {
        url += `&isRead=${isRead}`;
    }
    
    return await axios.get<NotificationResponse>(
        url,
            {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
}


export const markAsRead = async (notificationId: string) => {
    return await axios.patch<{success: boolean, message: string, data: Notification}>(
        `${API_BASE_URL}/api/notifications/markAsRead/${notificationId}/mark-read`,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};

export const markAllAsRead = async () => {
    return await axios.patch<{success: boolean, message: string, count: number}>(
        `${API_BASE_URL}/api/notifications/markAllAsRead`,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};


export const deleteNotification = async (notificationId: string) => {
    return await axios.delete<{success: boolean, message: string}>(
        `${API_BASE_URL}/api/notifications/deleteNotification/${notificationId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};


export const deleteAllRead = async () => {
    return await axios.delete<{success: boolean, message: string, count: number}>(
        `${API_BASE_URL}/api/notifications/deleteAllRead`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
};