const express = require('express');
const router = express.Router();
const PersonalPatientController = require('../controllers/personalPatient.controller');
// const validator = require('../validators/InventoryItem.validator');
const { authenticate } = require('../middlewares/auth.middleware');


router.post(
    '/addPersonalPatient', 
    authenticate, 
    // validator.validateInventoryItem, 
    PersonalPatientController.addPersonalPatient
);




router.get(
    '/getPersonalPatients', 
    authenticate, 
    PersonalPatientController.getPersonalPatient
);



router.get(
    '/getPersonalPatient/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    PersonalPatientController.getPersonalPatientById
);



router.put(
    '/updatePersonalPatient/:patientId', 
    authenticate, 
    // validator.validateInventoryItem, 
    PersonalPatientController.updatePersonalPatient
);



router.delete(
    '/deletePersonalPatient/:patientId', 
    authenticate, 
    // validator.validatepatientId,
    PersonalPatientController.deletePersonalPatient
);

module.exports = router;