import React from 'react';
import styles from './ProgressLoader.module.css';

interface ProgressLoaderProps {
    message?: string;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({ message = 'Processing...' }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingMessage}>{message}</p>
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}></div>
            </div>
        </div>
    );
};

export default ProgressLoader;