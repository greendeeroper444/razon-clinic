import { useState, SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'
import { User, Mail, Lock, Calendar, Users, ChevronDown, Clock, Pill, BadgeCheck } from 'lucide-react'

type IconType = 'user' | 'email' | 'lock' | 'calendar' | 'users' | 'clock' | 'pill' | 'status';

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string
    error?: string
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    leftIcon?: IconType
    options: SelectOption[]
    placeholder?: string
}

const Select: React.FC<SelectProps> = ({
    label,
    error,
    onChange,
    leftIcon,
    options,
    placeholder = 'Select an option',
    className,
    ...props
}) => {
    const [focused, setFocused] = useState<boolean>(false)

    const selectClasses = [
        styles.select,
        focused && styles.focused,
        error && styles.error,
        leftIcon && styles.selectWithLeftIcon,
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
            case 'clock':
                return <Clock className={styles.icon} />
            case 'pill':
                return <Pill className={styles.icon} />
            case 'status':
                return <BadgeCheck  className={styles.icon} />
            default:
                return null
        }
    }


  return (
    <div className={styles.container}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.selectWrapper}>
            {
                leftIcon && (
                    <div className={styles.iconContainer}>
                        {getIcon(leftIcon)}
                    </div>
                )
            }

            <select
                className={selectClasses}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...props}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {
                    options.map((option, index) => (
                        <option
                            key={index}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))
                }
            </select>

            <div className={styles.chevronContainer}>
                <ChevronDown className={styles.chevronIcon} />
            </div>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

export default Select