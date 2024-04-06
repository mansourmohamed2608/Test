const express = require('express');
const router = express.Router();

const { initiatePaymentProcess } = require('../controllers/PaymentController');

router.post('/initiate', initiatePaymentProcess);


module.exports = router;
