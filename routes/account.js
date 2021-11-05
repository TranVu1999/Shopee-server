const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const accountController = require('../controllers/account')

// ================= GET ==================

// @route GET api/account/short-information
// @desc get short information of account
// @access Private
router.get('/short-information', verifyToken, accountController.getShortInformation);

// @route GET api/account/short-information
// @desc get short information of account
// @access Private
// router.get('/send-mailer', verifyToken, accountController.sendMailer);

// @route GET api/account/password
// @desc get password
// @access Private
router.get('/password', verifyToken, accountController.getPassword);

// @route GET api/account/password/send-verify-code
// @desc get verify code
// @access Private
router.get('/password/send-verify-code', verifyToken, accountController.sendVerifyCode);


// @route GET api/account/full-information
// @desc get full information of account
// @access Private
router.get('/full-information', verifyToken, accountController.getFullInformation);


// ================= PUT ==================

// @route PUT api/account/password
// @desc update password
// @access Private
router.put('/password', verifyToken, accountController.updatePassword);



// @route PUT api/account/id
// @desc get short information of account
// @access Private
router.put('/:id', verifyToken, accountController.updateInformation);




module.exports = router;