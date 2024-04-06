const express = require('express')
const router = express.Router()
const { handleNewUser } = require('../controllers/UsersController')

router.post('/', handleNewUser)

module.exports = router