const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const invoiceController = require('../controllers/invoice')

// ================= POST ==================

// @route POST api/invoice/confirm
// @desc verify invoice
// @access Private
router.post('/confirm', verifyToken, invoiceController.verify);


// @route POST api/invoice
// @desc add new invoice
// @access Private
router.post('/', verifyToken, invoiceController.add);








module.exports = router;