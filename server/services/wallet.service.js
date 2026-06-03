const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { getRazorpayClient } = require("../config/razorpay");
const ApiError = require("../utils/ApiError");
const { roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");
const { getPendingWithdrawalTotal } = require("./withdrawal.service");

const createWalletOrder = async (user, amount) => {
  if (user.role !== "creator") {
    throw new ApiError(403, "Only creators can add money to wallet");
  }

  const normalizedAmount = roundCurrency(amount);
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(normalizedAmount * 100),
    currency: "INR",
    receipt: `wallet_${user._id}_${Date.now()}`.slice(0, 40),
    notes: {
      userId: String(user._id),
      purpose: "creator_wallet_deposit",
    },
  });

  await createTransaction({
    userId: user._id,
    amount: normalizedAmount,
    type: "deposit",
    description: "Creator wallet deposit initiated",
    status: "pending",
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount: normalizedAmount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyWalletPayment = async (user, payload) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== payload.razorpay_signature) {
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  const transaction = await Transaction.findOne({
    userId: user._id,
    type: "deposit",
    status: "pending",
    razorpayOrderId: payload.razorpay_order_id,
  });

  if (!transaction) {
    throw new ApiError(404, "Pending deposit transaction not found");
  }

  const duplicatePayment = await Transaction.findOne({
    razorpayPaymentId: payload.razorpay_payment_id,
  });

  if (duplicatePayment) {
    throw new ApiError(409, "Payment has already been verified");
  }

  const walletUser = await User.findById(user._id);

  if (!walletUser) {
    throw new ApiError(404, "User not found");
  }

  walletUser.walletBalance = roundCurrency(walletUser.walletBalance + transaction.amount);
  transaction.status = "completed";
  transaction.description = "Creator wallet deposit completed";
  transaction.razorpayPaymentId = payload.razorpay_payment_id;
  transaction.razorpaySignature = payload.razorpay_signature;

  await walletUser.save();
  await transaction.save();

  return getWalletSnapshot(walletUser);
};

const getWalletSnapshot = async (user) => {
  const pendingWithdrawals = await getPendingWithdrawalTotal(user._id);
  const approvedEarnings = roundCurrency(user.approvedEarnings);

  return {
    walletBalance: roundCurrency(user.walletBalance),
    pendingEarnings: roundCurrency(user.pendingEarnings),
    approvedEarnings,
    withdrawableBalance: roundCurrency(Math.max(approvedEarnings - pendingWithdrawals, 0)),
    totalWithdrawn: roundCurrency(user.totalWithdrawn),
    pendingWithdrawals,
  };
};

module.exports = {
  createWalletOrder,
  getWalletSnapshot,
  verifyWalletPayment,
};
