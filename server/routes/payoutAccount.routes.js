const express = require("express");
const controller = require("../controllers/payoutAccount.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const { payoutAccountSchema } = require("../validators/payoutAccount.validator");

const router = express.Router();

router.use(auth, authorize("promoter"));

router.get("/", catchAsync(controller.getMyPayoutAccount));
router.put("/", validate(payoutAccountSchema), catchAsync(controller.saveMyPayoutAccount));

module.exports = router;
