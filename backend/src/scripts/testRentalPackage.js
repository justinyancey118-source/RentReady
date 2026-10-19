
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const RentalProduct = require("../models/RentalProduct");
const RentalPackage = require("../models/RentalPackage");

async function testRentalPackage() {
  try {
    await connectDB();

    // Find the test product created earlier.
    const product = await RentalProduct.findOne({
      name: "RentReady Test Generator",
    });

    if (!product) {
      throw new Error("Test product not found in MongoDB.");
    }

    // Save a sample one-day package.
    const rentalPackage = await RentalPackage.findOneAndUpdate(
      {
        productId: product._id,
        durationType: "day",
        durationValue: 1,
      },
      {
        productId: product._id,
        durationType: "day",
        durationValue: 1,
        price: 58,
        isActive: true,
      },
      {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      }
    );

    console.log("Package saved successfully:");
    console.log({
      product: product.name,
      duration: `${rentalPackage.durationValue} ${rentalPackage.durationType}`,
      price: rentalPackage.price,
    });

    // Check that the schema rejects a negative price.
    const invalidPackage = new RentalPackage({
      productId: product._id,
      durationType: "day",
      durationValue: 1,
      price: -10,
    });

    try {
      await invalidPackage.validate();
      throw new Error("Validation test failed: negative price was accepted.");
    } catch (error) {
      if (error.name !== "ValidationError") {
        throw error;
      }

      console.log("Validation test passed: negative price rejected.");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testRentalPackage();
