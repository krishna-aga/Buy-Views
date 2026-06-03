const express = require("express");
const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const morgan = require("morgan");
const campaignRoutes = require("./routes/campaign.routes");
const submissionRoutes = require("./routes/submission.routes");
const walletRoutes = require("./routes/wallet.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");
const adminRoutes = require("./routes/admin.routes");
const errorHandler = require("./middleware/errorHandler");

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
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/admin", adminRoutes);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);



module.exports = app;
