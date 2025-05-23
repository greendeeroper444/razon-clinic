const authRoutes = require('./auth.routes');
const onlinePatientRoutes = require('./onlinePatient.routes');
const appointmentRoutes = require('./appointment.routes');
const notificationRoutes = require('./notification.routes');
const inventoryItemRoutes = require('./inventoryItem.routes');
const personalPatientRoutes = require('./personalPatient.routes');
const { ApiError } = require('../../utils/errors');


const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/onlinePatients', onlinePatientRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/inventoryItems', inventoryItemRoutes);
    app.use('/api/personalPatients', personalPatientRoutes);
    
    app.use((req, res, next) => {
       next(new ApiError(`Resource not found: ${req.originalUrl}`, 404));
    });
};

module.exports = setupRoutes;