const { authenticate, authenticateRefresh, requireAdmin, requireDoctor, requireStaff, requirePatient, requireUser } = require('./auth.middleware');
const errorHandler = require('./errorHandler.middleware');
const setupMiddleware = require('./middleware');

module.exports = {
    //app-level setup
    setupMiddleware,
    errorHandler,
    //authentication
    authenticate,
    authenticateRefresh,
    //authorization
    requireAdmin,
    requireDoctor,
    requireStaff,
    requirePatient,
    requireUser
};