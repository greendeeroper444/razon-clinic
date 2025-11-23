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
        console.error('Error register:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
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
        console.error('Error login:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
        return response.data;
    } catch (error) {
        console.error('Error fetch profile:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/logout`);
        return response.data;
    } catch (error) {
        console.error('Error logout:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }

        throw error;
    }
};