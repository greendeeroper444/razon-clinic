import styles from './Footer.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  return (
    <footer className={styles.footer}>
        <div className={styles.container}>
            <div className={styles.footerGrid}>
                <div className={styles.footerCol}>
                    <h3>Razon Pediatric Clinic</h3>
                    <p>4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur</p>
                </div>
                <div className={styles.footerCol}>
                    <h3>Hours</h3>
                    <p>Monday - Friday: 9:30 AM - 12:00 PM<br/>Saturday: 9:00 AM - 12:00 PM<br/>Sunday: Closed</p>
                </div>
                <div className={styles.footerCol}>
                    <h3>Contact</h3>
                    <p>Phone: 0939-726-6918<br/>FB: https://www.facebook.com/docnicerazon</p>
                </div>
                <div className={styles.footerCol}>
                    <h3>Follow Us</h3>
                    <div className={styles.socialIcons}>
                        <a href="https://www.facebook.com/docnicerazon" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
                        <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
                        <a href="#" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                <p>&copy; {new Date().getFullYear()} Razon Pediatric Clinic. All rights reserved.</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer