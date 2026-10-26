
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const RentalProduct = require("../models/RentalProduct");
const RentalPackage = require("../models/RentalPackage");

async function inspectTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.\n");

    const testProduct = await RentalProduct.findOne({
      name: "RentReady Test Generator",
    }).lean();

    if (!testProduct) {
      console.log("Temporary test product was not found.");
      return;
    }

    console.log("TEMPORARY TEST PRODUCT:");
    console.log(JSON.stringify(testProduct, null, 2));

    const testPackages = await RentalPackage.find({
      productId: testProduct._id,
    }).lean();

    console.log("\nPACKAGES LINKED TO THIS TEST PRODUCT:");
    console.log(JSON.stringify(testPackages, null, 2));

    console.log("\nNo records were changed or deleted.");
  } catch (error) {
    console.error("Inspection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

inspectTestData();
