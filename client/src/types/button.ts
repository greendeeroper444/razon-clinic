import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = 'primary' | 'secondary' | 'close' | 'remove' | 'add' | 'delete';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
    isLoading?: boolean;
    loadingText?: string;
}
