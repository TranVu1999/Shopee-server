const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const shopController = require('../controllers/shop')

// ================= POST ==================

// @route POST api/shop
// @desc get information of shop
// @access Private
router.get('/', verifyToken, shopController.getInformation);




module.exports = router;