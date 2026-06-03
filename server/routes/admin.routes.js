const express = require("express");
const controller = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const {
  updateSubmissionViewsSchema,
  syncSubmissionSchema,
  withdrawalActionSchema,
} = require("../validators/admin.validator");

const router = express.Router();

router.use(auth, authorize("admin"));

router.get("/users", catchAsync(controller.getUsers));
router.get("/campaigns", catchAsync(controller.getCampaigns));
router.get("/withdrawals", catchAsync(controller.getWithdrawals));
router.put(
  "/submissions/:id/views",
  validate(updateSubmissionViewsSchema),
  catchAsync(controller.updateSubmissionViews)
);
router.post(
  "/submissions/:id/sync",
  validate(syncSubmissionSchema),
  catchAsync(controller.syncSubmissionViews)
);
router.put(
  "/withdrawals/:id/approve",
  validate(withdrawalActionSchema),
  catchAsync(controller.approveWithdrawal)
);
router.put(
  "/withdrawals/:id/reject",
  validate(withdrawalActionSchema),
  catchAsync(controller.rejectWithdrawal)
);

module.exports = router;
