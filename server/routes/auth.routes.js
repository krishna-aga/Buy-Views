const express = require("express");
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validate(registerSchema), catchAsync(authController.register));
router.post("/login", validate(loginSchema), catchAsync(authController.login));
router.get("/me", auth, catchAsync(authController.me));

module.exports = router;
