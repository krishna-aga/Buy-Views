const express = require("express");
const jwt = require("jsonwebtoken");
const controller = require("../controllers/youtube.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

const authFromHeaderOrQuery = async (req, res, next) => {
  if (!req.query.token) {
    return auth(req, res, next);
  }

  try {
    const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    req.user = user;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

router.get("/connect", authFromHeaderOrQuery, authorize("promoter"), catchAsync(controller.connectYoutube));
router.get("/callback", catchAsync(controller.youtubeCallback));

module.exports = router;
