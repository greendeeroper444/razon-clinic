import React from 'react';
import styles from './DotsLoader.module.css';

interface DotsLoaderProps {
    message?: string;
}

const DotsLoader: React.FC<DotsLoaderProps> = ({ message = 'Loading...' }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.dotsSpinner}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p className={styles.loadingMessageTyping}>{message}</p>
        </div>
    );
};

export default DotsLoader;