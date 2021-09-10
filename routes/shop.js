const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const shopController = require('../controllers/shop')

// ================= GET ==================

// @route GET api/shop
// @desc get information of shop
// @access Private
router.get('/', verifyToken, shopController.getInformation);


// ================= POST ==================

// @route POST api/shop
// @desc put information of shop
// @access Private
router.post('/', verifyToken, shopController.updateInformation);




module.exports = router;