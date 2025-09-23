import { DashboardPage, AppointmentPage, AppointmentDetailsPage, PatientPage, InventoryPage, ArchivePage, MedicalRecordsPage, MedicalRecordDetailsPage, BillingsPaymentPage, CalendarDateDetailsPage, GrowthMilestonePage, PatientDetailsPage } from '../pages';
import { RouteType } from '../types';

export const adminRoutes: RouteType[] = [
    { path: '/admin/dashboard', component: DashboardPage, layout: 'admin' },
    { path: '/admin/appointments', component: AppointmentPage, layout: 'admin' },
    { path: '/admin/appointments/details/:appointmentId', component: AppointmentDetailsPage, layout: 'admin' },
    { path: '/admin/patients', component: PatientPage, layout: 'admin' },
    { path: '/admin/patients/details/:patientId', component: PatientDetailsPage, layout: 'admin' },
    { path: '/admin/inventory', component: InventoryPage, layout: 'admin' },
    { path: '/admin/archives', component: ArchivePage, layout: 'admin' },
    { path: '/admin/medical-records', component: MedicalRecordsPage, layout: 'admin' },
    { path: '/admin/medical-records/details/:medicalRecordId', component: MedicalRecordDetailsPage, layout: 'admin' },
    { path: '/admin/billings-payment', component: BillingsPaymentPage, layout: 'admin' },
    { path: '/admin/calendar-date-details', component: CalendarDateDetailsPage, layout: 'admin' },
    { path: '/admin/growth-milestone', component: GrowthMilestonePage, layout: 'admin' },
];