import axios from 'axios';
import { LoginFormData, LoginResponse, SignupFormData, SignupResponse } from '../types';
import API_BASE_URL from '../ApiBaseUrl';

//register service
export const registerUser = async (userData: Omit<SignupFormData, 'confirmPassword' | 'agreeToTerms'>) => {
    try {
        const response = await axios.post<SignupResponse>(
            `${API_BASE_URL}/api/auth/register`, 
            userData
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
        throw new Error('An error occurred during registration');
    }
};

//login service
export const loginUser = async (loginData: Omit<LoginFormData, 'rememberMe'>) => {
    try {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/api/auth/login`, 
            loginData
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
        throw new Error('An error occurred during login');
    }
};




//get user profile service
export const getProfile = async () => {
    try {
        //get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        //set up request with authorization header
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.get(
            `${API_BASE_URL}/api/auth/getProfile`,
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
        throw new Error('An error occurred while fetching profile');
    }
};



//logout service
export const logoutUser = async () => {
    try {
        //get the token from localStorage
        const token = localStorage.getItem('token');
        
        //set up request with authorization header
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await axios.post(
            `${API_BASE_URL}/api/auth/logout`,
            {},  // empty body
            config
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
        throw new Error('An error occurred during logout');
    }
};


