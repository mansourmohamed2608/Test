const express = require('express');
const router = express.Router();
const { GetAllData } = require('../controllers/GetAllController')

router.get('/', GetAllData)

module.exports = router;
