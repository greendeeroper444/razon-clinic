const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const patientController = require('./patient.controller');
const validator = require('./patient.validator');

router.post(
    '/addPatient', 
    authenticate, 
    validator.validatePatient, 
    patientController.addPatient
);

router.get(
    '/getPatients', 
    authenticate, 
    validator.validateQueryParams,
    patientController.getPatients
);

router.get(
    '/getPatientById/:patientId', 
    authenticate, 
    validator.validatePatientId,
    patientController.getPatientById
);

router.put(
    '/updatePatient/:patientId', 
    authenticate,
    validator.validatePatientId,
    validator.validatePatient, 
    patientController.updatePatient
);

router.delete(
    '/deletePatient/:patientId', 
    authenticate, 
    validator.validatePatientId,
    patientController.deletePatient
);

router.patch(
    '/archivePatient/:patientId', 
    authenticate, 
    validator.validateArchivePatient, 
    patientController.archivePatient
);

router.patch(
    '/unarchivePatient/:patientId', 
    authenticate, 
    validator.validateArchivePatient, 
    patientController.unarchivePatient
);

router.patch(
    '/archiveMultiplePatients', 
    authenticate, 
    validator.validateMultiplePatients, 
    patientController.archiveMultiplePatients
);

router.patch(
    '/unarchiveMultiplePatients', 
    authenticate, 
    validator.validateMultiplePatients, 
    patientController.unarchiveMultiplePatients
);

module.exports = router;