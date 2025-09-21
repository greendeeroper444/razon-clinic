import { useState, InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'
import { User, EyeOff, Eye, Lock, Mail, Calendar, Church } from 'lucide-react'

type IconType = 'user' | 'email' | 'lock' | 'eye' | 'eye-slash' | 'calendar' | 'church'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus'> {
    label?: string | ReactNode;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    leftIcon?: IconType;
    rightIcon?: IconType;
    onRightIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({ 
    label, 
    error, 
    onChange, 
    onFocus,
    leftIcon, 
    rightIcon, 
    onRightIconClick,
    className,
    ...props 
}) => {
    const [focused, setFocused] = useState<boolean>(false)

    const inputClasses = [
        styles.input,
        focused && styles.focused,
        error && styles.error,
        leftIcon && styles.inputWithLeftIcon,
        rightIcon && styles.inputWithRightIcon,
        className
    ].filter(Boolean).join(' ')

    const getIcon = (icon: IconType): JSX.Element | null => {
        switch (icon) {
            case 'user': 
                return <User className={styles.icon} />
            case 'email': 
                return <Mail className={styles.icon} />
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
                className={inputClasses}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={() => setFocused(false)}
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
        {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

export default Input