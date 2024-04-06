const express = require('express');
const router = express.Router();
const { GetAcheivments, AddAcheivment, RemoveAcheivment, ModifyAcheivment } = require('../controllers/AcheivmentsController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAcheivments)
router.post('/', verifyJWt, AddAcheivment)
router.put('/', verifyJWt, ModifyAcheivment)
router.delete('/', verifyJWt, RemoveAcheivment)

module.exports = router;