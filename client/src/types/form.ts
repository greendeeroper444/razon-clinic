import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export type FormFieldType = 'input' | 'select' | 'textarea';

export interface BaseFormGroupProps {
    label: string;
    id: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    helperText?: string;
    className?: string;
}

export interface InputFormGroupProps extends BaseFormGroupProps {
    type: 'input';
    inputType?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
    placeholder?: string;
    min?: number | string;
    max?: number;
    minLength?: number;
    maxLength?: number;
    step?: number;
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'name' | 'value' | 'onChange' | 'required' | 'disabled'>;
}

export interface SelectFormGroupProps extends BaseFormGroupProps {
    type: 'select';
    options: Array<{ value: string | number; label: string; disabled?: boolean }>;
    placeholder?: string;
    selectProps?: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'value' | 'onChange' | 'required' | 'disabled'>;
}

export interface TextareaFormGroupProps extends BaseFormGroupProps {
    type: 'textarea';
    placeholder?: string;
    rows?: number;
    cols?: number;
    minLength?: number;
    maxLength?: number;
    textareaProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'name' | 'value' | 'onChange' | 'required' | 'disabled'>;
}

export type FormGroupProps = InputFormGroupProps | SelectFormGroupProps | TextareaFormGroupProps;