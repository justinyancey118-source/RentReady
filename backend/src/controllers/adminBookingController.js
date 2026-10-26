
const mongoose = require("mongoose");
const RentalBooking = require("../models/RentalBooking");
const RentalProduct = require("../models/RentalProduct");

const validStatuses = ["pending", "approved", "rejected", "cancelled"];

function validMoney(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Math.round(value * 100) === value * 100
  );
}

function money(value) {
  return Math.round(value * 100) / 100;
}

function validId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

async function getAdminBookings(req, res) {
  try {
    const { status } = req.query;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter." });
    }

    const filter = status ? { status } : {};

    const bookings = await RentalBooking.find(filter)
      .populate("productId", "name category inventoryQuantity")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      message: "Bookings retrieved successfully.",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Admin booking list error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve bookings." });
  }
}

async function rejectBooking(req, res) {
  try {
    const { bookingId } = req.params;

    if (!validId(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const { reason = "" } = req.body || {};

    if (typeof reason !== "string" || reason.trim().length > 1000) {
      return res.status(400).json({
        message: "Reason must be text of 1000 characters or fewer.",
      });
    }

    const booking = await RentalBooking.findOneAndUpdate(
      { _id: bookingId, status: "pending" },
      {
        $set: {
          status: "rejected",
          adminNotes: reason.trim(),
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      const exists = await RentalBooking.exists({ _id: bookingId });

      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Only pending bookings can be rejected."
          : "Booking not found.",
      });
    }

    return res.json({
      message: "Booking rejected successfully.",
      booking,
    });
  } catch (error) {
    console.error("Reject booking error:", error.message);
    return res.status(500).json({ message: "Unable to reject booking." });
  }
}

async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.params;

    if (!validId(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const { reason = "" } = req.body || {};

    if (typeof reason !== "string" || reason.trim().length > 1000) {
      return res.status(400).json({
        message: "Reason must be text of 1000 characters or fewer.",
      });
    }

    const booking = await RentalBooking.findOneAndUpdate(
      {
        _id: bookingId,
        status: { $in: ["pending", "approved"] },
      },
      {
        $set: {
          status: "cancelled",
          adminNotes: reason.trim(),
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      const exists = await RentalBooking.exists({ _id: bookingId });

      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "This booking cannot be cancelled."
          : "Booking not found.",
      });
    }

    return res.json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    return res.status(500).json({ message: "Unable to cancel booking." });
  }
}

async function approveBooking(req, res) {
  const { bookingId } = req.params;

  if (!validId(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  const {
    deliveryFee,
    additionalCharges = 0,
    adminNotes = "",
  } = req.body || {};

  if (!validMoney(deliveryFee) || !validMoney(additionalCharges)) {
    return res.status(400).json({
      message: "Enter valid nonnegative delivery and additional charges.",
    });
  }

  if (typeof adminNotes !== "string" || adminNotes.trim().length > 1000) {
    return res.status(400).json({
      message: "Admin notes must be text of 1000 characters or fewer.",
    });
  }

  // A transaction plus a write to the product document serializes
  // competing approvals for the same product.
  for (let attempt = 0; attempt < 3; attempt++) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        const booking = await RentalBooking.findById(bookingId)
          .session(session);

        if (!booking) {
          result = { status: 404, message: "Booking not found." };
          return;
        }

        if (booking.status !== "pending") {
          result = {
            status: 409,
            message: "Only pending bookings can be approved.",
          };
          return;
        }

        // Write-lock the product for concurrent approval safety.
        const product = await RentalProduct.findOneAndUpdate(
          { _id: booking.productId, isActive: true },
          { $currentDate: { updatedAt: true } },
          { new: true, session }
        );

        if (!product) {
          result = {
            status: 409,
            message: "This rental product is no longer active.",
          };
          return;
        }

        const capacity = product.inventoryQuantity;

        if (!Number.isInteger(capacity) || capacity < 1) {
          result = {
            status: 409,
            message: "No inventory is available for this product.",
          };
          return;
        }

        const overlapping = await RentalBooking.countDocuments({
          _id: { $ne: booking._id },
          productId: booking.productId,
          status: "approved",
          startDate: { $lt: booking.endDate },
          endDate: { $gt: booking.startDate },
        }).session(session);

        if (overlapping >= capacity) {
          result = {
            status: 409,
            message: "Inventory is unavailable for the requested dates.",
          };
          return;
        }

        const subtotal = booking.rentalSubtotal;

        if (!validMoney(subtotal)) {
          result = {
            status: 409,
            message: "Booking subtotal is invalid.",
          };
          return;
        }

        booking.status = "approved";
        booking.deliveryFee = money(deliveryFee);
        booking.additionalCharges = money(additionalCharges);
        booking.finalTotal = money(
          subtotal + deliveryFee + additionalCharges
        );
        booking.adminNotes = adminNotes.trim();
        booking.reviewedAt = new Date();

        await booking.save({ session });

        result = {
          status: 200,
          message: "Booking approved successfully.",
          booking,
        };
      });

      return res.status(result.status).json({
        message: result.message,
        ...(result.booking ? { booking: result.booking } : {}),
      });
    } catch (error) {
      const retryable =
        error.hasErrorLabel?.("TransientTransactionError") ||
        error.code === 112;

      if (retryable && attempt < 2) {
        continue;
      }

      console.error("Approve booking error:", error.message);

      return res.status(retryable ? 409 : 500).json({
        message: retryable
          ? "Booking approval conflicted with another update. Please retry."
          : "Unable to approve booking.",
      });
    } finally {
      await session.endSession();
    }
  }
}

module.exports = {
  getAdminBookings,
  rejectBooking,
  cancelBooking,
  approveBooking,
};
