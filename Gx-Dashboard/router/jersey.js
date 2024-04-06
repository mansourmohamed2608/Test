const express = require('express');
const router = express.Router();
const { GetJerseyById, AddJersey, RemoveJersey, ModifyJersey } = require('../controllers/JerseyController')
const verifyJWt = require('../middleware/verifyJWT')


router.get('/', GetJerseyById)
router.post('/', verifyJWt, AddJersey)
router.put('/', verifyJWt, ModifyJersey)
router.delete('/', verifyJWt, RemoveJersey)

module.exports = router;
