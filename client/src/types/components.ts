
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

export interface DeleteData {
    id: string;
    itemName: string;
    itemType: string;
}


// export interface NotificationComponentProps {
//     isVisible: boolean;
// }
export interface NotificationComponentProps {
    isVisible: boolean;
    onUnreadCountChange?: (count: number) => void;
    onClose: () => void;
}
