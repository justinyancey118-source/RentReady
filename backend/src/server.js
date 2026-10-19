
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

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
