import React from 'react'
import styles from './Button.module.css'
import { ButtonProps } from '../../../types';

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    disabled,
    isLoading = false,
    loadingText = 'Loading...',
    ...props
}) => {
    const getButtonClass = () => {
        switch (variant) {
            case 'primary':
                return styles.btnPrimary;
            case 'secondary':
                return styles.btnSecondary;
            case 'close':
                return styles.btnClose;
            case 'remove':
                return styles.btnRemove;
            case 'add':
                return styles.btnAdd;
            case 'delete':
                return styles.btnDelete;
            default:
                return styles.btnPrimary;
        }
    };

    const buttonClass = `${getButtonClass()} ${className}`.trim();
    const isDisabled = disabled || isLoading;

  return (
    <button
        className={buttonClass}
        disabled={isDisabled}
        {...props}
    >
        {isLoading ? loadingText : children}
    </button>
  )
}

export default Button