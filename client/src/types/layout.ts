export interface LayoutProps {
  children: React.ReactNode;
  type: 'user' | 'admin' | 'public';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}