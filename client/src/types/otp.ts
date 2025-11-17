export interface OTPState {
    contactNumber: string;
    userId: string | null;
    otpId: string | null;
    expiresAt: Date | null;
    loading: boolean;
    error: string | null;
    success: boolean;
    message: string | null;
    
    sendPasswordResetOTP: (contactNumber: string) => Promise<void>;
    verifyOTP: (contactNumber: string, otp: string) => Promise<boolean>;
    resendOTP: (contactNumber: string) => Promise<void>;
    resetPassword: (contactNumber: string, otp: string, newPassword: string, confirmPassword: string) => Promise<void>;
    setContactNumber: (contactNumber: string) => void;
    clearError: () => void;
    clearSuccess: () => void;
    reset: () => void;
}

export interface SendOTPResponse {
    success: boolean;
    message: string;
    data: {
        userId: string;
        contactNumber: string;
        otpId: string;
        expiresAt: string;
    };
}

export interface VerifyOTPResponse {
    success: boolean;
    message: string;
    data: {
        userId: string;
        verified: boolean;
    };
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
    data: {
        userId: string;
    };
}