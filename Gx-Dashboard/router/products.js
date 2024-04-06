const express = require('express');
const router = express.Router();
const { GetAllProducts,GetProductById,GetProductByCategory ,AddProduct, RemoveProduct, ModifyProduct } = require('../controllers/ProductsController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAllProducts)
router.get('/Id', GetProductById)
router.get('/Category', GetProductByCategory)
router.post('/', verifyJWt, AddProduct)
router.put('/', verifyJWt, ModifyProduct)
router.delete('/', verifyJWt, RemoveProduct)

module.exports = router;