import { FormEvent, useEffect } from 'react'
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
    faCalendar,
    faChurch,
    faArrowLeft,
    faArrowRight,
    faCheck
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SectionFeatures, Footer } from '../../../components'
import { useAuthenticationStore } from '../../../stores/authenticationStore'
import backgroundImage from '../../../assets/backgrounds/background2.png'

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Your personal details' },
    { id: 2, title: 'Account Security', description: 'Password and verification' },
    { id: 3, title: 'Personal Details', description: 'Additional information' },
    { id: 4, title: 'Review', description: 'Confirm your information' }
]

const SignupPage = () => {
    const navigate = useNavigate()
    
    //zustand store 
    const {
        signupForm,
        signupStep,
        completedSteps,
        isLoading,
        showPassword,
        showConfirmPassword,
        validationErrors,
        user,
        updateSignupForm,
        setSignupStep,
        nextSignupStep,
        prevSignupStep,
        completeStep,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        setValidationErrors,
        register,
        loadFormData,
        clearSavedFormData,
        initializeAuth
    } = useAuthenticationStore()

    //initialize auth and load saved form data on component mount
    useEffect(() => {
        initializeAuth()
        loadFormData()
    }, [initializeAuth, loadFormData])

    //redirect if already authenticated
    useEffect(() => {
        if (user) {
            const userRole = user.role
            if (userRole === 'Patient') {
                navigate('/user/appointments')
            } else if (userRole === 'Doctor' || userRole === 'Staff') {
                navigate('/admin/dashboard')
            } else {
                navigate('/')
            }
        }
    }, [user, navigate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        updateSignupForm(name as keyof typeof signupForm, newValue)
    }

    const validateCurrentStep = (): boolean => {
        const stepErrors: Record<string, string> = {}
        
        switch (signupStep) {
            case 1:
                if (!signupForm.firstName.trim()) {
                    stepErrors.firstName = 'First name is required'
                }
                if (!signupForm.lastName.trim()) {
                    stepErrors.lastName = 'Last name is required'
                }
                if (!signupForm.emailOrContactNumber.trim()) {
                    stepErrors.emailOrContactNumber = 'Email or contact number is required'
                }
                break
                
            case 2:
                if (!signupForm.password) {
                    stepErrors.password = 'Password is required'
                } else if (signupForm.password.length < 8) {
                    stepErrors.password = 'Password must be at least 8 characters'
                }
                if (!signupForm.confirmPassword) {
                    stepErrors.confirmPassword = 'Please confirm your password'
                } else if (signupForm.password !== signupForm.confirmPassword) {
                    stepErrors.confirmPassword = 'Passwords do not match'
                }
                break
                
            case 3:
                if (!signupForm.birthdate) {
                    stepErrors.birthdate = 'Birthdate is required'
                }
                if (!signupForm.sex) {
                    stepErrors.sex = 'Gender selection is required'
                }
                if (!signupForm.address.trim()) {
                    stepErrors.address = 'Address is required'
                }
                break
                
            case 4:
                if (!signupForm.agreeToTerms) {
                    stepErrors.agreeToTerms = 'You must agree to the terms and conditions'
                }
                break
        }
        
        setValidationErrors(stepErrors)
        return Object.keys(stepErrors).length === 0
    }

    const nextStep = () => {
        if (validateCurrentStep()) {
            completeStep(signupStep)
            if (signupStep < STEPS.length) {
                nextSignupStep()
            }
        } else {
            //show validation errors as toasts
            Object.values(validationErrors).forEach(error => {
                if (error) {
                    toast.error(error)
                }
            })
        }
    }

    const prevStep = () => {
        if (signupStep > 1) {
            prevSignupStep()
        }
    }

    const goToStep = (stepNumber: number) => {
        if (stepNumber <= signupStep || completedSteps.has(stepNumber - 1)) {
            setSignupStep(stepNumber)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (signupStep === STEPS.length) {
            //final submission
            if (validateCurrentStep()) {
                try {
                    const cleanedData = {
                        firstName: signupForm.firstName,
                        lastName: signupForm.lastName,
                        middleName: signupForm.middleName,
                        emailOrContactNumber: signupForm.emailOrContactNumber,
                        password: signupForm.password,
                        birthdate: signupForm.birthdate,
                        sex: signupForm.sex,
                        address: signupForm.address,
                        religion: signupForm.religion
                    }

                    await register(cleanedData)
                    
                    setTimeout(() => {
                        navigate('/login')
                    }, 2000)
                } catch (error) {
                    console.log(error);
                }
            }
        } else {
            nextStep()
        }
    }

    const handleClearSavedData = () => {
        clearSavedFormData()
        toast.info('Form data cleared')
    }

    const renderStepContent = () => {
        switch (signupStep) {
            case 1:
                return (
                    <>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='firstName'
                                    placeholder='First Name' 
                                    className={`${styles.formInput} ${validationErrors.firstName ? styles.inputError : ''}`}
                                    value={signupForm.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='lastName'
                                    placeholder='Last Name' 
                                    className={`${styles.formInput} ${validationErrors.lastName ? styles.inputError : ''}`}
                                    value={signupForm.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='middleName'
                                    placeholder='Middle Name (Optional)' 
                                    className={`${styles.formInput} ${validationErrors.middleName ? styles.inputError : ''}`}
                                    value={signupForm.middleName}
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
                                    value={signupForm.emailOrContactNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                )

            case 2:
                return (
                    <>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name='password'
                                    placeholder='Password' 
                                    className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
                                    value={signupForm.password}
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
                                    value={signupForm.confirmPassword}
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
                    </>
                )

            case 3:
                return (
                    <>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
                                <input 
                                    type={signupForm.birthdate ? 'date' : 'text'}
                                    name='birthdate'
                                    placeholder={signupForm.birthdate ? undefined : 'Select your birthdate'} 
                                    className={`${styles.formInput} ${validationErrors.birthdate ? styles.inputError : ''}`}
                                    value={signupForm.birthdate}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.type = 'date'}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faVenusMars} className={styles.inputIcon} />
                                <select
                                    name='sex'
                                    title='Select Gender'
                                    className={`${styles.formInput} ${validationErrors.sex ? styles.inputError : ''}`}
                                    value={signupForm.sex}
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
                                    value={signupForm.address}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faChurch} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='religion'
                                    placeholder='Religion (Optional)' 
                                    className={styles.formInput}
                                    value={signupForm.religion || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                )

            case 4:
                return (
                    <div className={styles.reviewStep}>
                        <h3 className={styles.reviewTitle}>Review Your Information</h3>
                        
                        <div className={styles.reviewSection}>
                            <h4>Basic Information</h4>
                            <p><strong>First Name:</strong> {signupForm.firstName}</p>
                            <p><strong>Last Name:</strong> {signupForm.lastName}</p>
                            <p><strong>Middle Name:</strong> {signupForm.middleName || 'N/A'}</p>
                            <p><strong>Email/Contact:</strong> {signupForm.emailOrContactNumber}</p>
                        </div>

                        <div className={styles.reviewSection}>
                            <h4>Personal Details</h4>
                            <p><strong>Birthdate:</strong> {signupForm.birthdate}</p>
                            <p><strong>Gender:</strong> {signupForm.sex}</p>
                            <p><strong>Address:</strong> {signupForm.address}</p>
                            <p><strong>Religion:</strong> {signupForm.religion || 'N/A'}</p>
                        </div>

                        <div className={styles.formOptions}>
                            <div className={`${styles.rememberMe} ${validationErrors.agreeToTerms ? styles.checkboxError : ''}`}>
                                <input 
                                    type='checkbox' 
                                    id='agreeToTerms'
                                    name='agreeToTerms' 
                                    checked={signupForm.agreeToTerms}
                                    onChange={handleChange}
                                />
                                <label htmlFor='agreeToTerms'>
                                    I agree to the <Link to="/terms-and-conditions" className={styles.termsLink}>Terms and Conditions</Link>
                                </label>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <div className={styles.loginFormSection}>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        {/* auto-save indicator */}
                        <div className={styles.autoSaveIndicator}>
                            <small>✓ Form data is automatically saved for 1 hour</small>
                            <button 
                                type="button" 
                                onClick={handleClearSavedData}
                                className={styles.clearDataButton}
                                title="Clear saved form data"
                            >
                                Clear Data
                            </button>
                        </div>

                        {/* step progress indicator */}
                        <div className={styles.stepIndicator}>
                            {
                                STEPS.map((step, index) => (
                                    <div 
                                        key={step.id}
                                        className={`${styles.stepItem} ${
                                            signupStep === step.id ? styles.active : ''
                                        } ${
                                            completedSteps.has(step.id) ? styles.completed : ''
                                        }`}
                                        onClick={() => goToStep(step.id)}
                                    >
                                        <div className={styles.stepNumber}>
                                            {
                                                completedSteps.has(step.id) ? (
                                                    <FontAwesomeIcon icon={faCheck} />
                                                ) : (
                                                    step.id
                                                )
                                            }
                                        </div>
                                        <div className={styles.stepContent}>
                                            <div className={styles.stepTitle}>{step.title}</div>
                                            <div className={styles.stepDescription}>{step.description}</div>
                                        </div>
                                        {index < STEPS.length - 1 && <div className={styles.stepConnector} />}
                                    </div>
                                ))
                            }
                        </div>

                        <h2 className={styles.formTitle}>
                            {STEPS[signupStep - 1]?.title}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {STEPS[signupStep - 1]?.description}
                        </p>
                        
                        {/* step content */}
                        {renderStepContent()}
                        
                        {/* navigation buttons */}
                        <div className={styles.stepNavigation}>
                            {
                                signupStep > 1 && (
                                    <button 
                                        type='button' 
                                        className={styles.prevButton}
                                        onClick={prevStep}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} /> Previous
                                    </button>
                                )
                            }
                            
                            <button 
                                type='submit' 
                                className={styles.nextButton}
                                disabled={isLoading}
                            >
                                {
                                    isLoading ? 'Creating Account...' : 
                                    signupStep === STEPS.length ? 'Create Account' : 
                                    <>
                                        Next <FontAwesomeIcon icon={faArrowRight} />
                                    </>
                                }
                            </button>
                        </div>
                        
                        <p className={styles.signupPrompt}>
                            Already have an account? <Link to='/login' className={styles.signupLink}>Log in</Link>
                        </p>
                    </form>
                </div>
                <div className={styles.backgroundImageSection}>
                    <img src={backgroundImage} alt="Sign Up background" className={styles.backgroundImage} />
                </div>
            </div>
        </section>

        <SectionFeatures />
        <Footer />
    </div>
  )
}

export default SignupPage