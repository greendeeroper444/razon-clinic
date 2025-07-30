import { FormEvent, useState } from 'react'
import styles from './ForgotPasswordPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faCalendarCheck, 
    faUserMd, 
    faShieldAlt,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../../../components'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [emailOrContactNumber, setEmailOrContactNumber] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Login attempt with:', { emailOrContactNumber});
    };

  return (
    <div>

        <section className={styles.hero}>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Forgot Password</h2>
                    <p className={styles.formSubtitle}>Reset your password account</p>
                    
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWithIcon}>
                            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                            <input 
                                type='email' 
                                placeholder='Email Address / Contact Number' 
                                className={styles.formInput}
                                value={emailOrContactNumber}
                                onChange={(e) => setEmailOrContactNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type='submit' className={styles.loginButton} onClick={() => navigate('/login')}>
                        Submit
                    </button>
                    
                    <p className={styles.signupPrompt}>
                        Don't have an account? <Link to='/signup' className={styles.signupLink}>Sign up</Link>
                    </p>
                </form>
            </div>
        </section>

        <section className={styles.features}>
            <h2>Why Choose MediCare?</h2>
            <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                    <FontAwesomeIcon icon={faCalendarCheck} className={styles.featureIcon} />
                    <h3>Easy Booking</h3>
                    <p>
                    Set appointments online anytime, anywhere with just a few clicks.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <FontAwesomeIcon icon={faUserMd} className={styles.featureIcon} />
                    <h3>Professional Doctors</h3>
                    <p>Meet our experienced and licensed medical practitioners.</p>
                </div>
                <div className={styles.featureCard}>
                    <FontAwesomeIcon icon={faShieldAlt} className={styles.featureIcon} />
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