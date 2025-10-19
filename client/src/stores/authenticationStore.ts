import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { AuthenticationState, LoginFormData, SignupFormData } from '../types'
import { getProfile, login, logout, register } from '../services'

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

                showPassword: false,
                showConfirmPassword: false,
                validationErrors: {},

                register: async (userData) => {
                    try {
                        set({ isLoading: true })
                        
                        await register(userData)
                        
                        get().clearSavedFormData()
                        
                        toast.success('Registration successful! Redirecting to login...')
                        
                        set({ isLoading: false })
                        
                    } catch (error) {
                        console.error('Error registering user:', error)
                        const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration'
                        toast.error(errorMessage)
                        set({ isLoading: false })
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
                        set({ isLoading: true })
                        
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
                        console.error('Error during login:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Invalid credentials'
                        toast.error(errorMessage)
                        set({ 
                            isLoading: false,
                            isAuthenticated: false,
                            user: null
                        })
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
                    set({ loginForm: initialLoginForm })
                },

                clearSignupForm: () => {
                    set({ 
                        signupForm: initialSignupForm,
                        signupStep: 1,
                        completedSteps: new Set()
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