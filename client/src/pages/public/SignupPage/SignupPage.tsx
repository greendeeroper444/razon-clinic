// import { FormEvent, useState } from 'react'
// import styles from './SignupPage.module.css'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//     faEnvelope,
//     faLock,
//     faEye,
//     faEyeSlash, 
//     faUser,
//     faMapMarkerAlt,
//     faVenusMars,
//     faCalendar,
//     faUserFriends,
//     faChurch
// } from '@fortawesome/free-solid-svg-icons'
// import { Link, useNavigate } from 'react-router-dom'
// import FooterComponent from '../../../components/FooterComponent/FooterComponent'
// import { registerUser } from '../../services/authService'
// import { SignupFormData, ValidationErrors } from '../../../types/auth'
// import { validateSignupForm } from '../../../utils/validators'
// import { toast } from 'sonner'
// import SectionFeatures from '../../../components/SectionFeatures/SectionFeatures'

// const SignupPage = () => {
//     const navigate = useNavigate();
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [showPassword, setShowPassword] = useState<boolean>(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
//     const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
//     const [formData, setFormData] = useState<SignupFormData>({
//         fullName: '',
//         emailOrContactNumber: '',
//         password: '',
//         confirmPassword: '',
//         birthdate: '',
//         sex: '',
//         address: '',
//         motherInfo: {
//             name: '',
//             age: undefined,
//             occupation: ''
//         },
//         fatherInfo: {
//             name: '',
//             age: undefined,
//             occupation: ''
//         },
//         religion: '',
//         agreeToTerms: false
//     });
//     const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value, type } = e.target as HTMLInputElement;
//         const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
//         // Handle nested object updates for parent info
//         if (name.includes('.')) {
//             const [parent, field] = name.split('.');
//             setFormData({
//                 ...formData,
//                 [parent]: {
//                     ...formData[parent as keyof SignupFormData],
//                     [field]: field === 'age' ? (value ? parseInt(value) : undefined) : value
//                 }
//             });
//         } else {
//             setFormData({
//                 ...formData,
//                 [name]: newValue
//             });
//         }
        
//         //clear validation error when field is updated
//         if (validationErrors[name as keyof ValidationErrors]) {
//             setValidationErrors({
//                 ...validationErrors,
//                 [name]: undefined
//             });
//         }
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };
    
//     const toggleConfirmPasswordVisibility = () => {
//         setShowConfirmPassword(!showConfirmPassword);
//     };

//     const toggleOptionalFields = () => {
//         setShowOptionalFields(!showOptionalFields);
//     };

//     const onSubmit = async (formData: SignupFormData) => {
//         setIsLoading(true);
        
//         try {
//             // Clean up optional fields - remove empty values
//             const cleanedData = {
//                 fullName: formData.fullName,
//                 emailOrContactNumber: formData.emailOrContactNumber,
//                 password: formData.password,
//                 birthdate: formData.birthdate,
//                 sex: formData.sex,
//                 address: formData.address,
//                 ...(formData.motherInfo?.name || formData.motherInfo?.age || formData.motherInfo?.occupation ? {
//                     motherInfo: {
//                         ...(formData.motherInfo.name && { name: formData.motherInfo.name }),
//                         ...(formData.motherInfo.age && { age: formData.motherInfo.age }),
//                         ...(formData.motherInfo.occupation && { occupation: formData.motherInfo.occupation })
//                     }
//                 } : {}),
//                 ...(formData.fatherInfo?.name || formData.fatherInfo?.age || formData.fatherInfo?.occupation ? {
//                     fatherInfo: {
//                         ...(formData.fatherInfo.name && { name: formData.fatherInfo.name }),
//                         ...(formData.fatherInfo.age && { age: formData.fatherInfo.age }),
//                         ...(formData.fatherInfo.occupation && { occupation: formData.fatherInfo.occupation })
//                     }
//                 } : {}),
//                 ...(formData.religion && { religion: formData.religion })
//             };

