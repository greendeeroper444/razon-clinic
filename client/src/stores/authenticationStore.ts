import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { AuthenticationState, LoginFormData, SignupFormData } from '../types'
import { getProfile, login, logout, register } from '../services'
import { sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } from '../services/otpService'
import { handleStoreError } from '../utils'

const STORAGE_KEY = 'signup_form_data'
const STORAGE_TIMESTAMP_KEY = 'signup_form_timestamp'
const ONE_HOUR_MS = 60 * 60 * 1000

const initialLoginForm: LoginFormData = {
    emailOrContactNumber: '',
    password: '',
    rememberMe: false
}

const initialSignupForm: SignupFormData = {
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    emailOrContactNumber: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    sex: '',
    address: '',
    religion: '',
    agreeToTerms: false
}

export const useAuthenticationStore = create<AuthenticationState>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                
                loginForm: initialLoginForm,
                signupForm: initialSignupForm,
                signupStep: 1,
                completedSteps: new Set<number>(),

                //otprelated state
                otpSent: false,
                otpVerified: false,
                registrationContactNumber: '',
                otpId: null,
                otpExpiresAt: null,

                showPassword: false,
                showConfirmPassword: false,
                validationErrors: {},

                clearValidationErrors: () => set({ validationErrors: {} }),

                // ============================================
                //SEND REGISTRATION OTP (Step 1)
                // ============================================
                sendRegistrationOTP: async (userData) => {
                    try {
                        set({ 
                            isLoading: true,
                            validationErrors: {}
                        })
                        
                        const response = await sendRegistrationOTP(userData)
                        
                        if (response.success) {
                            set({
                                otpSent: true,
                                registrationContactNumber: userData.emailOrContactNumber,
                                otpId: response.data.otpId,
                                otpExpiresAt: response.data.expiresAt,
                                isLoading: false
                            })
                            
                            toast.success(response.message)
                            return true
                        }
                        
                        return false
                    } catch (error) {
                        handleStoreError(error, {
                            set,
                            defaultMessage: 'Failed to send OTP'
                        });
                        set({ isLoading: false })
                        throw error;
                    }
                },

                // ============================================
                //VERIFY REGISTRATION OTP (Step 2)
                // ============================================
                verifyRegistrationOTP: async (contactNumber: string, otp: string) => {
                    try {
                        set({ 
                            isLoading: true,
                            validationErrors: {}
                        })
                        
                        const response = await verifyRegistrationOTP(contactNumber, otp)
                        
                        if (response.success) {
                            //clear saved form data after successful registration
                            get().clearSavedFormData()
                            
                            set({
                                otpVerified: true,
                                user: response.data.user,
                                isAuthenticated: true,
                                isLoading: false
                            })
                            
                            toast.success(response.message)
                            return true
                        }
                        
                        return false
                    } catch (error) {
                        handleStoreError(error, {
                            set,
                            defaultMessage: 'Failed to verify OTP'
                        });
                        set({ isLoading: false })
                        throw error;
                    }
                },

                // ============================================
                //RESEND REGISTRATION OTP
                // ============================================
                resendRegistrationOTP: async (contactNumber: string) => {
                    try {
                        set({ isLoading: true })
                        
                        const response = await resendRegistrationOTP(contactNumber)
                        
                        if (response.success) {
                            set({
                                otpId: response.data.otpId,
                                otpExpiresAt: response.data.expiresAt,
                                isLoading: false
                            })
                            
                            toast.success(response.message)
                            return true
                        }
                        
                        return false
                    } catch (error) {
                        handleStoreError(error, {
                            set,
                            defaultMessage: 'Failed to resend OTP'
                        });
                        set({ isLoading: false })
                        throw error;
                    }
                },

                // ============================================
                //Direct registration without OTP
                // ============================================
                register: async (userData) => {
                    try {
                        set({ 
                            isLoading: true,
                            validationErrors: {}
                        })
                        
                        await register(userData)
                        
                        get().clearSavedFormData()
                        
                        toast.success('Registration successful! Logging you in...')
                        
                        //automatically login after registration using the store's login method
                        const credentials = {
                            emailOrContactNumber: userData.emailOrContactNumber,
                            password: userData.password,
                            rememberMe: false
                        }
                        
                        //use the store's login method which handles everything properly
                        await get().login(credentials)
                        
                    } catch (error) {
                        handleStoreError(error, {
                            set,
                            defaultMessage: 'Failed to register'
                        });
                        set({ isLoading: false })
                        throw error;
                    }
                },

                fetchUserProfile: async () => {
                    try {
                        const response = await getProfile()
                        set({ user: response.data.user })
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error)
                        throw error
                    }
                },

                login: async (credentials) => {
                    try {
                        set({ 
                            isLoading: true,
                            validationErrors: {}
                        })
                        
                        await login(credentials)
                        
                        await get().fetchUserProfile()

                        const { rememberMe } = get().loginForm
                        if (rememberMe) {
                            localStorage.setItem('rememberUser', 'true')
                        }
                        
                        set({
                            isAuthenticated: true,
                            isLoading: false
                        })
                        
                        toast.success('Login successful!')
                        
                    } catch (error) {
                        handleStoreError(error, {
                            set,
                            defaultMessage: 'Failed to login'
                        });
                        set({ 
                            isLoading: false,
                            isAuthenticated: false,
                            user: null
                        })
                        throw error;
                    }
                },

                logout: async () => {
                    try {
                        await logout()
                    } catch (error) {
                        console.error('Logout error:', error)
                    }

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        loginForm: initialLoginForm,
                        signupForm: initialSignupForm,
                        signupStep: 1,
                        completedSteps: new Set(),
                        otpSent: false,
                        otpVerified: false,
                        registrationContactNumber: '',
                        otpId: null,
                        otpExpiresAt: null,
                        validationErrors: {}
                    })
                    
                    toast.success('Logged out successfully')
                },

                updateLoginForm: (field, value) => {
                    set((state) => ({
                        loginForm: {
                            ...state.loginForm,
                            [field]: value
                        }
                    }))
                    
                    get().clearValidationError(field)
                },

                updateSignupForm: (field, value) => {
                    set((state) => ({
                        signupForm: {
                            ...state.signupForm,
                            [field]: value
                        }
                    }))
                    
                    get().clearValidationError(field)
                    
                    setTimeout(() => get().saveFormData(), 500)
                },

                clearLoginForm: () => {
                    set({ 
                        loginForm: initialLoginForm,
                        validationErrors: {}
                    })
                },

                clearSignupForm: () => {
                    set({ 
                        signupForm: initialSignupForm,
                        signupStep: 1,
                        completedSteps: new Set(),
                        otpSent: false,
                        otpVerified: false,
                        registrationContactNumber: '',
                        otpId: null,
                        otpExpiresAt: null,
                        validationErrors: {}
                    })
                },

                setSignupStep: (step) => {
                    set({ signupStep: step })
                },

                nextSignupStep: () => {
                    const { signupStep } = get()
                    if (signupStep < 4) {
                        set({ signupStep: signupStep + 1 })
                        get().completeStep(signupStep)
                    }
                },

                prevSignupStep: () => {
                    const { signupStep } = get()
                    if (signupStep > 1) {
                        set({ signupStep: signupStep - 1 })
                    }
                },

                completeStep: (step) => {
                    set((state) => ({
                        completedSteps: new Set([...state.completedSteps, step])
                    }))
                },

                togglePasswordVisibility: () => {
                    set((state) => ({ showPassword: !state.showPassword }))
                },

                toggleConfirmPasswordVisibility: () => {
                    set((state) => ({ showConfirmPassword: !state.showConfirmPassword }))
                },

                setValidationErrors: (errors) => {
                    set({ validationErrors: errors })
                },

                clearValidationError: (field) => {
                    set((state) => ({
                        validationErrors: {
                            ...state.validationErrors,
                            [field]: undefined
                        }
                    }))
                },

                clearAllValidationErrors: () => {
                    set({ validationErrors: {} })
                },

                saveFormData: () => {
                    const { signupForm, signupStep, completedSteps } = get()
                    
                    const hasData = signupForm.firstName || 
                        signupForm.lastName ||
                        signupForm.middleName ||
                        signupForm.suffix ||
                        signupForm.emailOrContactNumber || 
                        signupForm.password || 
                        signupForm.birthdate || 
                        signupForm.sex || 
                        signupForm.address ||
                        signupForm.religion
                    
                    if (hasData) {
                        const dataToSave = {
                            formData: signupForm,
                            currentStep: signupStep,
                            completedSteps: Array.from(completedSteps)
                        }
                        
                        try {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
                            localStorage.setItem(STORAGE_TIMESTAMP_KEY, JSON.stringify(new Date().getTime()))
                        } catch (error) {
                            console.warn('Failed to save form data to localStorage:', error)
                        }
                    }
                },

                loadFormData: () => {
                    try {
                        const savedData = localStorage.getItem(STORAGE_KEY)
                        const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)
                        
                        if (savedData && savedTimestamp) {
                            const parsedData = JSON.parse(savedData)
                            const timestamp = JSON.parse(savedTimestamp)
                            const now = new Date().getTime()
                            const timeDiff = now - timestamp
                            
                            if (timeDiff < ONE_HOUR_MS) {
                                set({
                                    signupForm: parsedData.formData,
                                    signupStep: parsedData.currentStep,
                                    completedSteps: new Set(parsedData.completedSteps)
                                })
                                toast.success('Form data restored from previous session')
                            } else {
                                get().clearSavedFormData()
                                toast.info('Previous form data expired')
                            }
                        }
                    } catch (error) {
                        console.warn('Failed to load form data from localStorage:', error)
                    }
                },

                clearSavedFormData: () => {
                    try {
                        localStorage.removeItem(STORAGE_KEY)
                        localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
                    } catch (error) {
                        console.warn('Failed to clear saved form data:', error)
                    }
                },

                initializeAuth: async () => {
                    //don't initialize auth on login/signup pages
                    if (typeof window !== 'undefined' && 
                        (window.location.pathname.includes('/login') || 
                        window.location.pathname.includes('/signup') ||
                        window.location.pathname.includes('/register'))) {
                        return;
                    }
                    
                    try {
                        await get().fetchUserProfile()
                        const { user } = get()
                        if (user) {
                            set({ isAuthenticated: true })
                        }
                    } catch (error) {
                        console.log(error)
                        set({ 
                            user: null, 
                            isAuthenticated: false 
                        })
                    }
                },

                checkTokenExpiration: () => {
                    return true
                }
            }),
            {
                name: 'authentication-store',
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated
                })
            }
        ),
        {
            name: 'authentication-store'
        }
    )
)