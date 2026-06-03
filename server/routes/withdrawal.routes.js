const express = require("express");
const controller = require("../controllers/withdrawal.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const { createWithdrawalSchema } = require("../validators/withdrawal.validator");

const router = express.Router();

router.use(auth, authorize("promoter"));

router.post("/", validate(createWithdrawalSchema), catchAsync(controller.createWithdrawal));
router.get("/my", catchAsync(controller.getMyWithdrawals));

module.exports = router;
