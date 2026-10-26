
const express = require("express");

const {
  loginAdmin,
} = require("../controllers/authController");

const {
  registerCustomer,
  loginCustomer,
} = require("../controllers/customerAuthController");

const {
  requireCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// Existing admin login — unchanged.
router.post("/login", loginAdmin);

// Customer registration and login.
router.post("/customer/register", registerCustomer);
router.post("/customer/login", loginCustomer);

// Protected customer account endpoint.
router.get("/customer/me", requireCustomer, (req, res) => {
  return res.json({
    customer: req.customer,
  });
});

module.exports = router;
