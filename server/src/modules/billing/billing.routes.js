const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const billingController = require('./billing.controller');
const validator = require('./billing.validator');

router.post(
    '/addBilling', 
    authenticate,
    validator.validateBilling,
    billingController.addBilling
);

router.get(
    '/getBillings', 
    authenticate,
    validator.validateQueryParams,
    billingController.getBillings
);

router.get(
    '/getBillingById/:billingId', 
    authenticate,
    validator.validateBillingId,
    billingController.getBillingById
);

router.put(
    '/updateBilling/:billingId', 
    authenticate,
    validator.validateBillingId,
    validator.validateBilling,
    billingController.updateBilling
);

router.delete(
    '/deleteBilling/:billingId', 
    authenticate,
    validator.validateBillingId,
    billingController.deleteBilling
);

router.get(
    '/getMedicalRecordsForBilling', 
    authenticate,
    billingController.getMedicalRecordsForBilling
);

router.get(
    '/getInventoryItemsForBilling', 
    authenticate,
    billingController.getInventoryItemsForBilling
);

router.get(
    '/exportBillings',
    authenticate,
    validator.validateQueryParams,
    billingController.exportBillings
);

// router.patch(
//     '/updatePaymentStatus/:billingId',
//     authenticate,
//     validator.validatePaymentStatusUpdate,
//     billingController.updatePaymentStatus
// );

// router.get(
//     '/revenue',
//     authenticate,
//     validator.validateRevenueQuery,
//     billingController.getTotalRevenue
// );

// router.get(
//     '/byMedicalRecord/:medicalRecordId',
//     authenticate,
//     validator.validateMedicalRecordId,
//     billingController.getBillingsByMedicalRecord
// );

module.exports = router;