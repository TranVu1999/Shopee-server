const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const productCategoryController = require('../controllers/product_category');

// ================= POST ==================

// @route POST api/product-category
// @desc add new product category
// @access Private
router.post('/', verifyToken, productCategoryController.add);


// ================= PUT ==================
// @route POST api/product-category
// @desc add new product category
// @access Private
router.put('/:id', verifyToken, productCategoryController.update);


// ================= GET ==================

// @route GET api/product-category
// @desc get all product category
// @access Public
router.get('/', productCategoryController.getAll);

// @route GET api/product-category/:id
// @desc get product category by id
// @access Public
router.get('/:id/:type?', productCategoryController.getById);



module.exports = router;