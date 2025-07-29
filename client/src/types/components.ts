import { ModalType } from "./modal";

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