const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const productCategoryController = require('../controllers/product_category');

// ================= POST ==================

// @route POST api/product-category
// @desc add new product category
// @access Private
router.post('/', verifyToken, productCategoryController.add);

// @route POST api/product-category/sub-category
// @desc add new sub product category
// @access Private
router.post('/sub-category', verifyToken, productCategoryController.addSubCategory);



module.exports = router;