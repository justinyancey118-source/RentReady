
const mongoose = require("mongoose");

const rentalBookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Customer email cannot exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    rentalType: {
      type: String,
      required: [true, "Rental type is required"],
      enum: ["equipment", "dumpster"],
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalProduct",
      required: [true, "A rental product is required"],
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalPackage",
      required: [true, "A rental package is required"],
    },

    // Preserve the selected package terms for historical accuracy.
    packageSnapshot: {
      durationType: {
        type: String,
        required: true,
        enum: ["hour", "day", "week", "month"],
      },
      durationValue: {
        type: Number,
        required: true,
        min: 1,
        validate: {
          validator: Number.isInteger,
          message: "Rental duration must be a whole number",
        },
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      includedDays: {
        type: Number,
        min: 0,
      },
      extraDayPrice: {
        type: Number,
        min: 0,
      },
    },

    // Equipment: calculated rental start and end.
    // Dumpster: delivery and pickup timestamps.
    startDate: {
      type: Date,
      required: [true, "Rental start or delivery date is required"],
      validate: {
        validator: (value) => !Number.isNaN(value.getTime()),
        message: "Please provide a valid start date",
      },
    },

    endDate: {
      type: Date,
      required: [true, "Rental end or pickup date is required"],
      validate: {
        validator: function (value) {
          return (
            value instanceof Date &&
            !Number.isNaN(value.getTime()) &&
            this.startDate instanceof Date &&
            value >= this.startDate &&
            (this.rentalType === "dumpster" || value > this.startDate)
          );
        },
        message:
          "End date must be after the start date for equipment and cannot be before it for dumpsters",
      },
    },

    // Calculated by the server, not trusted from the browser.
    billableDays: {
      type: Number,
      min: [1, "Billable days must be at least one"],
      validate: {
        validator: Number.isInteger,
        message: "Billable days must be a whole number",
      },
    },

    // Rental price before delivery and administrator-set charges.
    rentalSubtotal: {
      type: Number,
      min: [0, "Rental subtotal cannot be negative"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      required: true,
    },

    deliveryFee: {
      type: Number,
      min: [0, "Delivery fee cannot be negative"],
      default: 0,
    },

    additionalCharges: {
      type: Number,
      min: [0, "Additional charges cannot be negative"],
      default: 0,
    },

    finalTotal: {
      type: Number,
      min: [0, "Final total cannot be negative"],
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
      default: "",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

rentalBookingSchema.index({ customerEmail: 1, createdAt: -1 });
rentalBookingSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("RentalBooking", rentalBookingSchema);
