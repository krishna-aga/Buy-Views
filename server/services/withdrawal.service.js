const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const ApiError = require("../utils/ApiError");
const { roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");

const createWithdrawalRequest = async (promoterId, amount) => {
  const promoter = await User.findById(promoterId);

  if (!promoter) {
    throw new ApiError(404, "Promoter not found");
  }

  const normalizedAmount = roundCurrency(amount);

  if (promoter.approvedEarnings < normalizedAmount) {
    throw new ApiError(400, "Insufficient withdrawable balance");
  }

  promoter.approvedEarnings = roundCurrency(promoter.approvedEarnings - normalizedAmount);
  await promoter.save();

  const withdrawal = await Withdrawal.create({
    promoterId,
    amount: normalizedAmount,
  });

  await createTransaction({
    userId: promoterId,
    amount: normalizedAmount,
    type: "withdrawal_request",
    description: "Withdrawal request created",
    status: "pending",
    referenceId: withdrawal._id,
    referenceModel: "Withdrawal",
  });

  return withdrawal;
};

const getPromoterWithdrawals = async (promoterId) =>
  Withdrawal.find({ promoterId }).sort({ createdAt: -1 });

module.exports = {
  createWithdrawalRequest,
  getPromoterWithdrawals,
};
