export interface LayoutProps {
  children: React.ReactNode;
  type: 'user' | 'admin';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}