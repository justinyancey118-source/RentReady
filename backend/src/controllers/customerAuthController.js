
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomerUser = require("../models/CustomerUser");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createCustomerToken(customer) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { role: "customer" },
    process.env.JWT_SECRET,
    {
      subject: customer._id.toString(),
      issuer: "rentready-api",
      audience: "rentready-customer",
      expiresIn: "2h",
      algorithm: "HS256",
    }
  );
}

function publicCustomer(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    role: customer.role,
  };
}

async function registerCustomer(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    if (
      cleanEmail.length > 254 ||
      !EMAIL_PATTERN.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (
      password.length < 12 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Password must contain between 12 and 128 characters.",
      });
    }

    const existingCustomer = await CustomerUser.findOne({
      email: cleanEmail,
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await CustomerUser.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    const token = createCustomerToken(customer);

    return res.status(201).json({
      message: "Customer account created successfully.",
      token,
      customer: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Customer registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create customer account.",
    });
  }
}

async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const customer = await CustomerUser.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    }).select("+passwordHash");

    if (
      !customer ||
      !(await customer.comparePassword(password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createCustomerToken(customer);

    return res.json({
      message: "Customer login successful.",
      token,
      customer: publicCustomer(customer),
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
};
