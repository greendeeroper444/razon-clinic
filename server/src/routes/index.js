const authRoutes = require('@modules/auth/auth.routes');
const userRoutes = require('@modules/user/user.routes');
const appointmentRoutes = require('@modules/appointment/appointment.routes');
const notificationRoutes = require('@modules/notification/notification.routes');
const inventoryItemRoutes = require('@modules/inventory-item/inventoryItem.routes');
const patientRoutes = require('@modules/patient/patient.routes');
const medicalRecordRoutes = require('@modules/medical-record/medicalRecord.routes');
const billingRoutes = require('@modules/billing/billing.routes');
const reportRoutes = require('@modules/report/report.routes');
const blockedTimeSlotRoutes = require('@modules/blocked-time-slot/blockedTimeSlot.routes');
const otpRoutes = require('@modules/otp/otp.routes');
const personnelRoutes = require('@modules/personnel/personnel.routes');
const { ApiError } = require('@utils/errors');


const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/inventoryItems', inventoryItemRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/medicalRecords', medicalRecordRoutes);
    app.use('/api/billings', billingRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/blockedTimeSlots', blockedTimeSlotRoutes);
    app.use('/api/otp', otpRoutes);
    app.use('/api/personnels', personnelRoutes);
    
    app.use((req, res, next) => {
       next(new ApiError(`Resource not found: ${req.originalUrl}`, 404));
    });
};

module.exports = setupRoutes;