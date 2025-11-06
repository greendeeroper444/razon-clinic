const express = require('express');
const router = express.Router();
const validator = require('@validators/appointment.validator');
const { authenticate } = require('@middlewares/auth.middleware');
const appointmentController = require('./appointment.controller');

router.post(
    '/addAppointment', 
    authenticate, 
    validator.validateAppointment, 
    appointmentController.addAppointment
);

router.get(
    '/getAppointments', 
    authenticate,
    validator.validateQueryParams,
    appointmentController.getAppointments
);

router.get(
    '/getMyAppointments', 
    authenticate,
    validator.validateQueryParams,
    appointmentController.getAppointments
);

router.get(
    '/getAllTimePerDate', 
    authenticate,
    validator.validateDateQuery,
    appointmentController.getAllTimePerDate
);

router.get(
    '/getAppointmentById/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    appointmentController.getAppointmentById
);

router.put(
    '/updateAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointment, 
    appointmentController.updateAppointment
);

router.patch(
    '/updateAppointment/:appointmentId/status', 
    authenticate, 
    validator.validateStatusUpdate, 
    appointmentController.updateAppointment
);

router.delete(
    '/deleteAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    appointmentController.deleteAppointment
);

module.exports = router;