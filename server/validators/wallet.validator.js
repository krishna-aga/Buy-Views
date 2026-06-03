const { z } = require("./common.validator");

const createWalletOrderSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than 0").max(100000, "Amount is too large"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const verifyWalletPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().trim().min(1, "Razorpay order id is required"),
    razorpay_payment_id: z.string().trim().min(1, "Razorpay payment id is required"),
    razorpay_signature: z.string().trim().min(1, "Razorpay signature is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createWalletOrderSchema,
  verifyWalletPaymentSchema,
};
