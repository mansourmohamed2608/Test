const express = require('express');
const router = express.Router();
const {GetAllSliders, AddSlider, ModifySlider, RemoveSlider } = require('../controllers/SliderController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAllSliders)
router.post('/', verifyJWt, AddSlider)
router.put('/', verifyJWt, ModifySlider)
router.delete('/', verifyJWt, RemoveSlider)


// router.post('/', handleLogin)

module.exports = router;
