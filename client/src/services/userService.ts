import axios from "axios";
import { UserResponse, UsersResponse, UserDetailed } from "../types";
import API_BASE_URL from "../ApiBaseUrl";



//get all users (for dropdown) - matches the endpoint used in modal
export const getUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get<UsersResponse>(
            `${API_BASE_URL}/api/users/getUsers`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
        throw new Error('An error occurred while fetching users');
    }
};



//get user by ID
export const getUserById = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get<UserResponse>(
            `${API_BASE_URL}/api/users/getUserById/${userId}`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user details');
        }
        throw new Error('An error occurred while fetching user details');
    }
};




//create new user
export const createUser = async (userData: Partial<UserDetailed>) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await axios.post<UserResponse>(
            `${API_BASE_URL}/api/users/createUser`,
            userData,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create user');
        }
        throw new Error('An error occurred while creating user');
    }
};




//update user
export const updateUser = async (userId: string, userData: Partial<UserDetailed>) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await axios.put<UserResponse>(
            `${API_BASE_URL}/api/users/updateUser/${userId}`,
            userData,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update user');
        }
        throw new Error('An error occurred while updating user');
    }
};

//delete user
export const deleteUser = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.delete(
            `${API_BASE_URL}/api/users/deleteUser/${userId}`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete user');
        }
        throw new Error('An error occurred while deleting user');
    }
};

//get all users (includes doctors, staff, and users)
export const getAllUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get(
            `${API_BASE_URL}/api/users/getAllUsers`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
        throw new Error('An error occurred while fetching users');
    }
};

//get user profile (current authenticated user)
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get(
            `${API_BASE_URL}/api/users/getUserProfile`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
        }
        throw new Error('An error occurred while fetching user profile');
    }
};