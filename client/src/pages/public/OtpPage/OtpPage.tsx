import { FormEvent, useState, useEffect } from 'react'
import styles from './OtpPage.module.css'
import { CalendarCheck, UserRound, Shield, KeyRound } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components'
import { useOTPStore } from '../../../stores'

const OtpPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contactNumber = searchParams.get('contact') || '';
    
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const { 
        loading, 
        error, 
        message,
        verifyOTP,
        resendOTP,
        clearError,
        setContactNumber
    } = useOTPStore();

    useEffect(() => {
        if (!contactNumber) {
            navigate('/forgot-password');
            return;
        }

        setContactNumber(contactNumber);

        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(countdown);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [contactNumber, navigate, setContactNumber]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        try {
            const isVerified = await verifyOTP(contactNumber, otp);
            
            if (isVerified) {
                navigate(`/reset-password?contact=${encodeURIComponent(contactNumber)}&otp=${otp}`);
            }
        } catch (error) {
            console.error('Failed to verify OTP:', error);
        }
    };

    const handleResendOTP = async () => {
        clearError();

        try {
            await resendOTP(contactNumber);
            setTimer(60);
            setCanResend(false);
            
            const countdown = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(countdown);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Failed to resend OTP:', error);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
        if (error) clearError();
    };

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Verify OTP</h2>
                    <p className={styles.formSubtitle}>
                        Enter the 6-digit code sent to<br />
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
                        message && !error && (
                            <div className={styles.successMessage}>
                                {message}
                            </div>
                        )
                    }

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <KeyRound className={styles.inputIcon} size={18} />
                            <input 
                                type='text' 
                                placeholder='Enter 6-digit OTP' 
                                className={styles.formInput}
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength={6}
                                pattern="\d{6}"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={styles.timerSection}>
                        {
                            !canResend ? (
                                <p className={styles.timerText}>
                                    Resend OTP in {timer} seconds
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.resendButton}
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Resend OTP'}
                                </button>
                            )
                        }
                    </div>
                    
                    <button 
                        type='submit' 
                        className={styles.loginButton}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    
                    <p className={styles.signupPrompt}>
                        Wrong number? <Link to='/forgot-password' className={styles.signupLink}>Go back</Link>
                    </p>
                </form>
            </div>
        </section>

        <section className={styles.features}>
            <h2>Why Choose Razon Pediatrinic Clinic?</h2>
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

export default OtpPage