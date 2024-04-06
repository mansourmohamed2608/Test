const express = require('express');
const router = express.Router();
const { GetCartItems, AddCartItem, UpdateCartItem, RemoveCartItem } = require('../controllers/CartController')
//const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetCartItems)
router.post('/', AddCartItem)
router.put('/', UpdateCartItem)
router.delete('/', RemoveCartItem)

module.exports = router;