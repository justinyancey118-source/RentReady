
const express = require("express");
const RentalPackage = require("../models/RentalPackage");

const router = express.Router();

// GET /api/packages
router.get("/", async (req, res) => {
  try {
    const packages = await RentalPackage.find({ isActive: true })
      .populate("productId", "name category")
      .sort({ price: 1 });

    res.status(200).json({
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error("Failed to retrieve rental packages:", error.message);

    res.status(500).json({
      message: "Unable to retrieve rental packages.",
    });
  }
});

module.exports = router;
