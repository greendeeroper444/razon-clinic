import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import { sendPasswordResetOTP, verifyOTP as verifyOTPService, resendPasswordResetOTP, resetPasswordWithOTP, verifyPasswordResetOTP } from '../services/otpService';
import { OTPState } from '../types';

export const useOTPStore = create<OTPState>()(
    devtools(
        (set, get) => ({
            contactNumber: '',
            userId: null,
            otpId: null,
            expiresAt: null,
            loading: false,
            error: null,
            success: false,
            message: null,

            sendPasswordResetOTP: async (contactNumber: string) => {
                try {
                    set({ loading: true, error: null, success: false, message: null });
                    
                    const response = await sendPasswordResetOTP(contactNumber);
                    
                    if (response.success) {
                        set({ 
                            contactNumber,
                            userId: response.data.userId,
                            otpId: response.data.otpId,
                            expiresAt: new Date(response.data.expiresAt),
                            loading: false,
                            success: true,
                            message: response.message
                        });
                        
                        toast.success(response.message);
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message,
                            success: false
                        });
                        toast.error(response.message);
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || 'Failed to send OTP. Please try again.';
                    set({ 
                        loading: false, 
                        error: errorMessage,
                        success: false
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            // verifyOTP: async (contactNumber: string, otp: string): Promise<boolean> => {
            //     try {
            //         set({ loading: true, error: null, success: false, message: null });
                    
            //         const response = await verifyOTPService(contactNumber, otp, 'password_reset');
                    
            //         if (response.success) {
            //             set({ 
            //                 loading: false,
            //                 success: true,
            //                 message: response.message,
            //                 userId: response.data.userId
            //             });
                        
            //             toast.success(response.message);
            //             return true;
            //         } else {
            //             set({ 
            //                 loading: false, 
            //                 error: response.message,
            //                 success: false
            //             });
            //             toast.error(response.message);
            //             return false;
            //         }
            //     } catch (error: any) {
            //         const errorMessage = error?.message || 'Invalid OTP. Please try again.';
            //         set({ 
            //             loading: false, 
            //             error: errorMessage,
            //             success: false
            //         });
            //         toast.error(errorMessage);
            //         return false;
            //     }
            // },

            resendOTP: async (contactNumber: string) => {
                try {
                    set({ loading: true, error: null, message: null });
                    
                    const response = await resendPasswordResetOTP(contactNumber);
                    
                    if (response.success) {
                        set({ 
                            otpId: response.data.otpId,
                            expiresAt: new Date(response.data.expiresAt),
                            loading: false,
                            message: response.message
                        });
                        
                        toast.success(response.message);
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message
                        });
                        toast.error(response.message);
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || 'Failed to resend OTP. Please try again.';
                    set({ 
                        loading: false, 
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            verifyOTP: async (contactNumber: string, otp: string): Promise<boolean> => {
                try {
                    set({ loading: true, error: null, success: false, message: null });
                    
                    const response = await verifyPasswordResetOTP(contactNumber, otp, 'password_reset');
                    
                    if (response.success) {
                        set({ 
                            loading: false,
                            success: true,
                            message: response.message,
                            userId: response.data.userId
                        });
                        
                        toast.success(response.message);
                        return true;
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message,
                            success: false
                        });
                        toast.error(response.message);
                        return false;
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || 'Invalid OTP. Please try again.';
                    set({ 
                        loading: false, 
                        error: errorMessage,
                        success: false
                    });
                    toast.error(errorMessage);
                    return false;
                }
            },

            resetPassword: async (
                contactNumber: string, 
                otp: string, 
                newPassword: string, 
                confirmPassword: string
            ) => {
                try {
                    set({ loading: true, error: null, success: false, message: null });
                    
                    const response = await resetPasswordWithOTP(
                        contactNumber, 
                        otp, 
                        newPassword, 
                        confirmPassword
                    );
                    
                    if (response.success) {
                        set({ 
                            loading: false,
                            success: true,
                            message: response.message
                        });
                        
                        toast.success(response.message);
                        
                        // setTimeout(() => {
                        //     get().reset();
                        // }, 1000);
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message,
                            success: false
                        });
                        toast.error(response.message);
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || 'Failed to reset password. Please try again.';
                    set({ 
                        loading: false, 
                        error: errorMessage,
                        success: false
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            setContactNumber: (contactNumber: string) => {
                set({ contactNumber });
            },

            clearError: () => {
                set({ error: null });
            },

            clearSuccess: () => {
                set({ success: false, message: null });
            },

            reset: () => {
                set({
                    contactNumber: '',
                    userId: null,
                    otpId: null,
                    expiresAt: null,
                    loading: false,
                    error: null,
                    success: false,
                    message: null
                });
            }
        }),
        {
            name: 'otp-store'
        }
    )
);