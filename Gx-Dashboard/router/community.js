const express = require('express');
const router = express.Router();
const { getImages, removeImage, addNewImage } = require('../controllers/CommunityController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', getImages)
router.post('/', verifyJWt, addNewImage)
router.delete('/', verifyJWt, removeImage)

// router.post('/', handleLogin)

module.exports = router;