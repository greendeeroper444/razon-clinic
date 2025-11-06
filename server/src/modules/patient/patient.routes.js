const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const patientController = require('./patient.controller');


router.post(
    '/addPatient', 
    authenticate, 
    // validator.validatePatient, 
    patientController.addPatient
);




router.get(
    '/getPatients', 
    authenticate, 
    patientController.getPatients
);



router.get(
    '/getPatientById/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    patientController.getPatientById
);



router.put(
    '/updatePatient/:patientId', 
    authenticate, 
    // validator.validatePatient, 
    patientController.updatePatient
);



router.delete(
    '/deletePatient/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    patientController.deletePatient
);

module.exports = router;