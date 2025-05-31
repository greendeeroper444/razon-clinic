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
    '/getMedicalRecord/:id',
    authenticate,
    MedicalRecordController.getMedicalRecordById
);

router.put(
    '/updateMedicalRecord/:id',
    authenticate,
    MedicalRecordController.updateMedicalRecord
);

router.delete(
    '/deleteMedicalRecord/:id',
    authenticate,
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