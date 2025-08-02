const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patient.controller');
// const validator = require('../validators/InventoryItem.validator');
const { authenticate } = require('../middlewares/auth.middleware');


router.post(
    '/addPatient', 
    authenticate, 
    // validator.validateInventoryItem, 
    PatientController.addPatient
);




router.get(
    '/getPatients', 
    authenticate, 
    PatientController.getPatients
);



router.get(
    '/getPatientById/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    PatientController.getPatientById
);



router.put(
    '/updatePatient/:patientId', 
    authenticate, 
    // validator.validateInventoryItem, 
    PatientController.updatePatient
);



router.delete(
    '/deletePatient/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    PatientController.deletePatient
);

module.exports = router;