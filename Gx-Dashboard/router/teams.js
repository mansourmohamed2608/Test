const express = require('express');
const router = express.Router();
const { GetAllTeams, GetTeamById, AddTeam, UpdateTeam, DeleteTeam } = require('../controllers/TeamsController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAllTeams)
router.get('/id', GetTeamById)
router.post('/', verifyJWt, AddTeam)
router.put('/', verifyJWt, UpdateTeam)
router.delete('/', verifyJWt, DeleteTeam)

module.exports = router;
