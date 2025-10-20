import { HomePage, LoginPage, SignupPage, ForgotPasswordPage, TermsAndConditionPage, NotAvailablePage } from '../pages';
import { RouteType } from '../types';

export const publicRoutes: RouteType[] = [
    { path: '/', component: HomePage, layout: 'public', requireAuth: false, redirectOnAuth: true },
    { path: '/login', component: LoginPage, layout: 'public', requireAuth: false },
    { path: '/signup', component: SignupPage, layout: 'public', requireAuth: false },
    { path: '/forgot-password', component: ForgotPasswordPage, layout: 'public', requireAuth: false },
    { path: '/terms-and-conditions', component: TermsAndConditionPage, layout: 'public', requireAuth: false },
    { path: '/not-available', component: NotAvailablePage, layout: 'public', requireAuth: false },
];