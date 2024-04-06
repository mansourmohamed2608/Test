const express = require('express')
const router = express.Router()
const { handleVerify } = require('../controllers/UsersController')

router.post('/', handleVerify)

module.exports = router