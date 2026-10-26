
const express = require("express");

const {
  recommendRentals,
} = require("../controllers/recommendationController");

const {
  requireCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.post("/", requireCustomer, recommendRentals);

module.exports = router;
