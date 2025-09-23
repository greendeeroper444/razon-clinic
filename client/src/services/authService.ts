import axios from './httpClient';
import { LoginFormData, LoginResponse, SignupFormData, SignupResponse } from '../types';
import API_BASE_URL from '../ApiBaseUrl';

export const register = async (userData: Omit<SignupFormData, 'confirmPassword' | 'agreeToTerms'>) => {
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

export const login = async (loginData: Omit<LoginFormData, 'rememberMe'>) => {
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

export const getProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
        throw new Error('An error occurred while fetching profile');
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/logout`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
        throw new Error('An error occurred during logout');
    }
};

