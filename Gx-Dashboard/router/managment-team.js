const express = require('express');
const router = express.Router();
const { GetTeam, AddMember, RemoveMember, ModifyMember } = require('../controllers/ManagmentTeamController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetTeam)
router.post('/', verifyJWt, AddMember)
router.put('/', verifyJWt, ModifyMember)
router.delete('/', verifyJWt, RemoveMember)

// router.post('/', handleLogin)

module.exports = router;