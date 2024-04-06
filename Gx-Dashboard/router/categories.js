const express = require('express');
const router = express.Router();
const { GetAllCategories, AddCategory, RemoveCategory, ModifyCategory } = require('../controllers/CategoriesController')
const verifyJWt = require('../middleware/verifyJWT')

router.get('/', GetAllCategories)
router.post('/', verifyJWt, AddCategory)
router.put('/', verifyJWt, ModifyCategory)
router.delete('/', verifyJWt, RemoveCategory)

module.exports = router;