// import styles from './HomePage.module.css'
// import FooterComponent from '../../../components/FooterComponent/FooterComponent';
// import { useNavigate } from 'react-router-dom';
// import SectionFeaturesComponent from '../../../components/SectionFeaturesComponent/SectionFeaturesComponent';

// const HomePage = () => {
//     const navigate = useNavigate();

//   return (
//     <div>
//         <section className={styles.hero}>
//             <h1>Book Your Appointment Online</h1>
//             <p>Accessible. Reliable. Fast healthcare booking at your fingertips.</p>
//             <button className={styles.btnPrimary} onClick={() => navigate('/login')}>Book Now</button>
//         </section>

//         <SectionFeaturesComponent />

//         <FooterComponent />
//     </div>
//   )
// }

// export default HomePage
import { useState, useEffect, useRef } from 'react'
import styles from './HomePage.module.css'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faHeart, 
    faStethoscope, 
    faUsers, 
    faShieldAlt,
    faBriefcaseMedical,
    faHeartbeat,
    faBrain,
    faAllergies,
    faUserMd,
    faCalendarCheck,
    faSyringe,
    faCommentMedical,
    faPhone, 
    faEnvelope, 
    faLocationDot
} from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { FooterComponent, SectionFeaturesComponent } from '../../../components'
import razon from '../../../assets/profiles/razon.jpg'
import secretary from '../../../assets/profiles/secretary.jpg'

