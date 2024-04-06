const express = require('express');
const router = express.Router();
const {GetAllBanners, AddBanner, ModifyBanner, RemoveBanner } = require('../controllers/BannerController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAllBanners)
router.post('/', verifyJWt, AddBanner)
router.put('/', verifyJWt, ModifyBanner)
router.delete('/', verifyJWt, RemoveBanner)


// router.post('/', handleLogin)

module.exports = router;