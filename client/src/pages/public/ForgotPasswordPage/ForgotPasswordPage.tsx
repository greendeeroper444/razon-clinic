import { FormEvent, useState, useEffect } from 'react'
import styles from './ForgotPasswordPage.module.css'
import { CalendarCheck, UserRound, Shield, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../../../components'
import { useOTPStore } from '../../../stores'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [contactNumber, setContactNumber] = useState('');
    
    const { 
        loading, 
        error, 
        success,
        sendPasswordResetOTP,
        clearError,
        reset
    } = useOTPStore();

    useEffect(() => {
        reset();
    }, [reset]);

    useEffect(() => {
        if (success) {
            navigate(`/verify-otp?contact=${encodeURIComponent(contactNumber)}`);
        }
    }, [success, contactNumber, navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        try {
            await sendPasswordResetOTP(contactNumber);
        } catch (error) {
            console.error('Failed to send OTP:', error);
        }
    };

    const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9+]/g, '');
        setContactNumber(value);
        if (error) clearError();
    };

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Forgot Password</h2>
                    <p className={styles.formSubtitle}>Enter your contact number to reset your password</p>
                    
                    {
                        error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )
                    }

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <Phone className={styles.inputIcon} size={18} />
                            <input 
                                type='tel' 
                                placeholder='Contact Number (e.g., 09123456789)' 
                                className={styles.formInput}
                                value={contactNumber}
                                onChange={handleContactNumberChange}
                                pattern="^(09|\+639)\d{9}$"
                                required
                                disabled={loading}
                            />
                        </div>
                        <small className={styles.inputHint}>
                            Format: 09XXXXXXXXX or +639XXXXXXXXX
                        </small>
                    </div>
                    
                    <button 
                        type='submit' 
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                    
                    <p className={styles.signupPrompt}>
                        Remember your password? <Link to='/login' className={styles.signupLink}>Login</Link>
                    </p>
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

export default ForgotPasswordPage