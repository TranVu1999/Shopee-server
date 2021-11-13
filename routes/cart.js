const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const cartController = require("../controllers/cart");

// ================= POST ==================

// @route POST api/cart
// @desc add cart
// @access Private
router.post("/", verifyToken, cartController.add);


// ================= PUR ==================

// @route PUR api/cart/:id
// @desc update cart
// @access Private
router.put("/:id", verifyToken, cartController.update);


// ================= GET ==================

// @route GET api/cart
// @desc get list product
// @access Private
router.get("/", verifyToken, cartController.get);

module.exports = router;
