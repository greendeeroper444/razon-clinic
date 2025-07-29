const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const billingController = new BillingController();

router.post(
    '/addBilling', 
    authenticate, 
    billingController.addBilling
);

router.get(
    '/getBillings', 
    authenticate, 
    billingController.getAllBillings
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
    '/getMedicalRecords', 
    authenticate, 
    billingController.getMedicalRecordsForBilling
);

router.get(
    '/getInventoryItems', 
    authenticate, 
    billingController.getInventoryItemsForBilling
);

module.exports = router;