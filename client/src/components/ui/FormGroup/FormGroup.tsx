import React from 'react'
import styles from './FormGroup.module.css'
import { FormGroupProps } from '../../../types';


const FormGroup: React.FC<FormGroupProps> = ({
    label,
    id,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    error,
    helperText,
    className = '',
    ...props
}) => {
    const formGroupClass = `${styles.formGroup} ${className}`.trim();
    const formControlClass = `${styles.formControl} ${error ? styles.error : ''}`.trim();

    const renderField = () => {
        switch (props.type) {
        case 'input':
            return (
            <input
                type={props.inputType || 'text'}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className={formControlClass}
                required={required}
                disabled={disabled}
                placeholder={props.placeholder}
                min={props.min}
                max={props.max}
                minLength={props.minLength}
                maxLength={props.maxLength}
                step={props.step}
                {...props.inputProps}
            />
            );

        case 'select':
            return (
                <select
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={formControlClass}
                    required={required}
                    disabled={disabled}
                    {...props.selectProps}
                >
                    {
                        props.placeholder && (
                            <option value="" disabled={required}>
                                {props.placeholder}
                            </option>
                        )
                    }
                    {
                        props.options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))
                    }
                </select>
            );

        case 'textarea':
            return (
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={formControlClass}
                    required={required}
                    disabled={disabled}
                    placeholder={props.placeholder}
                    rows={props.rows || 3}
                    cols={props.cols}
                    minLength={props.minLength}
                    maxLength={props.maxLength}
                    {...props.textareaProps}
                />
            );

        default:
            return null;
        }
    };

  return (
    <div className={formGroupClass}>
        <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
        </label>
        
        {renderField()}
        
        {
            error && (
                <span className={styles.errorMessage}>{error}</span>
            )
        }
        
        {
            helperText && !error && (
                <span className={styles.helperText}>{helperText}</span>
            )
        }
    </div>
  )
}

export default FormGroup