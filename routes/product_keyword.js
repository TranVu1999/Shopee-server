const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const productKeywordController = require('../controllers/product_keyword')

// ================= POST ==================

// @route POST api/product-keyword
// @desc add new product keyword
// @access Public
router.post('/', productKeywordController.add);


// @route POST api/product-keyword/:keyword
// @desc get list keyword matched
// @access Public
router.get('/:keyword', productKeywordController.getListMatched);

module.exports = router;