const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post(
    '/addBilling', 
    authenticate, 
    BillingController.addBilling
);

router.get(
    '/getBillings', 
    authenticate, 
    BillingController.getBillings
);

router.get(
    '/getBillingById/:billingId', 
    authenticate, 
    BillingController.getBillingById
);

router.put(
    '/updateBilling/:billingId', 
    authenticate, 
    BillingController.updateBilling
);

router.delete(
    '/deleteBilling/:billingId', 
    authenticate, 
    BillingController.deleteBilling
);

//additional routes for supporting data
router.get(
    '/getMedicalRecordsForBilling', 
    authenticate, 
    BillingController.getMedicalRecordsForBilling
);

router.get(
    '/getInventoryItemsForBilling', 
    authenticate, 
    BillingController.getInventoryItemsForBilling
);

module.exports = router;