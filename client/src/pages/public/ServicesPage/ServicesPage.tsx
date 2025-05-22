import styles from './ServicesPage.module.css'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStethoscope, 
    faBriefcaseMedical,
    faHeartbeat,
    faBrain,
    faAllergies,
    faUserMd,
    faCalendarCheck,
    faSyringe,
    faCommentMedical
} from '@fortawesome/free-solid-svg-icons';
import FooterComponent from '../../../components/FooterComponent/FooterComponent';

const ServicesPage = () => {
    const services = [
        {
            id: 1,
            title: "Well-Child Visits",
            description: "Regular check-ups to monitor your child's growth, development, and overall health.",
            icon: faUserMd,
            color: "var(--medical)"
        },
        {
            id: 2,
            title: "Vaccinations",
            description: "Complete immunization services following the recommended pediatric vaccination schedule.",
            icon: faSyringe,
            color: "var(--success)"
        },
        {
            id: 3,
            title: "Sick Child Visits",
            description: "Prompt care for illnesses, infections, and other acute health concerns.",
            icon: faBriefcaseMedical,
            color: "var(--danger)"
        },
        {
            id: 4,
            title: "Developmental Assessments",
            description: "Evaluations to ensure your child is meeting important developmental milestones.",
            icon: faBrain,
            color: "var(--appointment)"
        },
        {
            id: 5,
            title: "Allergy Testing",
            description: "Identification and management of allergies and asthma conditions.",
            icon: faAllergies,
            color: "var(--warning)"
        },
        {
            id: 6,
            title: "Preventive Care",
            description: "Services focused on maintaining good health and preventing illness.",
            icon: faHeartbeat,
            color: "var(--primary)"
        },
        {
            id: 7,
            title: "Consultations",
            description: "One-on-one discussions about your child's health concerns and treatment options.",
            icon: faCommentMedical,
            color: "var(--dark)"
        },
        {
            id: 8,
            title: "Health Screenings",
            description: "Early detection screenings for various pediatric health conditions.",
            icon: faStethoscope,
            color: "var(--secondary)"
        }
    ];

  return (
    <div className={styles.servicesContent}>
      
        <div className={styles.heroSection}>
            <div className={styles.heroContent}>
                <h1>Our Services</h1>
                <p>At Razon Pediatric Clinic, we provide comprehensive healthcare services tailored to your child's needs</p>
            </div>
        </div>

        <div className={styles.servicesContainer}>
            <div className={styles.servicesGrid}>
            {
                services.map(service => (
                    <div key={service.id} className={styles.serviceCard}>
                        <div className={styles.iconContainer} style={{ backgroundColor: service.color }}>
                            <FontAwesomeIcon icon={service.icon} className={styles.serviceIcon} />
                        </div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <Link to={`/services/${service.id}`} className={styles.learnMore}>
                            Learn more
                        </Link>
                    </div>
                ))
            }
            </div>
        </div>

        <div className={styles.appointmentSection}>
            <div className={styles.appointmentContent}>
                <h2>Schedule an Appointment</h2>
                <p>Our friendly staff is ready to help you with all your pediatric healthcare needs</p>
                <div className={styles.appointmentButtons}>
                    <Link to="/appointment" className={styles.primaryButton}>
                        <FontAwesomeIcon icon={faCalendarCheck} className={styles.buttonIcon} />
                        Book Online
                    </Link>
                    <div className={styles.phoneButton}>
                        <FontAwesomeIcon icon={faCommentMedical} className={styles.buttonIcon} />
                        Call Us: 0939-726-6918
                    </div>
                </div>
            </div>
        </div>

        <FooterComponent />
    </div>
  )
}

export default ServicesPage