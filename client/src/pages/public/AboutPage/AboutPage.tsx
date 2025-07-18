import styles from './AboutPage.module.css'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faHeart, 
    faStethoscope, 
    faUsers, 
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons'
import { FooterComponent } from '../../../components'
import razon from '../../../assets/profiles/razon.jpg'
import secretary from '../../../assets/profiles/secretary.jpg'

const AboutPage = () => {
  return (
    <div className={styles.aboutPageContainer}>

        <main className={styles.aboutContent}>
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1>Your Child's Health Is Our Priority</h1>
                    <p>Providing compassionate and comprehensive pediatric care since 1995</p>
                </div>
            </section>

            <section className={styles.missionSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>Our Mission</h2>
                        <div className={styles.underline}></div>
                    </div>
                    <p>Providing medical care for babies, kids, and teens, dedicated to keeping them healthy and happy.</p>
                </div>
            </section>

            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>Our Core Values</h2>
                        <div className={styles.underline}></div>
                    </div>
                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <FontAwesomeIcon icon={faHeart} />
                            </div>
                            <h3>Compassion</h3>
                            <p>We provide care with kindness, empathy, and respect for all children and their families.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <FontAwesomeIcon icon={faStethoscope} />
                            </div>
                            <h3>Excellence</h3>
                            <p>We are committed to the highest standards of medical care and continuous professional development.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <h3>Family-Centered</h3>
                            <p>We recognize the family as an essential part of every child's care and well-being.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <FontAwesomeIcon icon={faShieldAlt} />
                            </div>
                            <h3>Trust</h3>
                            <p>We build lasting relationships based on honesty, integrity, and transparent communication.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>Meet Our Specialists</h2>
                        <div className={styles.underline}></div>
                    </div>
                    <div className={styles.teamGrid}>
                        <div className={styles.teamMember}>
                            <div className={styles.memberImage}>
                                <img src={razon} alt="" />
                            </div>
                            <h3>Dr. Shenice Roianne D. Razon Magnon</h3>
                            <p className={styles.memberTitle}>DPPS Pediatricia</p>
                            <p>Board Certified with over 20 years of experience in pediatric care.</p>
                        </div>
                        <div className={styles.teamMember}>
                            <div className={styles.memberImage}>
                                <img src={secretary} alt="" />
                            </div>
                            <h3>Ms. Jamaica D. Udarve</h3>
                            <p className={styles.memberTitle}>Secretary</p>
                            <p>Specializing in pediatric behavioral health and development.</p>
                        </div>
                        {/* <div className={styles.teamMember}>
                            <div className={styles.memberImage}></div>
                            <h3>Dr. Sarah Chen</h3>
                            <p className={styles.memberTitle}>Pediatric Nutritionist</p>
                            <p>Expert in childhood nutrition and growth development.</p>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* <section className={styles.testimonialSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>What Parents Say</h2>
                        <div className={styles.underline}></div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <div className={styles.quoteIcon}>
                            <FontAwesomeIcon icon={faQuoteLeft} />
                        </div>
                        <p className={styles.testimonialText}>
                            "Dr. Razon and her team have been caring for my three children for over a decade. Their expertise, patience, and genuine concern for my children's wellbeing is unmatched."
                        </p>
                        <p className={styles.testimonialAuthor}>- Jennifer P., Parent</p>
                    </div>
                </div>
            </section> */}

            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2>Schedule Your Visit Today</h2>
                    <p>We're accepting new patients and would be honored to care for your child.</p>
                    <Link to="/appointments" className={styles.ctaButton}>Book an Appointment</Link>
                </div>
            </section>
        </main>

        <FooterComponent />
    </div>
  )
}

export default AboutPage