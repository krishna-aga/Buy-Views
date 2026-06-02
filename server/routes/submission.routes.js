const express = require("express");
const controller = require("../controllers/submission.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const { createSubmissionSchema } = require("../validators/submission.validator");

const router = express.Router();

router.use(auth, authorize("promoter"));

router.post("/", validate(createSubmissionSchema), catchAsync(controller.createSubmission));
router.get("/my", catchAsync(controller.getMySubmissions));

module.exports = router;
