const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

// ================= POST ==================

// @route POST api/auth/login
// @desc login for account
// @access Public
router.post('/login', authController.login);

// @route POST api/auth/create
// @desc login for account
// @access Public
router.post('/create', authController.createNewAccount);


// @route POST api/auth/register
// @desc register for account
// @access Public
router.post('/register', authController.register);


module.exports = router;