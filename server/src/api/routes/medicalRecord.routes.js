const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/medicalRecord.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateMedicalRecord, validateMedicalRecordUpdate, validateMedicalRecordId, validateAppointmentId, validateSearchQuery, validateQueryParams } = require('../validators/medicalRecord.validator');

router.post(
    '/addMedicalRecord',
    authenticate,
    validateMedicalRecord,
    MedicalRecordController.addMedicalRecord
);

router.get(
    '/getMedicalRecords',
    authenticate,
    validateQueryParams,
    MedicalRecordController.getMedicalRecords
);

router.get(
    '/getMyMedicalRecords',
    authenticate,
    validateQueryParams,
    MedicalRecordController.getMedicalRecords
);

router.get(
    '/getMedicalRecordById/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    MedicalRecordController.getMedicalRecordById
);

router.put(
    '/updateMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordUpdate,
    MedicalRecordController.updateMedicalRecord
);

router.delete(
    '/deleteMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    MedicalRecordController.deleteMedicalRecord
);

router.get(
    '/searchAppointments',
    authenticate,
    validateSearchQuery,
    MedicalRecordController.searchAppointmentsByName
);

router.get(
    '/getAppointmentForAutofill/:appointmentId',
    authenticate,
    validateAppointmentId,
    MedicalRecordController.getAppointmentForAutofill
);

module.exports = router;