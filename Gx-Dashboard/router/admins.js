const express = require('express');
const router = express.Router();
const { GetAdmins, VerifyAdmin, RemoveAdmin } = require('../controllers/AdminsController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAdmins)
router.put('/', verifyJWt, VerifyAdmin)
router.post('/', verifyJWt, RemoveAdmin)

// router.post('/', handleLogin)

module.exports = router;