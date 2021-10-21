const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const productController = require('../controllers/product');

// ================= POST ==================

// @route POST api/product
// @desc add new product
// @access Private
router.post('/', verifyToken, productController.add);


module.exports = router;