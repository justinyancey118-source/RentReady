
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "RentReady API is running",
  });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`RentReady API running on http://localhost:${PORT}`);
  });
}

startServer();
