
const mongoose = require("mongoose");

const rentalPackageSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalProduct",
      required: [true, "A rental product is required"],
    },

    durationType: {
      type: String,
      required: [true, "Rental duration type is required"],
      enum: ["hour", "day", "week", "month"],
    },

    durationValue: {
      type: Number,
      required: [true, "Rental duration is required"],
      min: [1, "Rental duration must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Rental duration must be a whole number",
      },
    },

    price: {
      type: Number,
      required: [true, "Rental package price is required"],
      min: [0, "Rental price cannot be negative"],
    },

    includedDays: {
      type: Number,
      min: [0, "Included days cannot be negative"],
    },

    extraDayPrice: {
      type: Number,
      min: [0, "Extra day price cannot be negative"],
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

// Prevent duplicate active or inactive packages with the same
// product and duration.
rentalPackageSchema.index(
  {
    productId: 1,
    durationType: 1,
    durationValue: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "RentalPackage",
  rentalPackageSchema
);
