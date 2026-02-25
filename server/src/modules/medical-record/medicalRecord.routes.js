const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const { validateMedicalRecord, validateMedicalRecordUpdate, validateMedicalRecordId, validateAppointmentId, validateSearchQuery, validateQueryParams, validateMedicalRecordSearchQuery } = require('./medicalRecord.validator');
const medicalRecordController = require('./medicalRecord.controller');
const { validatePatientId } = require('../patient/patient.validator');

// ==================== CREATE ====================
router.post(
    '/addMedicalRecord',
    authenticate,
    validateMedicalRecord,
    medicalRecordController.addMedicalRecord
);

// ==================== READ ====================
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

router.get(
    '/searchPatientsByName',
    authenticate,
    validateSearchQuery,
    medicalRecordController.searchPatientsByName
);

router.get(
    '/getMedicalRecordsByName',
    authenticate,
    validateMedicalRecordSearchQuery,
    medicalRecordController.getMedicalRecordsByName
);

router.get(
    '/getPatientForAutofill/:patientId',
    authenticate,
    validatePatientId,
    medicalRecordController.getPatientForAutofill
);


router.get(
    '/getMedicalRecordById/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.getMedicalRecordById
);

router.get(
    '/getDeletedMedicalRecords',
    authenticate,
    validateQueryParams,
    medicalRecordController.getDeletedMedicalRecords
);

// ==================== UPDATE ====================
router.put(
    '/updateMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordUpdate,
    medicalRecordController.updateMedicalRecord
);

router.patch(
    '/restoreMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.restoreMedicalRecord
);

router.post(
    '/bulkRestore',
    authenticate,
    medicalRecordController.bulkRestore
);

// ==================== DELETE ====================
router.delete(
    '/softDeleteMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.softDeleteMedicalRecord
);

router.delete(
    '/deleteMedicalRecord/:medicalRecordId',
    authenticate,
    validateMedicalRecordId,
    medicalRecordController.deleteMedicalRecord
);

router.post(
    '/bulkPermanentDelete',
    authenticate,
    medicalRecordController.bulkPermanentDelete
);

router.get(
    '/exportMedicalRecords',
    authenticate,
    medicalRecordController.exportMedicalRecords
);

module.exports = router;