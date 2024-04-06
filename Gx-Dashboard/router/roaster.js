const express = require('express');
const router = express.Router();
const { GetRoaster, GetPlayersInTeam, AddMember, RemoveMember, ModifyMember } = require('../controllers/RoasterController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetRoaster)
router.get('/Players', GetPlayersInTeam)
router.post('/', verifyJWt, AddMember)
router.put('/', verifyJWt, ModifyMember)
router.delete('/', verifyJWt, RemoveMember)

module.exports = router;