const HomePage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [showSectionIndicator, setShowSectionIndicator] = useState(false);
    
    //refs for each section
    const heroRef = useRef<HTMLElement>(null);
    const featuresRef = useRef<HTMLElement>(null);
    const aboutRef = useRef<HTMLElement>(null);
    const servicesRef = useRef<HTMLElement>(null);
    const contactRef = useRef<HTMLElement>(null);

    //section names mapping
    const sectionNames: { [key: string]: string } = {
        'hero': 'Home Section',
        'features': 'Features Section',
        'about': 'About Section',
        'services': 'Services Section',
        'contact': 'Contact Section'
    };

    const services = [
        {
            id: 1,
            title: "Well-Child Visits",
            description: "Regular check-ups to monitor your child's growth, development, and overall health.",
            icon: faUserMd,
            color: "#3b82f6"
        },
        {
            id: 2,
            title: "Vaccinations",
            description: "Complete immunization services following the recommended pediatric vaccination schedule.",
            icon: faSyringe,
            color: "#10b981"
        },
        {
            id: 3,
            title: "Sick Child Visits",
            description: "Prompt care for illnesses, infections, and other acute health concerns.",
            icon: faBriefcaseMedical,
            color: "#ef4444"
        },
        {
            id: 4,
            title: "Developmental Assessments",
            description: "Evaluations to ensure your child is meeting important developmental milestones.",
            icon: faBrain,
            color: "#8b5cf6"
        },
        {
            id: 5,
            title: "Allergy Testing",
            description: "Identification and management of allergies and asthma conditions.",
            icon: faAllergies,
            color: "#f59e0b"
        },
        {
            id: 6,
            title: "Preventive Care",
            description: "Services focused on maintaining good health and preventing illness.",
            icon: faHeartbeat,
            color: "#3b82f6"
        },
        {
            id: 7,
            title: "Consultations",
            description: "One-on-one discussions about your child's health concerns and treatment options.",
            icon: faCommentMedical,
            color: "#1e293b"
        },
        {
            id: 8,
            title: "Health Screenings",
            description: "Early detection screenings for various pediatric health conditions.",
            icon: faStethoscope,
            color: "#6b7280"
        }
    ];

    //intersection Observer for scroll-based animations and section highlighting
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.1
        };

        const visibilityOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        //observer for active section highlighting
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id') || '';
                    setActiveSection(sectionId);
                }
            });
        }, observerOptions);

        //observer for fade-in animations
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const sectionId = entry.target.getAttribute('id') || '';
                if (entry.isIntersecting) {
                    setVisibleSections(prev => new Set([...prev, sectionId]));
                }
            });
        }, visibilityOptions);

        //observe all sections
        const sections = [heroRef, featuresRef, aboutRef, servicesRef, contactRef];
        sections.forEach(ref => {
            if (ref.current) {
                sectionObserver.observe(ref.current);
                visibilityObserver.observe(ref.current);
            }
        });

        return () => {
            sections.forEach(ref => {
                if (ref.current) {
                    sectionObserver.unobserve(ref.current);
                    visibilityObserver.unobserve(ref.current);
                }
            });
        };
    }, []);

    //handle scroll to show/hide section indicator
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            setShowSectionIndicator(true);
            
            //clear existing timeout
            clearTimeout(timeoutId);
            
            //hide indicator after 2 seconds of no scrolling
            timeoutId = setTimeout(() => {
                setShowSectionIndicator(false);
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

  return (
    <div className={styles.homePage}>
        {/* section indicator */}
        <div className={`${styles.sectionIndicator} ${showSectionIndicator ? styles.visible : ''}`}>
            <div className={styles.indicatorContent}>
                <div className={styles.indicatorDot}></div>
                <span className={styles.indicatorText}>
                    {sectionNames[activeSection] || 'Section'}
                </span>
            </div>
        </div>

        {/* navigation indicators */}
        <div className={styles.navigationDots}>
            <div 
                className={`${styles.navDot} ${activeSection === 'hero' ? styles.active : ''}`}
                onClick={() => scrollToSection('hero')}
                title="Home"
            />
            <div 
                className={`${styles.navDot} ${activeSection === 'features' ? styles.active : ''}`}
                onClick={() => scrollToSection('features')}
                title="Features"
            />
            <div 
                className={`${styles.navDot} ${activeSection === 'about' ? styles.active : ''}`}
                onClick={() => scrollToSection('about')}
                title="About"
            />
            <div 
                className={`${styles.navDot} ${activeSection === 'services' ? styles.active : ''}`}
                onClick={() => scrollToSection('services')}
                title="Services"
            />
            <div 
                className={`${styles.navDot} ${activeSection === 'contact' ? styles.active : ''}`}
                onClick={() => scrollToSection('contact')}
                title="Contact"
            />
        </div>

        {/* hero section */}
        <section 
            id="hero" 
            ref={heroRef}
            className={`${styles.hero} ${styles.fadeInSection} ${visibleSections.has('hero') ? styles.visible : ''}`}
        >
            <div className={styles.heroContent}>
                <h1 className={styles.slideInUp}>Book Your Appointment Online</h1>
                <p className={`${styles.slideInUp} ${styles.delay1}`}>Accessible. Reliable. Fast healthcare booking at your fingertips.</p>
                <button 
                    className={`${styles.btnPrimary} ${styles.slideInUp} ${styles.delay2}`} 
                    onClick={() => navigate('/login')}
                >
                    Book Now
                </button>
            </div>
        </section>

        {/* features section */}
        <section 
            id="features" 
            ref={featuresRef}
            className={`${styles.featuresSection} ${styles.fadeInSection} ${visibleSections.has('features') ? styles.visible : ''}`}
        >
            <div className={styles.slideInUp}>
                <SectionFeaturesComponent />
            </div>
        </section>

        {/* about section */}
        <section 
            id="about" 
            ref={aboutRef}
            className={`${styles.aboutSection} ${styles.fadeInSection} ${visibleSections.has('about') ? styles.visible : ''}`}
        >
            <div className={styles.aboutHero}>
                <div className={styles.aboutOverlay}></div>
                <div className={`${styles.aboutContent} ${styles.slideInUp}`}>
                    <h2>Your Child's Health Is Our Priority</h2>
                    <p className={styles.delay1}>Providing compassionate and comprehensive pediatric care since 1995</p>
                </div>
            </div>

            <div className={styles.missionSection}>
                <div className={styles.container}>
                    <div className={`${styles.sectionHeading} ${styles.slideInUp}`}>
                        <h3>Our Mission</h3>
                        <div className={styles.underline}></div>
                    </div>
                    <p className={`${styles.slideInUp} ${styles.delay1}`}>Providing medical care for babies, kids, and teens, dedicated to keeping them healthy and happy.</p>
                </div>
            </div>

            <div className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={`${styles.sectionHeading} ${styles.slideInUp}`}>
                        <h3>Our Core Values</h3>
                        <div className={styles.underline}></div>
                    </div>
                    <div className={styles.valuesGrid}>
                        {
                            [
                                { icon: faHeart, title: "Compassion", description: "We provide care with kindness, empathy, and respect for all children and their families." },
                                { icon: faStethoscope, title: "Excellence", description: "We are committed to the highest standards of medical care and continuous professional development." },
                                { icon: faUsers, title: "Family-Centered", description: "We recognize the family as an essential part of every child's care and well-being." },
                                { icon: faShieldAlt, title: "Trust", description: "We build lasting relationships based on honesty, integrity, and transparent communication." }
                            ].map((value, index) => (
                                <div key={index} className={`${styles.valueCard} ${styles.slideInUp} ${styles[`delay${index + 1}`]}`}>
                                    <div className={styles.valueIcon}>
                                        <FontAwesomeIcon icon={value.icon} />
                                    </div>
                                    <h4>{value.title}</h4>
                                    <p>{value.description}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div className={styles.teamSection}>
                <div className={styles.container}>
                    <div className={`${styles.sectionHeading} ${styles.slideInUp}`}>
                        <h3>Meet Our Specialists</h3>
                        <div className={styles.underline}></div>
                    </div>
                    <div className={styles.teamGrid}>
                        <div className={`${styles.teamMember} ${styles.slideInUp} ${styles.delay1}`}>
                            <div className={styles.memberImage}>
                                <img src={razon} alt="Dr. Shenice Roianne D. Razon Magnon" />
                            </div>
                            <h4>Dr. Shenice Roianne D. Razon Magnon</h4>
                            <p className={styles.memberTitle}>DPPS Pediatrician</p>
                            <p>Board Certified with over 20 years of experience in pediatric care.</p>
                        </div>
                        <div className={`${styles.teamMember} ${styles.slideInUp} ${styles.delay2}`}>
                            <div className={styles.memberImage}>
                                <img src={secretary} alt="Ms. Jamaica D. Udarve" />
                            </div>
                            <h4>Ms. Jamaica D. Udarve</h4>
                            <p className={styles.memberTitle}>Secretary</p>
                            <p>Specializing in pediatric behavioral health and development.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* services section */}
        <section 
            id="services" 
            ref={servicesRef}
            className={`${styles.servicesSection} ${styles.fadeInSection} ${visibleSections.has('services') ? styles.visible : ''}`}
        >
            <div className={styles.servicesHero}>
                <div className={`${styles.servicesHeroContent} ${styles.slideInUp}`}>
                    <h2>Our Services</h2>
                    <p className={styles.delay1}>At Razon Pediatric Clinic, we provide comprehensive healthcare services tailored to your child's needs</p>
                </div>
            </div>

            <div className={styles.servicesContainer}>
                <div className={styles.servicesGrid}>
                    {
                        services.map((service, index) => (
                            <div key={service.id} className={`${styles.serviceCard} ${styles.slideInUp} ${styles[`delay${(index % 4) + 1}`]}`}>
                                <div className={styles.iconContainer} style={{ backgroundColor: service.color }}>
                                    <FontAwesomeIcon icon={service.icon} className={styles.serviceIcon} />
                                </div>
                                <h4>{service.title}</h4>
                                <p>{service.description}</p>
                                <Link to={`/services/${service.id}`} className={styles.learnMore}>
                                    Learn more
                                </Link>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className={`${styles.appointmentSection} ${styles.slideInUp}`}>
                <div className={styles.appointmentContent}>
                    <h3>Schedule an Appointment</h3>
                    <p className={styles.delay1}>Our friendly staff is ready to help you with all your pediatric healthcare needs</p>
                    <div className={`${styles.appointmentButtons} ${styles.delay2}`}>
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
        </section>

        {/* contact section */}
        <section 
            id="contact" 
            ref={contactRef}
            className={`${styles.contactSection} ${styles.fadeInSection} ${visibleSections.has('contact') ? styles.visible : ''}`}
        >
            <div className={styles.contactContent}>
                <div className={`${styles.contactForm} ${styles.slideInLeft}`}>
                    <h3>Get in Touch</h3>
                    <form>
                        <div className={`${styles.inputGroup} ${styles.slideInUp} ${styles.delay1}`}>
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="your@email.com" 
                                required 
                            />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.slideInUp} ${styles.delay2}`}>
                            <label htmlFor="subject">Subject</label>
                            <input 
                                type="text" 
                                id="subject" 
                                placeholder="How can we help you?" 
                                required 
                            />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.slideInUp} ${styles.delay3}`}>
                            <label htmlFor="message">Message</label>
                            <textarea 
                                id="message" 
                                placeholder="Please describe your question or concern" 
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className={`${styles.submitBtn} ${styles.slideInUp} ${styles.delay4}`}>
                            Send Message
                        </button>
                    </form>

                    <div className={`${styles.contactInfo} ${styles.slideInUp} ${styles.delay2}`}>
                        <h4>Contact Information</h4>
                        <div className={`${styles.infoItem} ${styles.slideInUp} ${styles.delay3}`}>
                            <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                            <div className={styles.infoText}>
                                +0939-726-6918
                            </div>
                        </div>
                        <div className={`${styles.infoItem} ${styles.slideInUp} ${styles.delay4}`}>
                            <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                            <div className={styles.infoText}>
                                drnice4kids@gmail.com
                            </div>
                        </div>
                        <div className={`${styles.infoItem} ${styles.slideInUp} ${styles.delay5}`}>
                            <FontAwesomeIcon icon={faLocationDot} className={styles.infoIcon} />
                            <div className={styles.infoText}>
                                4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur
                            </div>
                        </div>
                        
                        <div className={`${styles.socialLinks} ${styles.slideInUp} ${styles.delay6}`}>
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
                
                <div className={`${styles.mapSection} ${styles.slideInRight}`}>
                    <div className={`${styles.clinicDetails} ${styles.slideInUp} ${styles.delay1}`}>
                        <h4>Razon Pediatric Clinic</h4>
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
                    
                    <div className={`${styles.gmapFrame} ${styles.slideInUp} ${styles.delay2}`}>
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
        </section>

        <FooterComponent />
    </div>
  )
}

export default HomePage