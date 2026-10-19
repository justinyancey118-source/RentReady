
const express = require("express");
const RentalProduct = require("../models/RentalProduct");

const router = express.Router();

// GET /api/products
// Return all active rental products.
router.get("/", async (req, res) => {
  try {
    const products = await RentalProduct.find({ isActive: true })
      .sort({ name: 1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Failed to retrieve products:", error.message);

    res.status(500).json({
      message: "Unable to retrieve rental products.",
    });
  }
});

module.exports = router;
