const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const accountController = require('../controllers/account')

// ================= GET ==================

// @route GET api/account/short-information
// @desc get short information of account
// @access Private
router.get('/short-information', verifyToken, accountController.getShortInformation);


// @route GET api/account/full-information
// @desc get full information of account
// @access Private
router.get('/full-information', verifyToken, accountController.getFullInformation);




module.exports = router;