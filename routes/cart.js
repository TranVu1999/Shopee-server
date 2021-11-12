const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const cartController = require("../controllers/cart");

// ================= POST ==================

// @route POST api/cart
// @desc update cart
// @access Private
router.post("/", verifyToken, cartController.add);


// ================= GET ==================

// @route GET api/cart
// @desc get list product
// @access Private
router.get("/", verifyToken, cartController.get);

module.exports = router;
