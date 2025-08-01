import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ModalType } from "./modal";
import { ActionButton } from "./action";
import { ReactNode } from "react";

//navbar
export interface NavbarProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

//sidebar
export interface SidebarProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export interface OpenModalWithRefreshProps {
    modalType: ModalType;
    openModal: ((type: ModalType) => void) | undefined;
    onRefresh: () => void;
};


export interface StatusFormProps {
    currentStatus?: string;
    onStatusChange: (status: string) => void;
}

export interface BackButtonProps {
    onClick?: () => void;
    icon?: IconDefinition;
}

export interface NotificationProps {
    isVisible: boolean;
    onUnreadCountChange?: (count: number) => void;
    onClose: () => void;
}


export interface HeaderProps {
    title: string;
    subtitle?: string;
    backButton?: BackButtonProps;
    actions?: ActionButton[];
    children?: ReactNode;
    className?: string;
}


export interface MainProps {
    children: ReactNode;
    className?: string;
    loading?: boolean;
    error?: string | null;
    loadingMessage?: string;
    loadingType? : string;
    onErrorRetry?: () => void;
}

export interface SubmitLoadingProps {
    isLoading: boolean
    loadingText?: string
    size?: 'small' | 'medium' | 'large'
    variant?: 'overlay' | 'inline' | 'button'
    className?: string
}