const express = require("express");
const controller = require("../controllers/youtube.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.get("/connect", auth, authorize("promoter"), catchAsync(controller.connectYoutube));
router.get("/callback", catchAsync(controller.youtubeCallback));

module.exports = router;
