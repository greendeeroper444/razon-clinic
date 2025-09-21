import React from 'react';
import styles from './BackdropLoader.module.css';

interface BackdropLoaderProps {
    message?: string;
}

const BackdropLoader: React.FC<BackdropLoaderProps> = ({ message = 'Loading...' }) => {
    return (
        <div className={styles.loadingBackdrop}>
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingMessage}>{message}</p>
            </div>
        </div>
    );
};

export default BackdropLoader;