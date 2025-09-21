import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { AuthenticationState, LoginFormData, SignupFormData } from '../types'
import { getProfile, login, logout, register } from '../services'

const STORAGE_KEY = 'signup_form_data'
const STORAGE_TIMESTAMP_KEY = 'signup_form_timestamp'
const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour in milliseconds

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
                    set({ isLoading: true })
                    
                    try {
                        await register(userData)
                        
                        set({ isLoading: false })
                        
                        //clear saved form data on successful registration
                        get().clearSavedFormData()
                        
                        toast.success('Registration successful! Redirecting to login...')
                        
                        return Promise.resolve()
                        
                    } catch (error) {
                        set({ isLoading: false })
                        const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration'
                        toast.error(errorMessage)
                        throw error
                    }
                },

                fetchUserProfile: async () => {
                    try {
                        const response = await getProfile()
                        set({ user: response.data.user })
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error)
                    }
                },

                //authentication actions
                login: async (credentials) => {
                    set({ isLoading: true })
                    
                    try {
                        await login(credentials);

                        set({
                            isAuthenticated: true,
                            isLoading: false
                        })
                        
                        await get().fetchUserProfile()

                        //handle remember me - only store this preference
                        const { rememberMe } = get().loginForm
                        if (rememberMe) {
                            localStorage.setItem('rememberUser', 'true')
                        }
                        
                        toast.success('Login successful!')
                        
                        //role-based redirection logic would be handled in the component
                        return Promise.resolve()
                        
                    } catch (error) {
                        set({ isLoading: false })
                        const errorMessage = error instanceof Error ? error.message : 'Invalid credentials or server error'
                        toast.error(errorMessage)
                        throw error
                    }
                },

                logout: async () => {

                    await logout();

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

                
                //form actions
                updateLoginForm: (field, value) => {
                    set((state) => ({
                        loginForm: {
                        ...state.loginForm,
                        [field]: value
                        }
                    }))
                    
                    //clear validation error for this field
                    get().clearValidationError(field)
                },

                updateSignupForm: (field, value) => {
                    set((state) => ({
                        signupForm: {
                        ...state.signupForm,
                        [field]: value
                        }
                    }))
                    
                    //clear validation error for this field
                    get().clearValidationError(field)
                    
                    //auto-save form data
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

                //step navigation
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

                //password visibility
                togglePasswordVisibility: () => {
                    set((state) => ({ showPassword: !state.showPassword }))
                },

                toggleConfirmPasswordVisibility: () => {
                    set((state) => ({ showConfirmPassword: !state.showConfirmPassword }))
                },

                //validation
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

                //local storage for form data (signup form only)
                saveFormData: () => {
                    const { signupForm, signupStep, completedSteps } = get()
                    
                    //don't save if form is completely empty
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
                            
                            //check if saved data is less than 1 hour old
                            if (timeDiff < ONE_HOUR_MS) {
                                set({
                                    signupForm: parsedData.formData,
                                    signupStep: parsedData.currentStep,
                                    completedSteps: new Set(parsedData.completedSteps)
                                })
                                toast.success('Form data restored from previous session')
                            } else {
                                //data is older than 1 hour, remove it
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

                //auth helpers (simplified for cookie-based auth)
                initializeAuth: async () => {
                    const isRemembered = localStorage.getItem('rememberUser')
                    if (isRemembered && get().isAuthenticated) {
                        await get().fetchUserProfile()
                    }
                },

                checkTokenExpiration: () => {
                    //token expiration is now handled by server via cookies
                    //always return true since server manages token validation
                    return true
                }
            }),
            {
                name: 'authentication-store',
                //only persist user data and auth status - token handled via cookies
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