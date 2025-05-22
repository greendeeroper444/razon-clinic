import { FormEvent, useState } from 'react'
import styles from './SignupPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash, 
    faUser,
    faMapMarkerAlt,
    faVenusMars,
    faCalendar
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import FooterComponent from '../../../components/FooterComponent/FooterComponent'
import { registerUser } from '../../services/authService'
import { SignupFormData, ValidationErrors } from '../../../types/auth'
import { validateSignupForm } from '../../../utils/validators'
import { toast } from 'sonner'
import SectionFeatures from '../../../components/SectionFeatures/SectionFeatures'

const SignupPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        emailOrContactNumber: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        sex: '',
        address: '',
        agreeToTerms: false
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
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
    
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const onSubmit = async (formData: SignupFormData) => {
        setIsLoading(true);
        
        try {
            const response = await registerUser({
                fullName: formData.fullName,
                emailOrContactNumber: formData.emailOrContactNumber,
                password: formData.password,
                birthdate: formData.birthdate,
                sex: formData.sex,
                address: formData.address
            });

            toast.success('Registration successful! Redirecting to login...');
            
            //store the token if needed
            localStorage.setItem('token', response.data.token);
            
            //redirect after a small delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An error occurred during registration');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        //validate form
        const errors = validateSignupForm(formData);
        setValidationErrors(errors);
        
        if (Object.keys(errors).length === 0) {
            await onSubmit(formData);
        } else {
            // show validation errors as toasts
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
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Hello, welcome!</h2>
                    <p className={styles.formSubtitle}>Create your account</p>
                    
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                            <input 
                                type='text' 
                                name='fullName'
                                placeholder='Full Name' 
                                className={`${styles.formInput} ${validationErrors.fullName ? styles.inputError : ''}`}
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

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
                    
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                name='confirmPassword'
                                placeholder='Confirm Password' 
                                className={`${styles.formInput} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button 
                                type='button' 
                                className={styles.passwordToggle}
                                onClick={toggleConfirmPasswordVisibility}
                                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
                            <input 
                                type='date' 
                                name='birthdate'
                                placeholder='Birthdate' 
                                className={`${styles.formInput} ${validationErrors.birthdate ? styles.inputError : ''}`}
                                value={formData.birthdate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faVenusMars} className={styles.inputIcon} />
                            <select
                                name='sex'
                                id='genderSelect'
                                aria-label='Gender'
                                className={`${styles.formInput} ${validationErrors.sex ? styles.inputError : ''}`}
                                value={formData.sex}
                                onChange={handleChange}
                            >
                                <option value=''>Select Gender</option>
                                <option value='Male'>Male</option>
                                <option value='Female'>Female</option>
                                <option value='Other'>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
                            <textarea
                                name='address'
                                placeholder='Full Address' 
                                className={`${styles.formInput} ${styles.textareaInput} ${validationErrors.address ? styles.inputError : ''}`}
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className={styles.formOptions}>
                        <div className={`${styles.rememberMe} ${validationErrors.agreeToTerms ? styles.checkboxError : ''}`}>
                            <input 
                                type='checkbox' 
                                id='agreeToTerms'
                                name='agreeToTerms' 
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                            />
                            <label htmlFor='agreeToTerms'>I agree to the Terms and Conditions
                                {/* <Link to="/terms" className={styles.termsLink}>Terms and Conditions</Link> */}
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        type='submit' 
                        className={styles.loginButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
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
                        Already have an account? <Link to='/login' className={styles.signupLink}>Log in</Link>
                    </p>
                </form>
            </div>
        </section>

       <SectionFeatures />

        <FooterComponent />
    </div>
  )
}

export default SignupPage