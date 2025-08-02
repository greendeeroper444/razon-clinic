import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { AuthenticationState, LoginFormData, SignupFormData } from '../types'
import { loginUser, registerUser } from '../services'

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

                //authentication actions
                login: async (credentials) => {
                    set({ isLoading: true })
                    
                    try {
                        const response = await loginUser(credentials)
                        const { user, token } = response.data
                        
                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false
                        })
                        
                        //store in localStorage for persistence
                        localStorage.setItem('token', token)
                        localStorage.setItem('userData', JSON.stringify(user))
                        
                        //handle remember me
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

                logout: () => {
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
                    
                    //clear localStorage
                    localStorage.removeItem('token')
                    localStorage.removeItem('userData')
                    localStorage.removeItem('rememberUser')
                    
                    toast.success('Logged out successfully')
                },

                register: async (userData) => {
                    set({ isLoading: true })
                    
                    try {
                        const response = await registerUser(userData)
                        const { token } = response.data
                        
                        set({ isLoading: false })
                        
                        //store token
                        localStorage.setItem('token', token)
                        
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

                //local storage for form data
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

                //auth helpers
                initializeAuth: () => {
                    try {
                        const token = localStorage.getItem('token')
                        const userData = localStorage.getItem('userData')
                        
                        if (token && userData) {
                            const user = JSON.parse(userData)
                            set({
                                user,
                                token,
                                isAuthenticated: true
                            })
                        }
                    } catch (error) {
                        console.warn('Failed to initialize auth from localStorage:', error)
                        //clear corrupted data
                        localStorage.removeItem('token')
                        localStorage.removeItem('userData')
                    }
                },

                checkTokenExpiration: () => {
                    const { token } = get()
                    if (!token) return false
                    
                    try {
                        
                        //simple JWT expiration check (you might want to implement proper JWT decoding)
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        const now = Date.now() / 1000
                        
                        if (payload.exp && payload.exp < now) {
                            get().logout()
                            toast.error('Session expired. Please log in again.')
                            return false
                        }
                        
                        return true
                    } catch (error) {
                        console.warn('Failed to check token expiration:', error)
                        return true
                    }
                }
            }),
            {
                name: 'authentication-store',
                //only persist essential auth data
                partialize: (state) => ({
                    user: state.user,
                    token: state.token,
                    isAuthenticated: state.isAuthenticated
                })
            }
        ),
        {
            name: 'authentication-store'
        }
    )
)