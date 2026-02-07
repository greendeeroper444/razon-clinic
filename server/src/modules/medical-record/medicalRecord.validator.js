const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidationErrors } = require('@helpers/validationErrorHandler.helper');

const validateMedicalRecord = [
    body('appointmentId')
        .optional({ values: 'falsy' })
        .custom((value) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid appointment ID format');
            }
            return true;
        }),
    
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Date of birth must be a valid date')
        .toDate()
        .custom((value) => {
            const today = new Date();
            const age = (today - value) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 0) {
                throw new Error('Date of birth cannot be in the future');
            }
            if (age > 150) {
                throw new Error('Date of birth seems unrealistic');
            }
            return true;
        }),
    
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    
    body('bloodType')
        .optional({ values: 'falsy' })
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
    
    body('address')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),
    
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .custom((value) => {
            if (!value) return true;
            const numberStr = String(value);
            //accept formats: 09XXXXXXXXX or +639XXXXXXXXX or 9XXXXXXXXX or 10-15 digits
            if (!/^(09|\+639|9)\d{9}$/.test(numberStr) && !/^[0-9]{10,15}$/.test(numberStr)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    
    body('email')
        .optional({ values: 'falsy' })
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    
    body('emergencyContact')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 200 }).withMessage('Emergency contact must not exceed 200 characters'),

    body('allergies')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Allergies must not exceed 1000 characters'),
    
    body('chronicConditions')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Chronic conditions must not exceed 1000 characters'),
    
    body('previousSurgeries')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Previous surgeries must not exceed 1000 characters'),
    
    body('familyHistory')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Family history must not exceed 1000 characters'),

    body('height')
        .optional({ values: 'falsy' })
        .isFloat({ min: 30, max: 300 }).withMessage('Height must be between 30 and 300 cm'),
    
    body('weight')
        .optional({ values: 'falsy' })
        .isFloat({ min: 0.5, max: 500 }).withMessage('Weight must be between 0.5 and 500 kg'),
    
    body('bmi')
        .optional({ values: 'falsy' })
        .isFloat({ min: 5, max: 100 }).withMessage('BMI must be between 5 and 100'),
    
    body('growthNotes')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 }).withMessage('Growth notes must not exceed 500 characters'),

    body('chiefComplaint')
        .notEmpty().withMessage('Chief complaint is required')
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Chief complaint must not exceed 200 characters'),
    
    body('symptomsDescription')
        .notEmpty().withMessage('Symptoms description is required')
        .trim()
        .isLength({ min: 1, max: 1000 }).withMessage('Symptoms description must not exceed 1000 characters'),
    
    body('symptomsDuration')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Symptoms duration must not exceed 100 characters'),
    
    body('painScale')
        .optional({ values: 'falsy' })
        .isInt({ min: 1, max: 10 }).withMessage('Pain scale must be between 1 and 10'),

    body('diagnosis')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Diagnosis must not exceed 1000 characters'),
    
    body('treatmentPlan')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Treatment plan must not exceed 2000 characters'),
    
    body('prescribedMedications')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Prescribed medications must not exceed 2000 characters'),
    
    body('consultationNotes')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Consultation notes must not exceed 2000 characters'),
    
    body('vaccinationHistory')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Vaccination history must not exceed 2000 characters'),

    body('followUpDate')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Follow-up date must be a valid date')
        .toDate()
        .custom((value) => {
            if (!value) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (value < today) {
                throw new Error('Follow-up date cannot be in the past');
            }
            return true;
        }),

    handleValidationErrors
];

const validateMedicalRecordUpdate = [
    param('medicalRecordId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid medical record ID format');
            }
            return true;
        }),
    
    body('appointmentId')
        .optional({ values: 'falsy' })
        .custom((value) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid appointment ID format');
            }
            return true;
        }),
    
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
    body('dateOfBirth')
        .optional()
        .isISO8601().withMessage('Date of birth must be a valid date')
        .toDate()
        .custom((value) => {
            if (!value) return true;
            const today = new Date();
            const age = (today - value) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 0) {
                throw new Error('Date of birth cannot be in the future');
            }
            if (age > 150) {
                throw new Error('Date of birth seems unrealistic');
            }
            return true;
        }),
    
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    
    body('bloodType')
        .optional({ values: 'falsy' })
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
    
    body('phone')
        .optional()
        .custom((value) => {
            if (!value) return true;
            const numberStr = String(value);
            if (!/^(09|\+639|9)\d{9}$/.test(numberStr) && !/^[0-9]{10,15}$/.test(numberStr)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    
    body('email')
        .optional({ values: 'falsy' })
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    
    body('chiefComplaint')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Chief complaint must not exceed 200 characters'),
    
    body('symptomsDescription')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 1000 }).withMessage('Symptoms description must not exceed 1000 characters'),
    
    body('diagnosis')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Diagnosis must not exceed 1000 characters'),
    
    body('treatmentPlan')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Treatment plan must not exceed 2000 characters'),

    handleValidationErrors
];

const validateMedicalRecordId = [
    param('medicalRecordId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid medical record ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateAppointmentId = [
    param('appointmentId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid appointment ID format');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateSearchQuery = [
    query('searchTerm')
        .trim()
        .notEmpty().withMessage('Search term is required')
        .isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
    
    handleValidationErrors
];

const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'fullName', 'dateOfBirth', 'updatedAt', 'deletedAt']).withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    
    query('fromDate')
        .optional({ values: 'falsy' }) //this allows empty strings to pass
        .custom((value) => {
            //skip validation if empty string or null
            if (!value || value === '') return true;
            
            //validate if value exists
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('From date must be a valid date');
            }
            return true;
        }),
    
    query('toDate')
        .optional({ values: 'falsy' })
        .custom((value) => {
            //skip validation if empty string or null
            if (!value || value === '') return true;
            
            //validate if value exists
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('To date must be a valid date');
            }
            return true;
        }),
    
    query('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    
    query('bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
    
    handleValidationErrors
];

module.exports = {
    validateMedicalRecord,
    validateMedicalRecordUpdate,
    validateMedicalRecordId,
    validateAppointmentId,
    validateSearchQuery,
    validateQueryParams
};