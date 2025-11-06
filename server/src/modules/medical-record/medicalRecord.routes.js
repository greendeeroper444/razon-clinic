const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const { validateMedicalRecord, validateMedicalRecordUpdate, validateMedicalRecordId, validateAppointmentId, validateSearchQuery, validateQueryParams } = require('@validators/medicalRecord.validator');
const medicalRecordController = require('./medicalRecord.controller');

router.post(
    '/addMedicalRecord',
    authenticate,
    validateMedicalRecord,
    medicalRecordController.addMedicalRecord
);

router.get(
    '/getMedicalRecords',
    authenticate,
    validateQueryParams,
    medicalRecordController.getMedicalRecords
);

router.get(
    '/getMyMedicalRecords',
    authenticate,
    validateQueryParams,
    medicalRecordController.getMedicalRecords
);

router.get(
    '/getMedicalRecordById/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.getMedicalRecordById
);

router.put(
    '/updateMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordUpdate,
    medicalRecordController.updateMedicalRecord
);

router.delete(
    '/deleteMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.deleteMedicalRecord
);

router.get(
    '/searchAppointments',
    authenticate,
    validateSearchQuery,
    medicalRecordController.searchAppointmentsByName
);

router.get(
    '/getAppointmentForAutofill/:appointmentId',
    authenticate,
    validateAppointmentId,
    medicalRecordController.getAppointmentForAutofill
);

module.exports = router;