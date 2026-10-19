
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const RentalProduct = require("../models/RentalProduct");

async function testRentalProduct() {
  try {
    // Connect to MongoDB Atlas.
    await connectDB();

    // Create or update one sample product.
    const product = await RentalProduct.findOneAndUpdate(
      { name: "RentReady Test Generator" },
      {
        name: "RentReady Test Generator",
        category: "equipment",
        description: "A sample generator used to test the database.",
        inventoryQuantity: 2,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("Product saved successfully:");
    console.log(product);

    // Read the saved product back from MongoDB.
    const savedProduct = await RentalProduct.findById(product._id);

    console.log("Product retrieved successfully:");
    console.log(savedProduct.name);

  } catch (error) {
    console.error("Test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testRentalProduct();

