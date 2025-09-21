import { UserAppointmentPage, UserAppointmentDetailsPage, UserMedicalRecordsPage, UserMedicalRecordDetailsPage } from '../pages';
import { RouteType } from '../types';

export const userRoutes: RouteType[] = [
    { path: '/user/appointments', component: UserAppointmentPage, layout: 'user' },
    { path: '/user/appointments/details/:appointmentId', component: UserAppointmentDetailsPage, layout: 'user' },
    { path: '/user/medical-records', component: UserMedicalRecordsPage, layout: 'user' },
    { path: '/user/medical-records/details/:medicalRecordId', component: UserMedicalRecordDetailsPage, layout: 'user' },
];