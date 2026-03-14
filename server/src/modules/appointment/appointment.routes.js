const express = require('express');
const router = express.Router();
const validator = require('./appointment.validator');
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

// NEW: Admin approves a cancellation request
router.patch(
    '/updateAppointment/:appointmentId/approveCancellation',
    authenticate,
    validator.validateAppointmentId,
    appointmentController.approveCancellation
);

// NEW: Admin rejects a cancellation request
router.patch(
    '/updateAppointment/:appointmentId/rejectCancellation',
    authenticate,
    validator.validateAppointmentId,
    appointmentController.rejectCancellation
);

router.delete(
    '/deleteAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    appointmentController.deleteAppointment
);


router.post(
    '/sendReminder/:appointmentId',
    authenticate,
    validator.validateAppointmentId,
    appointmentController.sendReminder
);

module.exports = router;