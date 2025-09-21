import { publicRoutes } from './publicRoutes';
import { adminRoutes } from './adminRoutes';
import { userRoutes } from './userRoutes';
import { RouteType } from '../types';

//combine all routes
export const routes: RouteType[] = [
    ...publicRoutes,
    ...adminRoutes,
    ...userRoutes,
];

export { publicRoutes, adminRoutes, userRoutes };