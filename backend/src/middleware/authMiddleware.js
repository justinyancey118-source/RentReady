
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AdminUser = require("../models/AdminUser");

async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        message: "Invalid authentication credentials.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "rentready-api",
      audience: "rentready-admin",
      algorithms: ["HS256"],
    });

    if (
      decoded.role !== "admin" ||
      typeof decoded.sub !== "string" ||
      !mongoose.isValidObjectId(decoded.sub)
    ) {
      return res.status(403).json({
        message: "Administrator access required.",
      });
    }

    const admin = await AdminUser.findById(decoded.sub).select("_id email role");

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({
        message: "Administrator account is no longer valid.",
      });
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Admin authentication failed:", error.message);

    return res.status(500).json({
      message: "Unable to verify authentication.",
    });
  }
}

module.exports = { requireAdmin };