//             const response = await registerUser(cleanedData);

//             toast.success('Registration successful! Redirecting to login...');
            
//             //store the token if needed
//             localStorage.setItem('token', response.data.token);
            
//             //redirect after a small delay
//             setTimeout(() => {
//                 navigate('/login');
//             }, 2000);
            
//         } catch (error) {
//             if (error instanceof Error) {
//                 toast.error(error.message);
//             } else {
//                 toast.error('An error occurred during registration');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
        
//         //validate form
//         const errors = validateSignupForm(formData);
//         setValidationErrors(errors);
        
//         if (Object.keys(errors).length === 0) {
//             await onSubmit(formData);
//         } else {
//             // show validation errors as toasts
//             Object.values(errors).forEach(error => {
//                 if (error) {
//                     toast.error(error);
//                 }
//             });
//         }
//     };

//   return (
//     <div>
//         <section className={styles.hero}>
//             <div className={styles.loginContainer}>
//                 <form className={styles.loginForm} onSubmit={handleSubmit}>
//                     <h2 className={styles.formTitle}>Hello, welcome!</h2>
//                     <p className={styles.formSubtitle}>Create your account</p>
                    
//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
//                             <input 
//                                 type='text' 
//                                 name='fullName'
//                                 placeholder='Full Name' 
//                                 className={`${styles.formInput} ${validationErrors.fullName ? styles.inputError : ''}`}
//                                 value={formData.fullName}
//                                 onChange={handleChange}
//                             />
//                         </div>
//                     </div>

//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
//                             <input 
//                                 type='text' 
//                                 name='emailOrContactNumber'
//                                 placeholder='Email Address / Contact Number' 
//                                 className={`${styles.formInput} ${validationErrors.emailOrContactNumber ? styles.inputError : ''}`}
//                                 value={formData.emailOrContactNumber}
//                                 onChange={handleChange}
//                             />
//                         </div>
//                     </div>
                    
//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
//                             <input 
//                                 type={showPassword ? 'text' : 'password'} 
//                                 name='password'
//                                 placeholder='Password' 
//                                 className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
//                                 value={formData.password}
//                                 onChange={handleChange}
//                             />
//                             <button 
//                                 type='button' 
//                                 className={styles.passwordToggle}
//                                 onClick={togglePasswordVisibility}
//                                 title={showPassword ? 'Hide password' : 'Show password'}
//                             >
//                                 <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
//                             <input 
//                                 type={showConfirmPassword ? 'text' : 'password'} 
//                                 name='confirmPassword'
//                                 placeholder='Confirm Password' 
//                                 className={`${styles.formInput} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
//                                 value={formData.confirmPassword}
//                                 onChange={handleChange}
//                             />
//                             <button 
//                                 type='button' 
//                                 className={styles.passwordToggle}
//                                 onClick={toggleConfirmPasswordVisibility}
//                                 title={showConfirmPassword ? 'Hide password' : 'Show password'}
//                             >
//                                 <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
//                             <input 
//                                 type='date' 
//                                 name='birthdate'
//                                 placeholder='Birthdate' 
//                                 className={`${styles.formInput} ${validationErrors.birthdate ? styles.inputError : ''}`}
//                                 value={formData.birthdate}
//                                 onChange={handleChange}
//                             />
//                         </div>
//                     </div>

//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faVenusMars} className={styles.inputIcon} />
//                             <select
//                                 name='sex'
//                                 id='genderSelect'
//                                 aria-label='Gender'
//                                 className={`${styles.formInput} ${validationErrors.sex ? styles.inputError : ''}`}
//                                 value={formData.sex}
//                                 onChange={handleChange}
//                             >
//                                 <option value=''>Select Gender</option>
//                                 <option value='Male'>Male</option>
//                                 <option value='Female'>Female</option>
//                                 <option value='Other'>Other</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className={styles.inputGroup}>
//                         <div className={styles.inputWithIcon}>
//                             <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
//                             <textarea
//                                 name='address'
//                                 placeholder='Full Address' 
//                                 className={`${styles.formInput} ${styles.textareaInput} ${validationErrors.address ? styles.inputError : ''}`}
//                                 value={formData.address}
//                                 onChange={handleChange}
//                                 rows={3}
//                             />
//                         </div>
//                     </div>

