
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env."
      );
    }

    if (password.length < 16) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 16 characters."
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("ADMIN_EMAIL must be a valid email address.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    const existingAdmin = await AdminUser.findOne({ email });

    if (existingAdmin) {
      console.log("An admin account with this email already exists.");
      console.log("No account changes were made.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await AdminUser.create({
      email,
      passwordHash,
      role: "admin",
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${email}`);
    console.log("Password stored as a bcrypt hash.");
  } catch (error) {
    if (error.code === 11000) {
      console.error("An admin account with this email already exists.");
    } else {
      console.error("Admin provisioning failed:", error.message);
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
