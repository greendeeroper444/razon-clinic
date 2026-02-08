const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const personnelController = require('./personnel.controller');
const validator = require('./personnel.validator');

router.post(
    '/addPersonnel', 
    authenticate, 
    validator.validatePersonnel, 
    personnelController.addPersonnel
);

router.get(
    '/getPersonnel', 
    authenticate,
    validator.validateQueryParams,
    personnelController.getPersonnel
);

router.get(
    '/getPersonnelById/:personnelId', 
    authenticate, 
    validator.validatePersonnelId,
    personnelController.getPersonnelById
);

router.put(
    '/updatePersonnel/:personnelId', 
    authenticate, 
    validator.validatePersonnelId,
    validator.validatePersonnelUpdate, 
    personnelController.updatePersonnel
);

router.delete(
    '/deletePersonnel/:personnelId', 
    authenticate, 
    validator.validatePersonnelId,
    personnelController.deletePersonnel
);

router.get(
    '/getPersonnelByRole', 
    authenticate,
    validator.validateRoleQuery,
    personnelController.getPersonnelByRole
);

router.get(
    '/getPersonnelStats', 
    authenticate,
    personnelController.getPersonnelStats
);

module.exports = router;