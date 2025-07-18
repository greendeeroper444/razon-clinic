import React from 'react'
import styles from './NotFoundPage.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faArrowLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'


const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

  return (
    <div className={styles.notFoundContainer}>
        <div className={styles.contentWrapper}>
            <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
            </div>
            
            <div className={styles.errorCode}>404</div>
            
            <h1 className={styles.title}>Page Not Found</h1>
            
            <p className={styles.description}>
                Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            
            <div className={styles.buttonGroup}>
                <Link to="/" className={styles.homeButton}>
                    <FontAwesomeIcon icon={faHome} className={styles.buttonIcon} />
                    Go Home
                </Link>
                
                <button type='submit' onClick={handleGoBack} className={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
                    Go Back
                </button>
            </div>
            
            <div className={styles.helpText}>
                <p>If you think this is an error, please contact support or try again later.</p>
            </div>
        </div>
    </div>
  )
}

export default NotFoundPage