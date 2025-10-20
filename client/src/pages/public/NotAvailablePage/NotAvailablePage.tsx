import React, { useEffect, useState } from 'react'
import { Lock, Clock, ShieldAlert, Home, ArrowLeft } from 'lucide-react'
import styles from './NotAvailablePage.module.css'

const NotAvailablePage: React.FC = () => {
    const [timeExpired, setTimeExpired] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');

    useEffect(() => {
        const deadlineTimestamp = localStorage.getItem('app_deadline_timestamp');
        if (deadlineTimestamp) {
        const deadlineDate = new Date(parseInt(deadlineTimestamp, 10));
        setTimeExpired(deadlineDate.toLocaleTimeString());
        setDeadline(deadlineDate.toLocaleDateString());
        }
    }, []);

    const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        return false;
    };

    const handleGoBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        return false;
    };

  return (
    <div className={styles.notAvailableContainer}>
        <div className={styles.contentWrapper}>
            <div className={styles.iconWrapper}>
                <Lock className={styles.warningIcon} size={80} strokeWidth={2.5} />
            </div>
            
            <div className={styles.statusCode}>403</div>
            
            <h1 className={styles.title}>Access Expired</h1>
            
            <p className={styles.description}>
                The 5-minute access period has ended and this application is now permanently locked. 
                All features and routes have been disabled for security purposes.
            </p>

            {
                (timeExpired || deadline) && (
                    <div className={styles.timeInfo}>
                        <div className={styles.timeBox}>
                            <Clock size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                            <span className={styles.timeLabel}>Access Ended:</span>
                            <span className={styles.timeValue}>
                                {deadline && <span>{deadline}</span>}
                                {timeExpired && <span> at {timeExpired}</span>}
                            </span>
                        </div>
                    </div>
                )
            }

            <div className={styles.infoBox}>
                <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} size={24} />
                    <span className={styles.infoText}>Time Limit Reached</span>
                </div>
                <div className={styles.infoItem}>
                    <ShieldAlert className={styles.infoIcon} size={24} />
                    <span className={styles.infoText}>Access Restricted</span>
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <a 
                    href="/" 
                    className={`${styles.homeButton} ${styles.disabled}`}
                    onClick={handleGoHome}
                >
                    <Home size={20} />
                    Go to Home
                </a>
                <button 
                    type='button'
                    onClick={handleGoBack} 
                    className={`${styles.backButton} ${styles.disabled}`}
                    disabled
                >
                    <ArrowLeft size={20} />
                    Go Back
                </button>
            </div>

            <div className={styles.helpText}>
                <p>Need assistance? Please contact support for more information.</p>
                <p className={styles.contactInfo}>
                    Contact your developer
                </p>
            </div>
        </div>
    </div>
  )
}

export default NotAvailablePage