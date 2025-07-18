import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faCalendarCheck, 
    faUserMd, 
    faShieldAlt 
} from '@fortawesome/free-solid-svg-icons'
import styles from './SectionFeaturesComponent.module.css';

const SectionFeaturesComponent: FC = () => {
  return (
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
  )
}

export default SectionFeaturesComponent