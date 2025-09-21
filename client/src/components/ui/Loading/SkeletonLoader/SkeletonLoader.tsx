import React from 'react'
import styles from './SkeletonLoader.module.css'

interface SkeletonLoaderProps {
    message?: string;
    rows?: number;
    type?: 'table' | 'card' | 'text';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
    message = 'Loading content...', 
    rows = 7,
    type = 'table'
}) => {
    if (type === 'table') {
        return (
            <div className={styles.tableSkeletonContainer}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerCell}><div className={styles.skeletonBar}></div></div>
                    <div className={styles.headerCell}><div className={styles.skeletonBar}></div></div>
                    <div className={styles.headerCell}><div className={styles.skeletonBar}></div></div>
                    <div className={styles.headerCell}><div className={styles.skeletonBar}></div></div>
                    <div className={styles.headerCell}><div className={styles.skeletonBar}></div></div>
                </div>
                
                
                {
                    Array.from({ length: rows }, (_, index) => (
                        <div key={index} className={styles.tableRow}>
                            {/* avtar + name */}
                            <div className={styles.nameCell}>
                                <div className={styles.avatar}></div>
                                <div className={styles.nameContent}>
                                    <div className={styles.skeletonBar}></div>
                                    <div className={styles.skeletonBarSmall}></div>
                                </div>
                            </div>
                            
                            {/* date*/}
                            <div className={styles.cell}>
                                <div className={styles.skeletonBar}></div>
                            </div>
                            
                            {/* time */}
                            <div className={styles.cell}>
                                <div className={styles.skeletonBar}></div>
                            </div>
                            
                            {/* status */}
                            <div className={styles.cell}>
                                <div className={styles.statusBadge}></div>
                            </div>
                            
                            {/* actions */}
                            <div className={styles.actionsCell}>
                                <div className={styles.actionButton}></div>
                                <div className={styles.actionButton}></div>
                                <div className={styles.actionButton}></div>
                            </div>
                        </div>
                    ))
                }
                
                {message && <p className={styles.loadingMessage}>{message}</p>}
            </div>
        )
    }

//fallback to original design for other types
  return (
    <div className={styles.loadingContainer}>
        <div className={styles.skeletonLoader}>
            <div className={styles.skeletonBar}></div>
            <div className={styles.skeletonBar}></div>
            <div className={styles.skeletonBar}></div>
        </div>
        <p className={styles.loadingMessage}>{message}</p>
    </div>
  )
}

export default SkeletonLoader