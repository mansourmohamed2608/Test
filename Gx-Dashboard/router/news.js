const express = require('express');
const router = express.Router();
const { GetNews, AddNews, RemoveNews, ModifyNews } = require('../controllers/NewsController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetNews)
router.post('/', verifyJWt, AddNews)
router.put('/', verifyJWt, ModifyNews)
router.delete('/', verifyJWt, RemoveNews)

module.exports = router;