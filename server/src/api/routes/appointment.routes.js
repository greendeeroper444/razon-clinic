const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment.controller');
const validator = require('../validators/appointment.validator');
const { authenticate } = require('../middlewares/auth.middleware');

//create a new appointment
router.post(
    '/addAppointment', 
    authenticate, 
    validator.validateAppointment, 
    AppointmentController.addAppointment
);

//get all appointments (with optional query filters)
router.get(
    '/getAppointment', 
    authenticate, 
    AppointmentController.getAppointment
);

router.get(
    '/getAppointmentDetails/:appointmentId', 
    authenticate, 
    AppointmentController.getAppointmentDetails 
);


//get a specific appointment by ID
router.get(
    '/getAppointmentById/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    AppointmentController.getAppointmentById
);

router.get(
    '/getMyAppointment', 
    authenticate,
    AppointmentController.getMyAppointment
);

//update an appointment
router.put(
    '/updateAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointment, 
    AppointmentController.updateAppointment
);

//update only the status of an appointment
router.patch(
    '/updateAppointment/:appointmentId/status', 
    authenticate, 
    validator.validateStatusUpdate, 
    AppointmentController.updateAppointment
);

//delete an appointment
router.delete(
    '/deleteAppointment/:appointmentId', 
    authenticate, 
    validator.validateAppointmentId,
    AppointmentController.deleteAppointment
);

module.exports = router;