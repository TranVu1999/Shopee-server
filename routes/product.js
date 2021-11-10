const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const productController = require('../controllers/product');

// ================= POST ==================

// @route POST api/product
// @desc add new product
// @access Private
router.post('/', verifyToken, productController.add);


// ================= GET ==================


// @route GET api/product
// @desc get list product by category
// @access Public
router.get('/filter', productController.filter);


// @route GET api/product/:id
// @desc get detail product
// @access Public
router.get('/:id', productController.getDetail);



module.exports = router;