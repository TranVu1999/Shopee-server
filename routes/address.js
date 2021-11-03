const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const addressController = require('../controllers/address')

// ================= POST ==================

// @route POST api/address
// @desc add new address
// @access Private
router.post('', verifyToken, addressController.add);


// ================= GET ==================

// @route GET api/address
// @desc get list address
// @access Private
router.get('', verifyToken, addressController.get);




module.exports = router;