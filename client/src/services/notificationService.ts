import axios from './httpClient'
import API_BASE_URL from '../ApiBaseUrl'

export const getNotifications = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        }

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(
            `${API_BASE_URL}/api/notifications/getNotifications`,
            { params: queryParams }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getUnreadNotificationCount = async (recipientType: string, recipientId: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/notifications/unread-count`,
            { 
                params: { 
                    recipientType, 
                    recipientId 
                } 
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const markAsRead = async (notificationId: string) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/notifications/markAsRead/${notificationId}/mark-read`,
            {},
        );
    
        return response.data;
    } catch (error) {
        console.error('Error marking as read notifications:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/notifications/markAllAsRead`,
            {},
        );
    
        return response.data;
    } catch (error) {
        console.error('Error marking all as read notifications:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deleteNotification = async (notificationId: string) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/notifications/deleteNotification/${notificationId}`,
        );
    
        return response.data;
    } catch (error) {
        console.error('Error deleting notifications:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const deleteAllRead = async () => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/notifications/deleteAllRead`);
    
        return response.data;
    } catch (error) {
        console.error('Error deleting all read notifications:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};