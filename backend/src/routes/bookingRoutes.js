
const express = require("express");

const {
  createBooking,
} = require("../controllers/bookingController");

const {
  getAdminBookings,
  rejectBooking,
  cancelBooking,
  approveBooking,
} = require("../controllers/adminBookingController");

const {
  getMyBookings,
  cancelMyBooking,
} = require("../controllers/customerBookingController");

const {
  requireAdmin,
} = require("../middleware/authMiddleware");

const {
  requireCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// Existing rental request endpoint.
// We'll connect customer authentication to this next.
router.post("/", requireCustomer, createBooking);

// Customer-only endpoints.
router.get("/my", requireCustomer, getMyBookings);

router.patch(
  "/my/:bookingId/cancel",
  requireCustomer,
  cancelMyBooking
);

// Admin-only endpoints.
router.get("/admin", requireAdmin, getAdminBookings);

router.patch(
  "/admin/:bookingId/approve",
  requireAdmin,
  approveBooking
);

router.patch(
  "/admin/:bookingId/reject",
  requireAdmin,
  rejectBooking
);

router.patch(
  "/admin/:bookingId/cancel",
  requireAdmin,
  cancelBooking
);

module.exports = router;
