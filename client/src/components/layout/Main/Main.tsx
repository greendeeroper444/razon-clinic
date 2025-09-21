import React from 'react'
import styles from './Main.module.css'
import { MainProps } from '../../../types'
import Loading, { LoadingType } from '../../ui/Loading/Loading';

// Extended MainProps interface to include delay options
interface ExtendedMainProps extends MainProps {
    loadingDelay?: number;
    loadingMinDuration?: number;
}

const Main: React.FC<ExtendedMainProps> = ({
    children,
    className = '',
    loading = false,
    error = null,
    loadingMessage = 'Loading...',
    loadingType = 'spinner',
    loadingDelay = 0,
    loadingMinDuration = 0,
    onErrorRetry
}) => {
    
    if (loading) {
        return (
            <div className={`${styles.content} ${className}`}>
                <Loading
                    message={loadingMessage}
                    type={loadingType as LoadingType}
                    show={true}
                    delay={loadingDelay}
                    minDuration={loadingMinDuration}
                >
                    {loadingType === 'backdrop' ? children : null}
                </Loading>
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
        );
    }

  return (
    <div className={`${styles.content} ${className}`}>
        {children}
    </div>
  )
}

export default Main