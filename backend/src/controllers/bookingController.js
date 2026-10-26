
const mongoose = require("mongoose");
const RentalBooking = require("../models/RentalBooking");
const RentalProduct = require("../models/RentalProduct");
const RentalPackage = require("../models/RentalPackage");

// Parse a date-only value such as "2026-06-01" as UTC.
function parseDateOnly(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  // Reject impossible dates, such as February 30.
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

// Add the selected package duration to an equipment start date.
function calculateEquipmentEndDate(startDate, rentalPackage) {
  const endDate = new Date(startDate);
  const { durationType, durationValue } = rentalPackage;

  switch (durationType) {
    case "hour":
      endDate.setTime(
        endDate.getTime() + durationValue * 60 * 60 * 1000
      );
      break;

    case "day":
      endDate.setUTCDate(endDate.getUTCDate() + durationValue);
      break;

    case "week":
      endDate.setUTCDate(
        endDate.getUTCDate() + durationValue * 7
      );
      break;

    case "month": {
      // Clamp to the last day of the target month when needed.
      const originalDay = endDate.getUTCDate();
      endDate.setUTCDate(1);
      endDate.setUTCMonth(
        endDate.getUTCMonth() + durationValue
      );

      const lastDay = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth() + 1,
          0
        )
      ).getUTCDate();

      endDate.setUTCDate(Math.min(originalDay, lastDay));
      break;
    }

    default:
      throw new Error("Unsupported equipment rental duration.");
  }

  return endDate;
}

// POST /api/bookings
async function createBooking(req, res) {
  try {
const {
  productId,
  packageId,
  startDate,
  endDate,
} = req.body || {};

const customerName = req.customer.name;
const customerEmail = req.customer.email;

    // 1. Validate required fields.
    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerEmail !== "string" ||
      !customerEmail.trim() ||
      !productId ||
      !packageId ||
      !startDate
    ) {
      return res.status(400).json({
        message:
          "Customer name, email, product, package, and start date are required.",
      });
    }

    if (
      !mongoose.isValidObjectId(productId) ||
      !mongoose.isValidObjectId(packageId)
    ) {
      return res.status(400).json({
        message: "The selected product or package ID is invalid.",
      });
    }

    // 2. Load the active product and its matching active package.
    const product = await RentalProduct.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message:
          "The selected rental product was not found or is inactive.",
      });
    }

    const rentalPackage = await RentalPackage.findOne({
      _id: packageId,
      productId: product._id,
      isActive: true,
    });

    if (!rentalPackage) {
      return res.status(400).json({
        message: "The selected package is invalid for this product.",
      });
    }

    // 3. Calculate dates and price on the server.
    let bookingStart;
    let bookingEnd;
    let billableDays;
    let rentalSubtotal;

    if (product.category === "dumpster") {
      // Dumpster requests use calendar dates: YYYY-MM-DD.
      bookingStart = parseDateOnly(startDate);
      bookingEnd = parseDateOnly(endDate);

      if (!bookingStart || !bookingEnd) {
        return res.status(400).json({
          message:
            "Dumpster delivery and pickup dates must be valid dates in YYYY-MM-DD format.",
        });
      }

      if (bookingEnd < bookingStart) {
        return res.status(400).json({
          message: "Pickup date cannot be before delivery date.",
        });
      }

      // Same-day delivery and pickup count as one billable day.
      const elapsedDays = Math.round(
        (bookingEnd.getTime() - bookingStart.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      billableDays = Math.max(1, elapsedDays);

      const includedDays =
        rentalPackage.includedDays ?? rentalPackage.durationValue;

      const extraDayPrice = rentalPackage.extraDayPrice ?? 0;

      const extraDays = Math.max(0, billableDays - includedDays);

      rentalSubtotal =
        rentalPackage.price + extraDays * extraDayPrice;
    } else if (product.category === "equipment") {
      if (endDate) {
        return res.status(400).json({
          message:
            "Equipment end dates are calculated from the selected rental package. Please submit only the start date and time.",
        });
      }

      // Equipment requires a valid start date/time.
      if (
        typeof startDate !== "string" ||
        !/(Z|[+-]\d{2}:\d{2})$/.test(startDate)
      ) {
        return res.status(400).json({
          message:
            "Equipment start date/time must include a timezone, such as Z or -07:00.",
        });
      }

      bookingStart = new Date(startDate);

      if (Number.isNaN(bookingStart.getTime())) {
        return res.status(400).json({
          message: "Please provide a valid equipment start date/time.",
        });
      }

      bookingEnd = calculateEquipmentEndDate(
        bookingStart,
        rentalPackage
      );

      if (bookingEnd <= bookingStart) {
        return res.status(400).json({
          message: "The calculated equipment end date is invalid.",
        });
      }

      rentalSubtotal = rentalPackage.price;
    } else {
      return res.status(400).json({
        message: "The selected product has an unsupported rental category.",
      });
    }

    // 4. Save only server-calculated and validated booking details.
    const booking = new RentalBooking({
      customerId: req.customer.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      rentalType: product.category,
      productId: product._id,
      packageId: rentalPackage._id,

      // Preserve the agreed package terms if catalog prices change later.
      packageSnapshot: {
        durationType: rentalPackage.durationType,
        durationValue: rentalPackage.durationValue,
        unitPrice: rentalPackage.price,
        includedDays: rentalPackage.includedDays,
        extraDayPrice: rentalPackage.extraDayPrice,
      },

      startDate: bookingStart,
      endDate: bookingEnd,
      ...(billableDays !== undefined && { billableDays }),
      rentalSubtotal,

      // A request is not approved and does not reserve inventory.
      status: "pending",
      deliveryFee: 0,
      additionalCharges: 0,
    });

    await booking.save();

    // 5. Return the saved request.
    return res.status(201).json({
      message:
        "Rental request submitted successfully. It is pending review and is not yet approved.",
      booking: {
        id: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        rentalType: booking.rentalType,
        product: product.name,
        package: {
          durationType: rentalPackage.durationType,
          durationValue: rentalPackage.durationValue,
          unitPrice: rentalPackage.price,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        billableDays: booking.billableDays,
        rentalSubtotal: booking.rentalSubtotal,
        status: booking.status,
      },
    });
  } catch (error) {
    // Invalid data that fails Mongoose validation.
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "The booking contains invalid information.",
        errors: Object.values(error.errors || {}).map(
          (item) => item.message
        ),
      });
    }

    console.error("Failed to create booking:", error.message);

    return res.status(500).json({
      message: "Unable to process the booking request.",
    });
  }
}


async function getAdminBookings(req, res) {
  try {
    const bookings = await RentalBooking.find()
      .populate("productId", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings retrieved successfully.",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Failed to retrieve admin bookings:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve bookings.",
    });
  }
}
module.exports = {
  createBooking,
  getAdminBookings,
};