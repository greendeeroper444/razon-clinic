import axios from './httpClient'
import API_BASE_URL from "../ApiBaseUrl";

// ============================================
// REGISTRATION OTP ENDPOINTS
// ============================================

export const sendRegistrationOTP = async (userData: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register/send-otp`, userData);
        return response.data;
    } catch (error) {
        console.error('Error sending registration OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const verifyRegistrationOTP = async (contactNumber: string, otp: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register/verify-otp`, {
            contactNumber,
            otp
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying registration OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const resendRegistrationOTP = async (contactNumber: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register/resend-otp`, {
            contactNumber
        });
        return response.data;
    } catch (error) {
        console.error('Error resending registration OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

// ============================================
// PASSWORD RESET OTP ENDPOINTS
// ============================================

export const sendPasswordResetOTP = async (contactNumber: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/sendPasswordResetOTP`, {
            contactNumber
        });
        return response.data;
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const verifyOTP = async (contactNumber: string, otp: string, purpose: string = 'password_reset') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/verifyOTP`, {
            contactNumber,
            otp,
            purpose
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const resendPasswordResetOTP = async (contactNumber: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/sendPasswordResetOTP`, {
            contactNumber
        });
        return response.data;
    } catch (error) {
        console.error('Error resending OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const verifyPasswordResetOTP = async (contactNumber: string, otp: string, purpose: string = 'password_reset') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/verifyPasswordResetOTP`, {
            contactNumber,
            otp,
            purpose
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const resetPasswordWithOTP = async (
    contactNumber: string, 
    otp: string, 
    newPassword: string, 
    confirmPassword: string
) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/resetPasswordWithOTP`, {
            contactNumber,
            otp,
            newPassword,
            confirmPassword
        });
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

export const forgotPassword = async (contactNumber: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/otp/forgotPassword`, {
            contactNumber
        });
        return response.data;
    } catch (error) {
        console.error('Error in forgot password:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};