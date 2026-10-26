
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const CustomerUser = require("../models/CustomerUser");

async function requireCustomer(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Customer authentication required.",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        message: "Invalid authentication credentials.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "rentready-api",
      audience: "rentready-customer",
      algorithms: ["HS256"],
    });

    if (
      decoded.role !== "customer" ||
      typeof decoded.sub !== "string" ||
      !mongoose.isValidObjectId(decoded.sub)
    ) {
      return res.status(403).json({
        message: "Customer access required.",
      });
    }

    const customer = await CustomerUser.findById(
      decoded.sub
    ).select("_id name email role isActive");

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        message: "Customer account is no longer active.",
      });
    }

    req.customer = {
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      role: customer.role,
    };

    return next();
  } catch (error) {
    if (
      ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"]
        .includes(error.name)
    ) {
      return res.status(401).json({
        message: "Invalid or expired customer token.",
      });
    }

    console.error("Customer authentication error:", error.message);

    return res.status(500).json({
      message: "Unable to verify customer authentication.",
    });
  }
}

module.exports = { requireCustomer };
