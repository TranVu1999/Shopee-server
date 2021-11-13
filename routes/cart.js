const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const cartController = require("../controllers/cart");

// ================= POST ==================

// @route POST api/cart
// @desc add cart
// @access Private
router.post("/", verifyToken, cartController.add);


// ================= PUT ==================

// @route PUT api/cart/:id
// @desc update cart
// @access Private
router.put("/:id", verifyToken, cartController.update);


// ================= GET ==================

// @route GET api/cart
// @desc get list product
// @access Private
router.get("/", verifyToken, cartController.get);


// ================= DELETE ==================

// @route DELETE api/cart/:id
// @desc remove cart
// @access Private
router.delete("/:id", verifyToken, cartController.remove);

module.exports = router;
