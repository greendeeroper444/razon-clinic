import styles from './ContactPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import FooterComponent from '../../../components/FooterComponent/FooterComponent'

const ContactPage = () => {
  return (
    <div>
        <div className={styles.content}>
            <div className={styles.contactForm}>
                <h2>Get in Touch</h2>
                <form>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="your@email.com" 
                            required 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="subject">Subject</label>
                        <input 
                            type="text" 
                            id="subject" 
                            placeholder="How can we help you?" 
                            required 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="message">Message</label>
                        <textarea 
                            id="message" 
                            placeholder="Please describe your question or concern" 
                            required
                        ></textarea>
                    </div>
                    <button className={styles.submitBtn}>
                        Send Message
                    </button>
                </form>

                <div className={styles.contactInfo}>
                    <h3>Contact Information</h3>
                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                        <div className={styles.infoText}>
                            +63 997 455 9639
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                        <div className={styles.infoText}>
                            razonpediatric@gmail.com
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faLocationDot} className={styles.infoIcon} />
                        <div className={styles.infoText}>
                            4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur
                        </div>
                    </div>
                    
                    <div className={styles.socialLinks}>
                        <a href="#" className={styles.socialIcon}>
                            <FontAwesomeIcon icon={faFacebookF} />
                        </a>
                        <a href="#" className={styles.socialIcon}>
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="#" className={styles.socialIcon}>
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>
                    </div>
                </div>
            </div>
            
            <div className={styles.mapSection}>
                <div className={styles.clinicDetails}>
                    <h3>Razon Pediatric Clinic</h3>
                    <div className={styles.businessHours}>
                        <div className={styles.dayHours}>
                            <span className={styles.day}>Monday - Friday</span>
                            <span className={styles.hours}>8:00 AM - 5:00 PM</span>
                        </div>
                        <div className={styles.dayHours}>
                            <span className={styles.day}>Saturday</span>
                            <span className={styles.hours}>9:00 AM - 1:00 PM</span>
                        </div>
                        <div className={styles.dayHours}>
                            <span className={styles.day}>Sunday</span>
                            <span className={styles.hours}>Closed</span>
                        </div>
                    </div>
                </div>
                
                <div className={styles.gmapFrame}>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.196269559092!2d125.61255747397891!3d7.103238016157077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96c50ab1f67d3%3A0x708197baba6d67fe!2sDr.%20RAZON%27s%20PEDIATRIC%20CLINIC!5e0!3m2!1sen!2sph!4v1746454636316!5m2!1sen!2sph" 
                        width="100%" 
                        height="100%" 
                        style={{border: 0}} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Razon Pediatric Clinic Location">
                    </iframe>
                </div>
            </div>
        </div>
        <FooterComponent />
    </div>
  )
}

export default ContactPage