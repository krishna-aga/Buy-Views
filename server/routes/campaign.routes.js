const express = require("express");
const controller = require("../controllers/campaign.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdSchema,
} = require("../validators/campaign.validator");

const router = express.Router();

router.use(auth);

router.post(
  "/",
  authorize("creator"),
  validate(createCampaignSchema),
  catchAsync(controller.createCampaign)
);
router.get("/", catchAsync(controller.getCampaigns));
router.get("/my", authorize("creator"), catchAsync(controller.getMyCampaigns));
router.get("/:id", validate(campaignIdSchema), catchAsync(controller.getCampaignById));
router.put(
  "/:id",
  authorize("creator"),
  validate(updateCampaignSchema),
  catchAsync(controller.updateCampaign)
);
router.delete(
  "/:id",
  authorize("creator"),
  validate(campaignIdSchema),
  catchAsync(controller.deleteCampaign)
);

module.exports = router;
