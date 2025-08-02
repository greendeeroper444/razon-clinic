const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const appointmentRoutes = require('./appointment.routes');
const notificationRoutes = require('./notification.routes');
const inventoryItemRoutes = require('./inventoryItem.routes');
const patientRoutes = require('./patient.routes');
const medicalRecordRoutes = require('./medicalRecord.routes');
const billingRoutes = require('./billing.routes');
const { ApiError } = require('../../utils/errors');


const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/inventoryItems', inventoryItemRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/medicalRecords', medicalRecordRoutes);
     app.use('/api/billings', billingRoutes);
    
    app.use((req, res, next) => {
       next(new ApiError(`Resource not found: ${req.originalUrl}`, 404));
    });
};

module.exports = setupRoutes;