//                     {/* Optional Fields Toggle */}
//                     <div className={styles.optionalToggle}>
//                         <button 
//                             type='button' 
//                             onClick={toggleOptionalFields}
//                             className={styles.toggleButton}
//                         >
//                             {showOptionalFields ? 'Hide' : 'Show'} Optional Information
//                         </button>
//                     </div>

//                     {/* Optional Fields */}
//                     {showOptionalFields && (
//                         <div className={styles.optionalFields}>
//                             <h3 className={styles.sectionTitle}>
//                                 <FontAwesomeIcon icon={faUserFriends} /> Family Information
//                             </h3>
                            
//                             {/* Mother's Information */}
//                             <div className={styles.parentInfo}>
//                                 <h4 className={styles.parentTitle}>Mother's Information</h4>
                                
//                                 <div className={styles.inputGroup}>
//                                     <div className={styles.inputWithIcon}>
//                                         <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
//                                         <input 
//                                             type='text' 
//                                             name='motherInfo.name'
//                                             placeholder="Mother's Name" 
//                                             className={`${styles.formInput} ${validationErrors['motherInfo.name'] ? styles.inputError : ''}`}
//                                             value={formData.motherInfo?.name || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className={styles.inputRow}>
//                                     <div className={styles.inputGroup}>
//                                         <input 
//                                             type='number' 
//                                             name='motherInfo.age'
//                                             placeholder="Age" 
//                                             min="15"
//                                             max="120"
//                                             className={`${styles.formInput} ${validationErrors['motherInfo.age'] ? styles.inputError : ''}`}
//                                             value={formData.motherInfo?.age || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
                                    
//                                     <div className={styles.inputGroup}>
//                                         <input 
//                                             type='text' 
//                                             name='motherInfo.occupation'
//                                             placeholder="Occupation" 
//                                             className={`${styles.formInput} ${validationErrors['motherInfo.occupation'] ? styles.inputError : ''}`}
//                                             value={formData.motherInfo?.occupation || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Father's Information */}
//                             <div className={styles.parentInfo}>
//                                 <h4 className={styles.parentTitle}>Father's Information</h4>
                                
//                                 <div className={styles.inputGroup}>
//                                     <div className={styles.inputWithIcon}>
//                                         <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
//                                         <input 
//                                             type='text' 
//                                             name='fatherInfo.name'
//                                             placeholder="Father's Name" 
//                                             className={`${styles.formInput} ${validationErrors['fatherInfo.name'] ? styles.inputError : ''}`}
//                                             value={formData.fatherInfo?.name || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className={styles.inputRow}>
//                                     <div className={styles.inputGroup}>
//                                         <input 
//                                             type='number' 
//                                             name='fatherInfo.age'
//                                             placeholder="Age" 
//                                             min="15"
//                                             max="120"
//                                             className={`${styles.formInput} ${validationErrors['fatherInfo.age'] ? styles.inputError : ''}`}
//                                             value={formData.fatherInfo?.age || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
                                    
