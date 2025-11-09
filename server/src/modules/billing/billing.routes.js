const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const billingController = require('./billing.controller');

router.post(
    '/addBilling', 
    authenticate, 
    billingController.addBilling
);

router.get(
    '/getBillings', 
    authenticate, 
    billingController.getBillings
);

router.get(
    '/getBillingById/:billingId', 
    authenticate, 
    billingController.getBillingById
);

router.put(
    '/updateBilling/:billingId', 
    authenticate, 
    billingController.updateBilling
);

router.delete(
    '/deleteBilling/:billingId', 
    authenticate, 
    billingController.deleteBilling
);

//additional routes for supporting data
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
    billingController.exportBillings
);

module.exports = router;