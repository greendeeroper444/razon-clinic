import { FormEvent, useState } from 'react'
import styles from './LoginPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import FooterComponent from '../../../components/FooterComponent/FooterComponent'
import { loginUser } from '../../services/authService'
import { LoginFormData, ValidationErrors } from '../../../types/auth'
import { validateLoginForm } from '../../../utils/validators'
import { toast } from 'sonner'
import SectionFeatures from '../../../components/SectionFeatures/SectionFeatures'
import backgroundImage from '../../../assets/backgrounds/background2.png'

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<LoginFormData>({
        emailOrContactNumber: '',
        password: '',
        rememberMe: false,
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData({
            ...formData,
            [name]: newValue
        });
        
        //clear validation error when field is updated
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors({
                ...validationErrors,
                [name]: undefined
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (formData: LoginFormData) => {
        setIsLoading(true);
        
        try {
            const response = await loginUser({
                emailOrContactNumber: formData.emailOrContactNumber,
                password: formData.password
            });

            toast.success('Login successful!');
            
            //store the token
            localStorage.setItem('token', response.data.token);
            
            // Store user data including role
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            
            //if remember me is checked, store in persistent storage
            if (formData.rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            }
            
            //role-based redirection
            const userRole = response.data.user.role;
            if (userRole === 'Patient') {
                navigate('/user/appointments');
            } else if (userRole === 'Doctor' || userRole === 'Staff') {
                navigate('/admin/dashboard');
            } else {
                //fallback in case role is undefined or not in expected values
                navigate('/');
            }
            
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Invalid credentials or server error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        //validate form
        const errors = validateLoginForm(formData);
        setValidationErrors(errors);
        
        if (Object.keys(errors).length === 0) {
            await onSubmit(formData);
        } else {
            // Show validation errors as toasts
            Object.values(errors).forEach(error => {
                if (error) {
                    toast.error(error);
                }
            });
        }
    };

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
                                    value={formData.emailOrContactNumber}
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
                                    value={formData.password}
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
                                    checked={formData.rememberMe}
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

        <FooterComponent />
    </div>
  )
}

export default LoginPage