import React from 'react'
import styles from './SubmitLoading.module.css'
import { SubmitLoadingProps } from '../../../types'

const SubmitLoading: React.FC<SubmitLoadingProps> = ({
    isLoading,
    loadingText = 'Processing...',
    size = 'medium',
    variant = 'overlay',
    className = ''
}) => {
    if (!isLoading) return null

    const spinnerSizeClass = {
        small: styles.spinnerSmall,
        medium: styles.spinnerMedium,
        large: styles.spinnerLarge
    }[size]

    const variantClass = {
        overlay: styles.overlay,
        inline: styles.inline,
        button: styles.button
    }[variant]

  return (
    <div className={`${styles.submitLoading} ${variantClass} ${className}`}>
        {variant === 'overlay' && <div className={styles.backdrop} />}
        <div className={styles.content}>
            <div className={`${styles.spinner} ${spinnerSizeClass}`}>
                <div className={styles.spinnerRing}></div>
                <div className={styles.spinnerGlow}></div>
            </div>
            <span className={styles.loadingText}>{loadingText}</span>
            <div className={styles.dots}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
  )
}

export default SubmitLoading