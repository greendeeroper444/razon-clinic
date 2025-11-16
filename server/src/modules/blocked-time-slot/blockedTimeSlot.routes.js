const express = require('express');
const router = express.Router();
const { authenticate } = require('@middlewares/auth.middleware');
const blockedTimeSlotController = require('./blockedTimeSlot.controller');
const validator = require('./blockedTimeSlot.validator');

router.post(
    '/addBlockedTimeSlot', 
    authenticate, 
    validator.validateBlockedTimeSlot, 
    blockedTimeSlotController.addBlockedTimeSlot
);

router.get(
    '/getBlockedTimeSlots', 
    authenticate,
    validator.validateQueryParams,
    blockedTimeSlotController.getBlockedTimeSlots
);

router.get(
    '/getBlockedTimeSlot/:blockedTimeSlotId', 
    authenticate, 
    validator.validateBlockedTimeSlotId,
    blockedTimeSlotController.getBlockedTimeSlotById
);

router.put(
    '/updateBlockedTimeSlot/:blockedTimeSlotId', 
    authenticate, 
    validator.validateBlockedTimeSlotId,
    validator.validateBlockedTimeSlot, 
    blockedTimeSlotController.updateBlockedTimeSlot
);

router.delete(
    '/deleteBlockedTimeSlot/:blockedTimeSlotId', 
    authenticate, 
    validator.validateBlockedTimeSlotId,
    blockedTimeSlotController.deleteBlockedTimeSlot
);

module.exports = router;