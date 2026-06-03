const express = require("express");
const controller = require("../controllers/adminWithdrawal.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const {
  approveWithdrawalSchema,
  rejectWithdrawalSchema,
} = require("../validators/withdrawal.validator");

const router = express.Router();

router.use(auth, authorize("admin"));

router.get("/", catchAsync(controller.getWithdrawals));
router.put(
  "/:id/approve",
  validate(approveWithdrawalSchema),
  catchAsync(controller.approveWithdrawal)
);
router.put(
  "/:id/reject",
  validate(rejectWithdrawalSchema),
  catchAsync(controller.rejectWithdrawal)
);

module.exports = router;
