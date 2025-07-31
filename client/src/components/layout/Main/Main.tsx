import React from 'react'
import styles from './Main.module.css'
import { MainProps } from '../../../types';

const Main: React.FC<MainProps> = ({
    children,
    className = '',
    loading = false,
    error = null,
    loadingMessage = 'Loading...',
    onErrorRetry
}) => {
    if (loading) {
        return (
            <div className={`${styles.content} ${className}`}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingMessage}>{loadingMessage}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
        <div className={`${styles.content} ${className}`}>
            <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            {
                onErrorRetry && (
                    <button
                        type='button'
                        className={styles.btnPrimary}
                        onClick={onErrorRetry}
                    >
                        Try Again
                    </button>
                )
            }
            </div>
        </div>
        )
    }

  return (
    <div className={`${styles.content} ${className}`}>
       {children}
    </div>
  )
}

export default Main