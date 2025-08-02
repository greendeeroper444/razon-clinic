import { FormEvent, useEffect } from 'react'
import styles from './LoginPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SectionFeatures, Footer } from '../../../components'
import { useAuthenticationStore } from '../../../stores/authenticationStore'
import { validateLoginForm } from '../../../utils'
import backgroundImage from '../../../assets/backgrounds/background2.png'

const LoginPage = () => {
    const navigate = useNavigate()
    
    //zustand store selectors
    const {
        loginForm,
        isLoading,
        showPassword,
        validationErrors,
        user,
        updateLoginForm,
        togglePasswordVisibility,
        setValidationErrors,
        clearAllValidationErrors,
        login,
        initializeAuth
    } = useAuthenticationStore()

    
    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    //redirect if already authenticated
    useEffect(() => {
        if (user) {
            const userRole = user.role
            if (userRole === 'User') {
                navigate('/user/appointments')
            } else if (userRole === 'Doctor' || userRole === 'Staff') {
                navigate('/admin/dashboard')
            } else {
                navigate('/')
            }
        }
    }, [user, navigate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value
        updateLoginForm(name as keyof typeof loginForm, newValue)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        //clear previous errors
        clearAllValidationErrors()
        
        //validate form
        const errors = validateLoginForm(loginForm)
        setValidationErrors(errors)
        
        if (Object.keys(errors).length === 0) {
            try {
                await login({
                    emailOrContactNumber: loginForm.emailOrContactNumber,
                    password: loginForm.password
                })
                
                //navigation is handled in the useEffect above
            } catch (error) {
                console.log(error);
            }
        } else {
            //show validation errors as toasts
            Object.values(errors).forEach(error => {
                if (error) {
                    toast.error(error)
                }
            })
        }
    }

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <div className={styles.loginFormSection}>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <h2 className={styles.formTitle}>Welcome back!</h2>
                        <p className={styles.formSubtitle}>Log in to your account</p>
                        
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='emailOrContactNumber'
                                    placeholder='Email Address / Contact Number' 
                                    className={`${styles.formInput} ${validationErrors.emailOrContactNumber ? styles.inputError : ''}`}
                                    value={loginForm.emailOrContactNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name='password'
                                    placeholder='Password' 
                                    className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
                                    value={loginForm.password}
                                    onChange={handleChange}
                                />
                                <button 
                                    type='button' 
                                    className={styles.passwordToggle}
                                    onClick={togglePasswordVisibility}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.formOptions}>
                            <div className={styles.rememberMe}>
                                <input 
                                    type='checkbox' 
                                    id='rememberMe'
                                    name='rememberMe' 
                                    checked={loginForm.rememberMe}
                                    onChange={handleChange}
                                />
                                <label htmlFor='rememberMe'>Remember me</label>
                            </div>
                            <Link to='/forgot-password' className={styles.forgotPassword}>
                                Forgot password?
                            </Link>
                        </div>
                        
                        <button 
                            type='submit' 
                            className={styles.loginButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                        
                        <div className={styles.formDivider}>
                            <span>or</span>
                        </div>
                            
                        <div className={styles.socialLogin}>
                            <button 
                                type='button' 
                                className={`${styles.socialButton} ${styles.googleButton}`}
                                onClick={() => toast.info('Google authentication is not available yet')}
                            >
                                Continue with Google
                            </button>
                        </div>
                        
                        <p className={styles.signupPrompt}>
                            Don't have an account? <Link to='/signup' className={styles.signupLink}>Sign up</Link>
                        </p>
                    </form>
                </div>
                <div className={styles.backgroundImageSection}>
                    <img src={backgroundImage} alt="Login background" className={styles.backgroundImage} />
                </div>
            </div>
        </section>

        <SectionFeatures />
        <Footer />
    </div>
  )
}

export default LoginPage