import { FormEvent, useEffect, useState } from 'react'
import styles from './SignupPage.module.css'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SectionFeatures, Footer, Input, Select, TextArea, TermsAndCondition } from '../../../components'
import { useAuthenticationStore } from '../../../stores'
import backgroundImage from '../../../assets/backgrounds/background2.png'

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Your personal details' },
    { id: 2, title: 'Account Security', description: 'Password and verification' },
    { id: 3, title: 'Personal Details', description: 'Additional information' },
    { id: 4, title: 'Review', description: 'Carefully review and confirm your information before proceeding.' }
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
    } = useAuthenticationStore();
    const [showTermsModal, setShowTermsModal] = useState(false);

    useEffect(() => {
        initializeAuth()
        loadFormData()
    }, [initializeAuth, loadFormData])

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
                    stepErrors.emailOrContactNumber = 'Contact number is required'
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
                if (signupForm.religion === 'Others' && !signupForm.religionOther?.trim()) {
                    stepErrors.religionOther = 'Please specify your religion'
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
                        religion: signupForm.religion === 'Others' ? signupForm.religionOther : signupForm.religion
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
                        <Input
                            type='text'
                            name='firstName'
                            placeholder='First Name'
                            leftIcon='user'
                            value={signupForm.firstName}
                            onChange={handleChange}
                            error={validationErrors.firstName}
                        />

                        <Input
                            type='text'
                            name='lastName'
                            placeholder='Last Name'
                            leftIcon='user'
                            value={signupForm.lastName}
                            onChange={handleChange}
                            error={validationErrors.lastName}
                        />

                        <Input
                            type='text'
                            name='middleName'
                            placeholder='Middle Name (Optional)'
                            leftIcon='user'
                            value={signupForm.middleName}
                            onChange={handleChange}
                            error={validationErrors.middleName}
                        />

                        <Input
                            type='number'
                            name='emailOrContactNumber'
                            placeholder='Contact Number'
                            leftIcon='phone'
                            value={signupForm.emailOrContactNumber}
                            onChange={handleChange}
                            error={validationErrors.emailOrContactNumber}
                        />
                    </>
                )

            case 2:
                return (
                    <>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Password'
                            leftIcon='lock'
                            rightIcon={showPassword ? 'eye-slash' : 'eye'}
                            onRightIconClick={togglePasswordVisibility}
                            value={signupForm.password}
                            onChange={handleChange}
                            error={validationErrors.password}
                        />
                        
                        <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name='confirmPassword'
                            placeholder='confirmPassword'
                            leftIcon='lock'
                            rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
                            onRightIconClick={toggleConfirmPasswordVisibility}
                            value={signupForm.confirmPassword}
                            onChange={handleChange}
                            error={validationErrors.confirmPassword}
                        />
                    </>
                )

            case 3:
                return (
                    <>
                        <Input
                            type={signupForm.birthdate ? 'date' : 'text'}
                            name='birthdate'
                            placeholder={signupForm.birthdate ? undefined : 'Select your birthdate'}
                            leftIcon='calendar'
                            value={signupForm.birthdate}
                            onChange={handleChange}
                            onFocus={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.type = 'date';
                            }}
                            error={validationErrors.birthdate}
                        />

                        <Select
                            name='sex'
                            title='Select Gender'
                            leftIcon='users'
                            placeholder='Select Gender'
                            value={signupForm.sex}
                            onChange={handleChange}
                            error={validationErrors.sex}
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />

                        <TextArea
                            name='address'
                            placeholder='Full Address'
                            leftIcon='map-pin'
                            value={signupForm.address}
                            onChange={handleChange}
                            error={validationErrors.address}
                            rows={3}
                            resize='vertical'
                        />

                        <Select
                            name='religion'
                            leftIcon='users'
                            placeholder='Select Religion'
                            value={signupForm.religion === 'Others' ? 'Others' : signupForm.religion}
                            onChange={handleChange}
                            options={[
                                { value: 'Roman Catholic', label: 'Roman Catholic' },
                                { value: 'Islam', label: 'Islam' },
                                { value: 'Iglesia ni Cristo', label: 'Iglesia ni Cristo' },
                                { value: 'Evangelical / Born Again', label: 'Evangelical / Born Again' },
                                { value: 'Seventh-day Adventist', label: 'Seventh-day Adventist' },
                                { value: 'Protestant', label: 'Protestant' },
                                { value: 'Baptist', label: 'Baptist' },
                                { value: 'Buddhism', label: 'Buddhism' },
                                { value: 'Non-religious', label: 'Non-religious' },
                                { value: 'Others', label: 'Others (Please specify)' },
                            ]}
                        />

                        {
                            signupForm.religion === 'Others' && (
                                <Input
                                    type='text'
                                    name='religionOther'
                                    placeholder='Please specify your religion'
                                    leftIcon='church'
                                    value={signupForm.religionOther || ''}
                                    onChange={handleChange}
                                    error={validationErrors.religionOther}
                                />
                            )
                        }

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
                            <p><strong>Contact Number:</strong> {signupForm.emailOrContactNumber}</p>
                        </div>

                        <div className={styles.reviewSection}>
                            <h4>Personal Details</h4>
                            <p><strong>Birthdate:</strong> {signupForm.birthdate}</p>
                            <p><strong>Gender:</strong> {signupForm.sex}</p>
                            <p><strong>Address:</strong> {signupForm.address}</p>
                            <p><strong>Religion:</strong> {signupForm.religion === 'Others' ? (signupForm.religionOther || 'Others') : (signupForm.religion || 'N/A')}</p>
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
                                    I agree to the{' '}
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowTermsModal(true);
                                        }}
                                        className={styles.termsLink}
                                    >
                                        Terms and Conditions
                                    </button>
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
                                type='button' 
                                onClick={handleClearSavedData}
                                className={styles.clearDataButton}
                                title='Clear saved form data'
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
                                                    <Check className='w-4 h-4 mr-1' />
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
                                        <ArrowLeft className='w-4 h-4 mr-1' /> Previous
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
                                        Next <ArrowRight className='w-4 h-4 ml-1' />
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
                    <img src={backgroundImage} alt='Sign Up background' className={styles.backgroundImage} />
                </div>
            </div>
        </section>

        <TermsAndCondition
            isOpen={showTermsModal} 
            onClose={() => setShowTermsModal(false)} 
        />

        <SectionFeatures />
        <Footer />
    </div>
  )
}

export default SignupPage