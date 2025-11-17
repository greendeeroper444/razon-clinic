import { useState, TextareaHTMLAttributes, forwardRef } from 'react'
import styles from './TextArea.module.css'
import { User, Mail, Lock, Calendar, Users, MapPin, MessageSquare, FileText } from 'lucide-react'

type IconType = 'user' | 'email' | 'lock' | 'calendar' | 'users' | 'map-pin' | 'message' | 'file-text'

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    label?: string
    error?: string
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    leftIcon?: IconType
    resize?: 'none' | 'both' | 'horizontal' | 'vertical'
    showCharCount?: boolean
    charCountClassName?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    error,
    onChange,
    leftIcon,
    resize = 'vertical',
    showCharCount = false,
    charCountClassName,
    className,
    rows = 3,
    value = '',
    maxLength,
    ...props
}, ref) => {
    const [focused, setFocused] = useState<boolean>(false)

    //show error only if there's an error AND no value
    const shouldShowError = error && !value

    const textareaClasses = [
        styles.textarea,
        focused && styles.focused,
        shouldShowError && styles.error,
        leftIcon && styles.textareaWithLeftIcon,
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
            case 'calendar':
                return <Calendar className={styles.icon} />
            case 'users':
                return <Users className={styles.icon} />
            case 'map-pin':
                return <MapPin className={styles.icon} />
            case 'message':
                return <MessageSquare className={styles.icon} />
            case 'file-text':
                return <FileText className={styles.icon} />
            default:
                return null
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e)
        }
    }

  return (
    <div className={styles.container}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.textareaWrapper}>
            {
                leftIcon && (
                    <div className={styles.iconContainer}>
                        {getIcon(leftIcon)}
                    </div>
                )
            }

            <textarea
                ref={ref}
                className={textareaClasses}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={rows}
                style={{ resize }}
                value={value}
                maxLength={maxLength}
                {...props}
            />
        </div>
        {
            showCharCount && maxLength && (
                <div className={charCountClassName || styles.charCount}>
                    {(value as string).length}/{maxLength} characters
                </div>
            )
        }
        {shouldShowError && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea