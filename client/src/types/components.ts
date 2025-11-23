import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ModalType } from "./modal";
import { ActionButton } from "./action";
import { ReactElement, ReactNode } from "react";

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
    backButton?: BackButtonProps | any;
    actions?: ActionButton[] | any;
    children?: ReactNode;
    className?: string;
}


export interface MainProps {
    children: React.ReactNode;
    className?: string;
    loading?: boolean;
    error?: string | null;
    loadingMessage?: string;
    loadingType?: 'spinner' | 'dots' | 'skeleton' | 'progress' | 'backdrop';
    loadingDelay?: number;
    loadingMinDuration?: number;
    onErrorRetry?: () => void;
}

export interface SubmitLoadingProps {
    isLoading: boolean
    loadingText?: string
    size?: 'small' | 'medium' | 'large'
    variant?: 'overlay' | 'inline' | 'button'
    className?: string
}

export interface ProtectedRouteProps {
    children: ReactElement;
    requireAuth?: boolean;
    redirectTo?: string;
    allowedUserTypes?: string[];
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showPageNumbers?: boolean;
    maxVisiblePages?: number;
    disabled?: boolean;
    className?: string;
    showItemsInfo?: boolean;
}

export interface TableColumn<T> {
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
    className?: string;
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[] | any;
    emptyMessage?: string;
    searchTerm?: string;
    className?: string;
    onRowClick?: (item: T) => void;
    getRowKey: (item: T) => string | number;
    highlightRowId?: string | null;
}
