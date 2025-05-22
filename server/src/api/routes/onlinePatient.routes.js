const express = require('express');
const router = express.Router();
const OnlinePatientController = require('../controllers/onlinePatient.controller');
const { authenticate } = require('../middlewares/auth.middleware');


router.get('/', authenticate, OnlinePatientController.getAllOnlinePatient);
router.get('/getPatients', authenticate, OnlinePatientController.getPatients);
router.get('/getPatientById/:id', authenticate, OnlinePatientController.getPatientById);

module.exports = router;