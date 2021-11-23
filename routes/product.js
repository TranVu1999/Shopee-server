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

// @route GET api/product/list-delivery-address/:rootCategory
// @desc get list product's delivery address
// @access Public
router.get('/list-delivery-address/:rootCategoryId', productController.getListDeliveryAddress);

// @route GET api/product/list-delivery-address/:rootCategory
// @desc get list product's delivery address
// @access Public
router.get('/list-brand/:rootCategoryId', productController.getListBrand);


// @route GET api/product/:id
// @desc get detail product
// @access Public
router.get('/:id', productController.getDetail);



module.exports = router;