import React, { useState, InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import styles from './Input.module.css'
import { User, EyeOff, Eye, Lock, Mail, Calendar, Church, Phone, Home, DollarSign } from 'lucide-react'

type IconType = 'user' | 'email' | 'lock' | 'eye' | 'eye-slash' | 'calendar' | 'church' | 'phone' | 'home' | 'dollar'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus' | 'className'> {
    label?: string | ReactNode;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    leftIcon?: IconType;
    rightIcon?: IconType;
    onRightIconClick?: () => void;
    className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
    label, 
    error, 
    onChange, 
    onFocus,
    leftIcon, 
    rightIcon, 
    onRightIconClick,
    className,
    value,
    ...props 
}, ref) => {
    const [focused, setFocused] = useState<boolean>(false)

    const shouldShowError = !!error

    const inputClasses = [
        styles.input,
        focused && styles.focused,
        shouldShowError && styles.error,
        leftIcon && styles.inputWithLeftIcon,
        rightIcon && styles.inputWithRightIcon,
        className
    ].filter(Boolean).join(' ')

    const getIcon = (icon: IconType): React.JSX.Element | null => {
        switch (icon) {
            case 'user': 
                return <User className={styles.icon} />
            case 'email': 
                return <Mail className={styles.icon} />
            case 'phone': 
                return <Phone className={styles.icon} />
            case 'lock': 
                return <Lock className={styles.icon} />
            case 'eye': 
                return <Eye className={styles.icon} />
            case 'eye-slash': 
                return <EyeOff className={styles.icon} />
            case 'calendar': 
                return <Calendar className={styles.icon} />
            case 'church': 
                return <Church className={styles.icon} />
            case 'home': 
                return <Home className={styles.icon} />
            case 'dollar': 
                return <DollarSign className={styles.icon} />
            default: 
                return null
        }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true)
        if (onFocus) {
            onFocus(e)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e)
        }
    }

    const handleRightIconClick = () => {
        if (onRightIconClick) {
            onRightIconClick()
        }
    }

  return (
    <div className={styles.container}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
            {
                leftIcon && (
                    <div className={styles.iconContainer}>
                        {getIcon(leftIcon)}
                    </div>
                )
            }

            <input 
                ref={ref}
                className={inputClasses}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={() => setFocused(false)}
                value={value}
                {...props}
            />

            {
                rightIcon && (
                    <button
                        type="button"
                        className={`${styles.iconContainer} ${styles.clickable}`} 
                        onClick={handleRightIconClick}
                        tabIndex={-1}
                    >
                        {getIcon(rightIcon)}
                    </button>
                )
            }
        </div>
        {shouldShowError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input