//                                     <div className={styles.inputGroup}>
//                                         <input 
//                                             type='text' 
//                                             name='fatherInfo.occupation'
//                                             placeholder="Occupation" 
//                                             className={`${styles.formInput} ${validationErrors['fatherInfo.occupation'] ? styles.inputError : ''}`}
//                                             value={formData.fatherInfo?.occupation || ''}
//                                             onChange={handleChange}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Religion */}
//                             <div className={styles.inputGroup}>
//                                 <div className={styles.inputWithIcon}>
//                                     <FontAwesomeIcon icon={faChurch} className={styles.inputIcon} />
//                                     <input 
//                                         type='text' 
//                                         name='religion'
//                                         placeholder='Religion (Optional)' 
//                                         className={`${styles.formInput} ${validationErrors.religion ? styles.inputError : ''}`}
//                                         value={formData.religion || ''}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     <div className={styles.formOptions}>
//                         <div className={`${styles.rememberMe} ${validationErrors.agreeToTerms ? styles.checkboxError : ''}`}>
//                             <input 
//                                 type='checkbox' 
//                                 id='agreeToTerms'
//                                 name='agreeToTerms' 
//                                 checked={formData.agreeToTerms}
//                                 onChange={handleChange}
//                             />
//                             <label htmlFor='agreeToTerms'>
//                                 I agree to the <Link to="/terms-and-conditions" className={styles.termsLink}>Terms and Conditions</Link>
//                             </label>
//                         </div>
//                     </div>
                    
//                     <button 
//                         type='submit' 
//                         className={styles.loginButton}
//                         disabled={isLoading}
//                     >
//                         {isLoading ? 'Creating Account...' : 'Sign Up'}
//                     </button>
                    
//                     <div className={styles.formDivider}>
//                         <span>or</span>
//                     </div>
                        
//                     <div className={styles.socialLogin}>
//                         <button 
//                             type='button' 
//                             className={`${styles.socialButton} ${styles.googleButton}`}
//                             onClick={() => toast.info('Google authentication is not available yet')}
//                         >
//                             Continue with Google
//                         </button>
//                     </div>
                    
//                     <p className={styles.signupPrompt}>
//                         Already have an account? <Link to='/login' className={styles.signupLink}>Log in</Link>
//                     </p>
//                 </form>
//             </div>
//         </section>

//        <SectionFeatures />

//         <FooterComponent />
//     </div>
//   )
// }

// export default SignupPage

import { FormEvent, useState, useEffect } from 'react'
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
    faUserFriends,
    faChurch,
    faArrowLeft,
    faArrowRight,
    faCheck
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import FooterComponent from '../../../components/FooterComponent/FooterComponent'
import { registerUser } from '../../services/authService'
import { SignupFormData, ValidationErrors } from '../../../types/auth'
import { toast } from 'sonner'
import SectionFeatures from '../../../components/SectionFeatures/SectionFeatures';
import backgroundImage from '../../../assets/backgrounds/background2.png'

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Your personal details' },
    { id: 2, title: 'Account Security', description: 'Password and verification' },
    { id: 3, title: 'Personal Details', description: 'Additional information' },
    { id: 4, title: 'Review', description: 'Confirm your information' }
];

const STORAGE_KEY = 'signup_form_data';
const STORAGE_TIMESTAMP_KEY = 'signup_form_timestamp';
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

//storage utility functions (replace with localStorage in my)
const storage = {
    set: (key: string, value: any) => {
        try {
            // in my, replace sessionStorage with localStorage
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to storage:', error);
        }
    },
    get: (key: string) => {
        try {
            // in my, replace sessionStorage with localStorage
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Failed to read from storage:', error);
            return null;
        }
    },
    remove: (key: string) => {
        try {
            //in my environment, replace sessionStorage with localStorage
            sessionStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from storage:', error);
        }
    }
};

const SignupPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    
    const [formData, setFormData] = useState<SignupFormData>({
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
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    //load saved data on component mount
    useEffect(() => {
        const savedData = storage.get(STORAGE_KEY);
        const savedTimestamp = storage.get(STORAGE_TIMESTAMP_KEY);
        
        if (savedData && savedTimestamp) {
            const now = new Date().getTime();
            const timeDiff = now - savedTimestamp;
            
            //check if saved data is less than 1 hour old
            if (timeDiff < ONE_HOUR_MS) {
                setFormData(savedData.formData);
                setCurrentStep(savedData.currentStep);
                setCompletedSteps(new Set(savedData.completedSteps));
                toast.success('Form data restored from previous session');
            } else {
                //data is older than 1 hour, remove it
                storage.remove(STORAGE_KEY);
                storage.remove(STORAGE_TIMESTAMP_KEY);
                toast.info('Previous form data expired');
            }
        }
    }, []);

    // Auto-save function
    const saveFormData = () => {
        const dataToSave = {
            formData,
            currentStep,
            completedSteps: Array.from(completedSteps)
        };
        
        storage.set(STORAGE_KEY, dataToSave);
        storage.set(STORAGE_TIMESTAMP_KEY, new Date().getTime());
    };

    //auto-save when form data changes
    useEffect(() => {
        //fon't save if form is completely empty
        const hasData = formData.firstName || 
            formData.lastName ||
            formData.middleName ||
            formData.emailOrContactNumber || 
            formData.password || 
            formData.birthdate || 
            formData.sex || 
            formData.address ||
            formData.religion;
        
        if (hasData) {
            const timeoutId = setTimeout(saveFormData, 500); //debounce saves
            return () => clearTimeout(timeoutId);
        }
    }, [formData, currentStep, completedSteps]);

    //clear saved data when form is successfully submitted
    const clearSavedData = () => {
        storage.remove(STORAGE_KEY);
        storage.remove(STORAGE_TIMESTAMP_KEY);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        if (name.includes('.')) {
            const [parent, field] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent as keyof SignupFormData],
                    [field]: field === 'age' ? (value ? parseInt(value) : undefined) : value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: newValue
            });
        }
        
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors({
                ...validationErrors,
                [name]: undefined
            });
        }
    };

    const validateCurrentStep = (): boolean => {
        let stepErrors: ValidationErrors = {};
        
        switch (currentStep) {
            case 1: //basic info
                if (!formData.firstName.trim()) {
                    stepErrors.firstName = 'Full name is required';
                }
                if (!formData.lastName.trim()) {
                    stepErrors.lastName = 'Full name is required';
                }
                if (!formData.emailOrContactNumber.trim()) {
                    stepErrors.emailOrContactNumber = 'Email or contact number is required';
                }
                break;
                
            case 2: //account security
                if (!formData.password) {
                    stepErrors.password = 'Password is required';
                } else if (formData.password.length < 8) {
                    stepErrors.password = 'Password must be at least 8 characters';
                }
                if (!formData.confirmPassword) {
                    stepErrors.confirmPassword = 'Please confirm your password';
                } else if (formData.password !== formData.confirmPassword) {
                    stepErrors.confirmPassword = 'Passwords do not match';
                }
                break;
                
            case 3: //personal details
                if (!formData.birthdate) {
                    stepErrors.birthdate = 'Birthdate is required';
                }
                if (!formData.sex) {
                    stepErrors.sex = 'Gender selection is required';
                }
                if (!formData.address.trim()) {
                    stepErrors.address = 'Address is required';
                }
                break;
                
            case 4: //review
                if (!formData.agreeToTerms) {
                    stepErrors.agreeToTerms = 'You must agree to the terms and conditions';
                }
                break;
        }
        
        setValidationErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            //show validation errors as toasts
            Object.values(validationErrors).forEach(error => {
                if (error) {
                    toast.error(error);
                }
            });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepNumber: number) => {
        if (stepNumber <= currentStep || completedSteps.has(stepNumber - 1)) {
            setCurrentStep(stepNumber);
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
            const cleanedData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName,
                emailOrContactNumber: formData.emailOrContactNumber,
                password: formData.password,
                birthdate: formData.birthdate,
                sex: formData.sex,
                address: formData.address,
            };

            const response = await registerUser(cleanedData);
            toast.success('Registration successful! Redirecting to login...');
            
            //clear saved form data on successful submission
            clearSavedData();
            
            localStorage.setItem('token', response.data.token);
            
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
        
        if (currentStep === STEPS.length) {
            //final submission
            if (validateCurrentStep()) {
                await onSubmit(formData);
            }
        } else {
            nextStep();
        }
    };

    //manual clear function for user control
    const handleClearSavedData = () => {
        clearSavedData();
        setFormData({
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
        });
        setCurrentStep(1);
        setCompletedSteps(new Set());
        toast.info('Form data cleared');
    };

    const renderStepContent = () => {
        switch (currentStep) {
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
                                    value={formData.firstName}
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
                                    value={formData.lastName}
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
                                    value={formData.middleName}
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
                    </>
                );

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
                    </>
                );

            case 3:
                return (
                    <>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
                                <input 
                                    type={formData.birthdate ? 'date' : 'text'}
                                    name='birthdate'
                                    placeholder={formData.birthdate ? undefined : 'Select your birthdate'} 
                                    className={`${styles.formInput} ${validationErrors.birthdate ? styles.inputError : ''}`}
                                    value={formData.birthdate}
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

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWithIcon}>
                                <FontAwesomeIcon icon={faChurch} className={styles.inputIcon} />
                                <input 
                                    type='text' 
                                    name='religion'
                                    placeholder='Religion (Optional)' 
                                    className={styles.formInput}
                                    value={formData.religion || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                );

            case 4:
                return (
                    <div className={styles.reviewStep}>
                        <h3 className={styles.reviewTitle}>Review Your Information</h3>
                        
                        <div className={styles.reviewSection}>
                            <h4>Basic Information</h4>
                            <p><strong>First Name:</strong> {formData.firstName}</p>
                            <p><strong>Last Name:</strong> {formData.lastName}</p>
                            <p><strong>Middle Name:</strong> {formData.middleName || 'N/A'}</p>
                            <p><strong>Email/Contact:</strong> {formData.emailOrContactNumber}</p>
                        </div>

                        <div className={styles.reviewSection}>
                            <h4>Personal Details</h4>
                            <p><strong>Birthdate:</strong> {formData.birthdate}</p>
                            <p><strong>Gender:</strong> {formData.sex}</p>
                            <p><strong>Address:</strong> {formData.address}</p>
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
                                <label htmlFor='agreeToTerms'>
                                    I agree to the <Link to="/terms-and-conditions" className={styles.termsLink}>Terms and Conditions</Link>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

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

                        {/* step progess indicator*/}
                        <div className={styles.stepIndicator}>
                            {
                                STEPS.map((step, index) => (
                                    <div 
                                        key={step.id}
                                        className={`${styles.stepItem} ${
                                            currentStep === step.id ? styles.active : ''
                                        } ${
                                            completedSteps.has(step.id) ? styles.completed : ''
                                        }`}
                                        onClick={() => goToStep(step.id)}
                                    >
                                        <div className={styles.stepNumber}>
                                            {completedSteps.has(step.id) ? (
                                                <FontAwesomeIcon icon={faCheck} />
                                            ) : (
                                                step.id
                                            )}
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
                            {STEPS[currentStep - 1]?.title}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {STEPS[currentStep - 1]?.description}
                        </p>
                        
                        {/* step content */}
                        {renderStepContent()}
                        
                        {/* navigatoion buttons */}
                        <div className={styles.stepNavigation}>
                            {
                                currentStep > 1 && (
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
                                {isLoading ? 'Creating Account...' : 
                                    currentStep === STEPS.length ? 'Create Account' : 
                                    <>Next <FontAwesomeIcon icon={faArrowRight} /></>}
                            </button>
                        </div>

                        {/* social login (only on first step) */}
                        {/* {
                            currentStep === 1 && (
                                <>
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
                                </>
                            )
                        } */}
                        
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
        <FooterComponent />
    </div>
  )
}

export default SignupPage