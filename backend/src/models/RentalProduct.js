
const mongoose = require("mongoose");

const rentalProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["equipment", "dumpster"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    inventoryQuantity: {
      type: Number,
      required: true,
      min: [0, "Inventory cannot be negative"],
      default: 1,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    sourceUrl: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RentalProduct",
  rentalProductSchema
);
