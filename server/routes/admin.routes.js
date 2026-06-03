const express = require("express");
const controller = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const {
  updateSubmissionViewsSchema,
  syncSubmissionSchema,
} = require("../validators/admin.validator");

const router = express.Router();

router.use(auth, authorize("admin"));

router.get("/users", catchAsync(controller.getUsers));
router.get("/campaigns", catchAsync(controller.getCampaigns));
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

module.exports = router;
