const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/medicalRecord.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post(
    '/addMedicalRecord',
    MedicalRecordController.addMedicalRecord
);

router.get(
    '/getMedicalRecords',
    MedicalRecordController.getMedicalRecords
);

router.get(
    '/getMedicalRecord/:medicalRecordId',
    authenticate,
    MedicalRecordController.getMedicalRecordById
);

router.put(
    '/updateMedicalRecord/:medicalRecordId',
    MedicalRecordController.updateMedicalRecord
);

router.delete(
    '/deleteMedicalRecord/:medicalRecordId',
    MedicalRecordController.deleteMedicalRecord
);

//search and autofill routes
router.get(
    '/searchAppointments',
    MedicalRecordController.searchAppointmentsByName
);

router.get(
    '/getAppointmentForAutofill/:appointmentId',
    MedicalRecordController.getAppointmentForAutofill
);

module.exports = router;