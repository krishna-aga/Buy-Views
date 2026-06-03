const express = require("express");
const controller = require("../controllers/wallet.controller");
const auth = require("../middleware/auth");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.get("/", auth, catchAsync(controller.getWallet));

module.exports = router;
