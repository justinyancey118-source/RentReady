
const mongoose = require("mongoose");
const RentalBooking = require("../models/RentalBooking");

// GET /api/bookings/my
// Return bookings belonging to the authenticated customer.
async function getMyBookings(req, res) {
  try {
    const bookings = await RentalBooking.find({
      customerId: req.customer.id,
    })
      .select("-adminNotes")
      .populate("productId", "name category")
      .populate(
        "packageId",
        "durationType durationValue price"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get customer bookings error:", error.message);

    return res.status(500).json({
      message: "Unable to load your rental bookings.",
    });
  }
}

// PATCH /api/bookings/my/:bookingId/cancel
// Customers can only cancel their own pending bookings.
async function cancelMyBooking(req, res) {
  try {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await RentalBooking.findOneAndUpdate(
      {
        _id: bookingId,
        customerId: req.customer.id,
        status: "pending",
      },
      {
        $set: {
          status: "cancelled",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        message:
          "Pending booking not found, or you cannot cancel this booking.",
      });
    }

    return res.status(200).json({
      message: "Your rental request was cancelled.",
      booking,
    });
  } catch (error) {
    console.error("Cancel customer booking error:", error.message);

    return res.status(500).json({
      message: "Unable to cancel rental request.",
    });
  }
}

module.exports = {
  getMyBookings,
  cancelMyBooking,
};
