import { HomePage, LoginPage, SignupPage, ForgotPasswordPage, TermsAndConditionPage } from '../pages';
import { RouteType } from '../types';

export const publicRoutes: RouteType[] = [
    { path: '/', component: HomePage, layout: 'user' },
    { path: '/login', component: LoginPage, layout: 'user' },
    { path: '/signup', component: SignupPage, layout: 'user' },
    { path: '/forgot-password', component: ForgotPasswordPage, layout: 'user' },
    { path: '/terms-and-conditions', component: TermsAndConditionPage, layout: 'user' },
];