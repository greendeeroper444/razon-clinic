import axios from './httpClient'
import API_BASE_URL from "../ApiBaseUrl";

export const getUsers = async (params = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10,
            search: ''
        };

        const queryParams = { ...defaultParams, ...params };

        const response = await axios.get(`${API_BASE_URL}/api/users/getUsers`,
            { params: queryParams }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const getUserById = async (userId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/getUserById/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const archiveUser = async (userId: string) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/users/archiveUser/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error archiving user:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const unarchiveUser = async (userId: string) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/users/unarchiveUser/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error unarchiving user:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const archiveMultipleUsers = async (userIds: string[]) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/users/archiveMultipleUsers`, {
            userIds
        });
        return response.data;
    } catch (error) {
        console.error('Error archiving multiple users:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const unarchiveMultipleUsers = async (userIds: string[]) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/users/unarchiveMultipleUsers`, {
            userIds
        });
        return response.data;
    } catch (error) {
        console.error('Error unarchiving multiple users:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};