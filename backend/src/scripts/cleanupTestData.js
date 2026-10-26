
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const RentalProduct = require("../models/RentalProduct");
const RentalPackage = require("../models/RentalPackage");

const TEST_PRODUCT_ID = "6ad6596d8da4624caf7d8cd8";
const TEST_PACKAGE_ID = "6ad6879a8da4624caf7d8d62";
const TEST_PRODUCT_NAME = "RentReady Test Generator";

async function cleanupTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Verify the exact product before making changes.
    const product = await RentalProduct.findOne({
      _id: TEST_PRODUCT_ID,
      name: TEST_PRODUCT_NAME,
    });

    if (!product) {
      throw new Error(
        "Safety check failed: the exact test product was not found. Nothing deleted."
      );
    }

    // Confirm the only linked package is the approved test package.
    const linkedPackages = await RentalPackage.find({
      productId: TEST_PRODUCT_ID,
    }).select("_id");

    if (
      linkedPackages.length !== 1 ||
      linkedPackages[0]._id.toString() !== TEST_PACKAGE_ID
    ) {
      throw new Error(
        "Safety check failed: linked packages differ from inspection. Nothing deleted."
      );
    }

    // Verify the package ID and its product relationship.
    const testPackage = await RentalPackage.findOne({
      _id: TEST_PACKAGE_ID,
      productId: TEST_PRODUCT_ID,
    });

    if (!testPackage) {
      throw new Error(
        "Safety check failed: the exact test package was not found. Nothing deleted."
      );
    }

    console.log("Safety checks passed.");
    console.log("Deleting approved test package...");

    const packageResult = await RentalPackage.deleteOne({
      _id: TEST_PACKAGE_ID,
      productId: TEST_PRODUCT_ID,
    });

    if (packageResult.deletedCount !== 1) {
      throw new Error("Expected exactly one package deletion.");
    }

    console.log("Deleted the approved test package.");

    const productResult = await RentalProduct.deleteOne({
      _id: TEST_PRODUCT_ID,
      name: TEST_PRODUCT_NAME,
    });

    if (productResult.deletedCount !== 1) {
      throw new Error("Expected exactly one product deletion.");
    }

    console.log("Deleted the approved test product.");

    // Verify database counts after cleanup.
    const productCount = await RentalProduct.countDocuments();
    const packageCount = await RentalPackage.countDocuments({
      isActive: true,
    });

    console.log("\nCleanup completed.");
    console.log(`Remaining products: ${productCount}`);
    console.log(`Remaining active packages: ${packageCount}`);

    if (productCount !== 10 || packageCount !== 30) {
      console.error(
        "WARNING: Counts differ from the expected 10 products and 30 active packages."
      );
      process.exitCode = 1;
    } else {
      console.log("PASS: Expected catalog counts verified.");
    }
  } catch (error) {
    console.error("Cleanup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

cleanupTestData();
