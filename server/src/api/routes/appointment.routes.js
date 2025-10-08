const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment.controller');
const validator = require('../validators/appointment.validator');
const { authenticate } = require('../middlewares/auth.middleware');

router.post(
    '/addAppointment', 
    authenticate, 
    validator.validateAppointment, 
    AppointmentController.addAppointment
);

router.get(
    '/getAppointments', 
    authenticate,
    validator.validateQueryParams,
    AppointmentController.getAppointments
);

router.get(
    '/getMyAppointments', 
    authenticate,
    validator.validateQueryParams,
    AppointmentController.getAppointments
);

router.get(
    '/getAllTimePerDate', 
    authenticate,
    validator.validateDateQuery,
    AppointmentController.getAllTimePerDate
);

router.get(
    '/getAppointmentById/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    AppointmentController.getAppointmentById
);

router.put(
    '/updateAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointment, 
    AppointmentController.updateAppointment
);

router.patch(
    '/updateAppointment/:appointmentId/status', 
    authenticate, 
    validator.validateStatusUpdate, 
    AppointmentController.updateAppointment
);

router.delete(
    '/deleteAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    AppointmentController.deleteAppointment
);

module.exports = router;