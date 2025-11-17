import { FormEvent, useState, useEffect, useRef } from 'react'
import styles from './ResetPasswordPage.module.css'
import { CalendarCheck, UserRound, Shield, Lock } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components'
import { useOTPStore } from '../../../stores'

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contactNumber = searchParams.get('contact') || '';
    const otp = searchParams.get('otp') || '';
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const hasRedirected = useRef(false);

    const { 
        loading, 
        error, 
        success,
        resetPassword,
        clearError,
        reset
    } = useOTPStore();

    useEffect(() => {
        if (!contactNumber || !otp) {
            navigate('/forgot-password', { replace: true });
            return;
        }
        
        hasRedirected.current = false;
        clearError();
        reset();
    }, []);

    useEffect(() => {
        if (success && !hasRedirected.current) {
            hasRedirected.current = true;
            
            const redirectTimer = setTimeout(() => {
                reset();
                navigate('/login', { replace: true });
            }, 2000);
            
            return () => clearTimeout(redirectTimer);
        }
    }, [success, navigate, reset]);

    const validatePassword = (password: string) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        return '';
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        setPasswordError(validatePassword(value));
        if (error) clearError();
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (error) clearError();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        const validationError = validatePassword(newPassword);
        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        try {
            await resetPassword(contactNumber, otp, newPassword, confirmPassword);
        } catch (error) {
            console.error('Failed to reset password:', error);
        }
    };

    if (!contactNumber || !otp) {
        return null;
    }

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Reset Password</h2>
                    <p className={styles.formSubtitle}>
                        Enter your new password for<br />
                        <strong>{contactNumber}</strong>
                    </p>
                    
                    {
                        error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )
                    }

                    {
                        success && (
                            <div className={styles.successMessage}>
                                Password reset successfully! Redirecting to login...
                            </div>
                        )
                    }

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input 
                                type='password' 
                                placeholder='New Password' 
                                className={styles.formInput}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                minLength={6}
                                required
                                disabled={loading || success}
                                autoComplete="new-password"
                            />
                        </div>
                        {
                            passwordError && (
                                <small className={styles.inputError}>
                                    {passwordError}
                                </small>
                            )
                        }
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input 
                                type='password' 
                                placeholder='Confirm Password' 
                                className={styles.formInput}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                minLength={6}
                                required
                                disabled={loading || success}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className={styles.passwordRequirements}>
                        <p>Password must:</p>
                        <ul>
                            <li className={newPassword.length >= 6 ? styles.valid : ''}>
                                Be at least 6 characters long
                            </li>
                            <li className={newPassword === confirmPassword && confirmPassword !== '' ? styles.valid : ''}>
                                Match the confirmation
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        type='submit' 
                        className={styles.loginButton}
                        disabled={loading || success || newPassword !== confirmPassword || newPassword.length < 6}
                    >
                        {loading ? 'Resetting Password...' : success ? 'Success!' : 'Reset Password'}
                    </button>
                    
                    {
                        !success && (
                            <p className={styles.signupPrompt}>
                                Remember your password? <Link to='/login' className={styles.signupLink}>Login</Link>
                            </p>
                        )
                    }
                </form>
            </div>
        </section>

        <section className={styles.features}>
            <h2>Why Choose MediCare?</h2>
            <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                    <CalendarCheck className={styles.featureIcon} size={32} />
                    <h3>Easy Booking</h3>
                    <p>
                        Set appointments online anytime, anywhere with just a few clicks.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <UserRound className={styles.featureIcon} size={32} />
                    <h3>Professional Doctors</h3>
                    <p>Meet our experienced and licensed medical practitioners.</p>
                </div>
                <div className={styles.featureCard}>
                    <Shield className={styles.featureIcon} size={32} />
                    <h3>Safe & Secure</h3>
                    <p>Your medical data is protected with strict confidentiality.</p>
                </div>
            </div>
        </section>

        <Footer />
    </div>
  )
}

export default ResetPasswordPage