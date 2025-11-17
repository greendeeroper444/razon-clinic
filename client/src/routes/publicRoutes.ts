import { routeText } from '../constants/messages';
import { HomePage, LoginPage, SignupPage, ForgotPasswordPage, TermsAndConditionPage, PaginaNonPraesto, ResetPasswordPage, OtpPage } from '../pages';
import { RouteType } from '../types';

export const publicRoutes: RouteType[] = [
    { path: '/', component: HomePage, layout: 'public', requireAuth: false, redirectOnAuth: true },
    { path: '/login', component: LoginPage, layout: 'public', requireAuth: false },
    { path: '/signup', component: SignupPage, layout: 'public', requireAuth: false },
    { path: '/terms-and-conditions', component: TermsAndConditionPage, layout: 'public', requireAuth: false },
    { path: `/${routeText}`, component: PaginaNonPraesto, layout: 'public', requireAuth: false },
    { path: '/forgot-password', component: ForgotPasswordPage, layout: 'public', requireAuth: false },
    { path: '/verify-otp', component: OtpPage, layout: 'public', requireAuth: false },
    { path: '/reset-password', component: ResetPasswordPage, layout: 'public', requireAuth: false, redirectOnAuth: false },
];