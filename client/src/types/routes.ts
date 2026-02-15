export interface RouteType {
    path: string;
    component: React.ComponentType<any>;
    layout: 'user' | 'admin' | 'public';
    requireAuth: boolean;
    allowedUserTypes?: string[];
    redirectOnAuth?: boolean
}