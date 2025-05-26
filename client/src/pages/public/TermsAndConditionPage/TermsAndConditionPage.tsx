import styles from './TermsAndConditionPage.module.css'

const TermsAndConditionPage = () => {
  return (
    <div className={styles.container}>
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <h1 className={styles.title}>Terms and Conditions</h1>
                <p className={styles.subtitle}>Razon Clinic Digital Health Management System</p>
                <div className={styles.divider}></div>
            </div>
        </div>

        <div className={styles.content}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
                <p className={styles.text}>
                    By accessing and using the Razon Clinic Digital Health Management System, you acknowledge 
                    that you have read, understood, and agree to be bound by these Terms and Conditions. 
                    This agreement is effective as of your first use of our system.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>2. System Services and Features</h2>
                
                <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>2.1 Patient Services</h3>
                    <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>👤</div>
                    <div className={styles.featureContent}>
                        <h4>Appointment Booking System</h4>
                        <ul className={styles.featureList}>
                        <li>Automatic Patient ID generation for new registrations</li>
                        <li>Personal details management and verification</li>
                        <li>Flexible date and time selection</li>
                        <li>Detailed reason for visit documentation</li>
                        <li>Easy appointment rebooking capabilities</li>
                        </ul>
                    </div>
                    </div>
                </div>

                <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>2.2 Medical Record Management</h3>
                    <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🏥</div>
                    <div className={styles.featureContent}>
                        <h4>Comprehensive Health Records</h4>
                        <ul className={styles.featureList}>
                        <li>Complete medical history documentation</li>
                        <li>Growth milestones tracking</li>
                        <li>Vaccination history and scheduling</li>
                        <li>Current symptoms assessment</li>
                        <li>Professional diagnosis recording</li>
                        <li>Detailed treatment plan development</li>
                        <li>Prescription medication management</li>
                        <li>Consultation notes and follow-up scheduling</li>
                        </ul>
                    </div>
                    </div>
                </div>

                <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>2.3 Inventory Management</h3>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📦</div>
                        <div className={styles.featureContent}>
                            <h4>Medical Supplies Tracking</h4>
                            <ul className={styles.featureList}>
                                <li>Comprehensive item cataloging by name and category</li>
                                <li>Real-time stock quantity monitoring</li>
                                <li>Usage tracking for vaccines and medical supplies</li>
                                <li>Automated low stock notifications</li>
                                <li>Expiration date monitoring and alerts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>3. User Responsibilities and Access</h2>
                
                <div className={styles.accessCard}>
                    <h3 className={styles.accessTitle}>Patient Access</h3>
                    <p className={styles.accessText}>
                        Patients are granted access to appointment booking, personal health record viewing, 
                        and communication features. You are responsible for maintaining accurate personal 
                        information and attending scheduled appointments.
                    </p>
                </div>

                <div className={styles.accessCard}>
                    <h3 className={styles.accessTitle}>Medical Staff Access</h3>
                    <p className={styles.accessText}>
                        Licensed medical professionals have full access to patient records, diagnosis tools, 
                        treatment planning, and prescription management. All medical decisions must comply 
                        with professional standards and regulations.
                    </p>
                </div>

                <div className={styles.accessCard}>
                    <h3 className={styles.accessTitle}>Administrative Staff Access</h3>
                    <p className={styles.accessText}>
                        Administrative personnel can manage appointments, inventory, billing processes, 
                        and system notifications. Staff must maintain confidentiality and data security 
                        at all times.
                    </p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Automated System Features</h2>
                
                <div className={styles.automationGrid}>
                    <div className={styles.automationCard}>
                        <div className={styles.automationIcon}>🔔</div>
                        <h4>Smart Notifications</h4>
                        <p>Automatic alerts for appointment scheduling, low inventory, and expired medications</p>
                    </div>
                    
                    <div className={styles.automationCard}>
                        <div className={styles.automationIcon}>📁</div>
                        <h4>Record Archiving</h4>
                        <p>Automatic archival of patient records after 2 years of inactivity</p>
                    </div>
                    
                    <div className={styles.automationCard}>
                        <div className={styles.automationIcon}>💳</div>
                        <h4>Billing Processing</h4>
                        <p>Streamlined payment processing and invoice generation</p>
                    </div>
                    
                    <div className={styles.automationCard}>
                        <div className={styles.automationIcon}>📊</div>
                        <h4>Report Generation</h4>
                        <p>Comprehensive reporting for medical, administrative, and financial analysis</p>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Privacy and Data Protection</h2>
                <div className={styles.privacyCard}>
                    <p className={styles.text}>
                        We are committed to protecting your personal and medical information in accordance 
                        with HIPAA regulations and applicable privacy laws. All data transmission is encrypted, 
                        and access is restricted to authorized personnel only. Patient records are maintained 
                        with the highest level of security and confidentiality.
                    </p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Billing and Payment Terms</h2>
                <p className={styles.text}>
                    Our automated billing system processes payments securely and generates detailed invoices. 
                    Payment is due upon receipt of services unless prior arrangements have been made. 
                    We accept various payment methods and provide transparent pricing for all services.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>7. System Availability and Maintenance</h2>
                <p className={styles.text}>
                    While we strive to maintain 24/7 system availability, scheduled maintenance may 
                    occasionally interrupt service. Users will be notified in advance of any planned 
                    downtime. Emergency medical situations should always be handled through appropriate 
                    emergency services.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Modification of Terms</h2>
                <p className={styles.text}>
                    Razon Clinic reserves the right to modify these terms and conditions at any time. 
                    Users will be notified of significant changes, and continued use of the system 
                    constitutes acceptance of the updated terms.
                </p>
            </div>

            <div className={styles.footer}>
                <div className={styles.footerContent}>
                    <p className={styles.footerText}>
                        For questions regarding these terms and conditions, please contact Razon Clinic 
                        administration.
                    </p>
                    <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default TermsAndConditionPage