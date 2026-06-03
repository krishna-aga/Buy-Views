const express = require("express");
const controller = require("../controllers/wallet.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const catchAsync = require("../utils/catchAsync");
const {
  createWalletOrderSchema,
  verifyWalletPaymentSchema,
} = require("../validators/wallet.validator");

const router = express.Router();

router.use(auth);

router.get("/", catchAsync(controller.getWallet));
router.post(
  "/create-order",
  validate(createWalletOrderSchema),
  catchAsync(controller.createOrder)
);
router.post(
  "/verify-payment",
  validate(verifyWalletPaymentSchema),
  catchAsync(controller.verifyPayment)
);

module.exports = router;
