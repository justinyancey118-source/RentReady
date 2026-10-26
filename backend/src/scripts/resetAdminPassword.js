
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");

async function resetAdminPassword() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env."
      );
    }

    if (password.length < 16) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 16 characters."
      );
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    const admin = await AdminUser.findOne({ email });

    if (!admin) {
      throw new Error(
        "No admin account matches ADMIN_EMAIL. No password was changed."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    admin.passwordHash = passwordHash;
    await admin.save();

    console.log("Admin password hash updated successfully.");
    console.log("The password itself was not displayed.");
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

resetAdminPassword();
