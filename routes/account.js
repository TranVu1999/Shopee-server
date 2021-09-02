const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const accountController = require('../controllers/account')

// ================= POST ==================

// @route POST api/account/short-information
// @desc get short information of account
// @access Private
router.get('/short-information', verifyToken, accountController.getShortInformation);




module.exports = router;