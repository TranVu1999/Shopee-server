const express = require('express');
const router = express.Router();
const administrativeUnitController = require('../controllers/administrative_unit')

// ================= GET ==================

// @route GET api/administrative-unit/province
// @desc Get all province
// @access Public
router.get('/province', administrativeUnitController.getListProvince);

// @route GET api/administrative-unit/district/:provinceCode
// @desc Get list district
// @access Public
router.get('/district/:provinceCode', administrativeUnitController.getListDistrict);


// @route GET api/administrative-unit/ward/:districtCode
// @desc Get list district
// @access Public
router.get('/ward/:districtCode', administrativeUnitController.getListWard);





module.exports = router;