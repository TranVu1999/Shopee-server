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


// ================= GET ==================
// @route GET api/invoice/management
// @desc Get uer's invoice
// @access Private
router.get('/management', verifyToken, invoiceController.getListInvoiceByShop);

// @route GET api/invoice
// @desc Get uer's invoice
// @access Private
router.get('/', verifyToken, invoiceController.get);

// @route GET api/invoice/id
// @desc Get invoice detail
// @access Private
router.get('/:id', verifyToken, invoiceController.getDetail);











module.exports = router;