const mongoose = require("mongoose");

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(", "),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate resource detected",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports = errorHandler;
