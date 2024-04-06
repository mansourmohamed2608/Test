const express = require('express');
const router = express.Router();
const { GetMatches, AddMatch, RemoveMatch, ModifyMatch } = require('../controllers/MatchesController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetMatches)
router.post('/', verifyJWt, AddMatch)
router.put('/', verifyJWt, ModifyMatch)
router.delete('/', verifyJWt, RemoveMatch)

module.exports = router;