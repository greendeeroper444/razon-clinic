import React from 'react'
import styles from './Main.module.css'
import { MainProps } from '../../../types';

const Main: React.FC<MainProps> = ({
    children,
    className = '',
    loading = false,
    error = null,
    loadingMessage = 'Loading...',
    loadingType = 'spinner', // 'spinner', 'dots', 'skeleton', 'progress'
    onErrorRetry
}) => {
    
    //loading Component Options
    const renderLoadingSpinner = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingMessage}>{loadingMessage}</p>
        </div>
    );

    const renderDotsLoader = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.dotsSpinner}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p className={styles.loadingMessageTyping}>{loadingMessage}</p>
        </div>
    );

    const renderSkeletonLoader = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.skeletonLoader}>
                <div className={styles.skeletonBar}></div>
                <div className={styles.skeletonBar}></div>
                <div className={styles.skeletonBar}></div>
            </div>
            <p className={styles.loadingMessage}>{loadingMessage}</p>
        </div>
    );

    const renderProgressLoader = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingMessage}>{loadingMessage}</p>
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}></div>
            </div>
        </div>
    );

    //enhanced backdrop loading (overlay style)
    const renderBackdropLoader = () => (
        <div className={styles.loadingBackdrop}>
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingMessage}>{loadingMessage}</p>
            </div>
        </div>
    );

    if (loading) {
        const loadingComponents: any = {
            spinner: renderLoadingSpinner,
            dots: renderDotsLoader,
            skeleton: renderSkeletonLoader,
            progress: renderProgressLoader,
            backdrop: renderBackdropLoader
        };

        return (
            <div className={`${styles.content} ${className}`}>
                {
                    loadingType === 'backdrop' ? (
                        <>
                            {children}
                            {renderBackdropLoader()}
                        </>
                    ) : (
                        loadingComponents[loadingType]?.() || renderLoadingSpinner()
                    )
                }
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

//alternative: separaet loading components for better modularity
export const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingMessage}>{message}</p>
    </div>
);

export const LoadingDots = ({ message = 'Loading...' }) => (
    <div className={styles.loadingContainer}>
        <div className={styles.dotsSpinner}>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <p className={styles.loadingMessageTyping}>{message}</p>
    </div>
);

export const LoadingSkeleton = ({ message = 'Loading content...' }) => (
    <div className={styles.loadingContainer}>
        <div className={styles.skeletonLoader}>
            <div className={styles.skeletonBar}></div>
            <div className={styles.skeletonBar}></div>
            <div className={styles.skeletonBar}></div>
        </div>
        <p className={styles.loadingMessage}>{message}</p>
    </div>
);

export const LoadingProgress = ({ message = 'Processing...' }) => (
    <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingMessage}>{message}</p>
        <div className={styles.progressContainer}>
            <div className={styles.progressBar}></div>
        </div>
    </div>
);