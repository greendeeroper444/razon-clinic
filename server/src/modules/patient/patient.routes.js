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


router.patch('/archivePatient/:patientId', authenticate, patientController.archivePatient);
router.patch('/unarchivePatient/:patientId', authenticate, patientController.unarchivePatient);
router.patch('/archiveMultiplePatients', authenticate, patientController.archiveMultiplePatients);
router.patch('/unarchiveMultiplePatients', authenticate, patientController.unarchiveMultiplePatients);

module.exports = router;