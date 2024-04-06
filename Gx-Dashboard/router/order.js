const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated')
const { GetOrders,GetOrdersById, AddOrder, UpdateOrder, RemoveOrder, PaymentCallback } = require('../controllers/OrderController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/order'  , verifyJWt, GetOrders)
router.get('/order/id', ensureAuthenticated,GetOrdersById)
router.post('/order',ensureAuthenticated  ,AddOrder)
router.put('/order' , verifyJWt,  UpdateOrder)
router.delete('/order' ,  verifyJWt, RemoveOrder)
router.get('/payment-callback', PaymentCallback);
module.exports = router;
