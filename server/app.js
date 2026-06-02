const express = require("express");
const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const morgan = require("morgan");


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Buy Views backend is running",
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;
