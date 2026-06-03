const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const ApiError = require("../utils/ApiError");
const { roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");

const generatePayoutReference = () => `TEST_PAYOUT_${Date.now()}`;

const getPendingWithdrawalTotal = async (promoterId) => {
  const pendingWithdrawals = await Withdrawal.aggregate([
    {
      $match: {
        promoterId,
        status: "pending",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return roundCurrency(pendingWithdrawals[0]?.total || 0);
};

const createWithdrawalRequest = async (promoterId, amount) => {
  const promoter = await User.findById(promoterId);

  if (!promoter) {
    throw new ApiError(404, "Promoter not found");
  }

  const normalizedAmount = roundCurrency(amount);
  const pendingWithdrawalTotal = await getPendingWithdrawalTotal(promoterId);
  const availableForWithdrawal = roundCurrency(promoter.approvedEarnings - pendingWithdrawalTotal);

  if (availableForWithdrawal < normalizedAmount) {
    throw new ApiError(400, "Insufficient withdrawable balance");
  }

  const withdrawal = await Withdrawal.create({
    promoterId,
    amount: normalizedAmount,
    status: "pending",
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

const getPendingWithdrawals = async () =>
  Withdrawal.find({ status: "pending" })
    .populate("promoterId", "name email approvedEarnings totalWithdrawn")
    .sort({ createdAt: -1 });

const approveWithdrawal = async (withdrawalId, remarks = "") => {
  const withdrawal = await Withdrawal.findById(withdrawalId);

  if (!withdrawal) {
    throw new ApiError(404, "Withdrawal not found");
  }

  if (withdrawal.status !== "pending") {
    throw new ApiError(400, "Only pending withdrawals can be approved");
  }

  const promoter = await User.findById(withdrawal.promoterId);

  if (!promoter) {
    throw new ApiError(404, "Promoter not found");
  }

  if (promoter.approvedEarnings < withdrawal.amount) {
    throw new ApiError(400, "Insufficient withdrawable balance");
  }

  const payoutReference = generatePayoutReference();

  withdrawal.status = "completed";
  withdrawal.payoutReference = payoutReference;
  withdrawal.remarks = remarks;
  withdrawal.notes = remarks;
  withdrawal.processedAt = new Date();
  promoter.approvedEarnings = roundCurrency(promoter.approvedEarnings - withdrawal.amount);
  promoter.totalWithdrawn = roundCurrency(promoter.totalWithdrawn + withdrawal.amount);

  await withdrawal.save();
  await promoter.save();

  await createTransaction({
    userId: promoter._id,
    amount: withdrawal.amount,
    type: "withdrawal",
    description: `Simulated payout completed: ${payoutReference}`,
    status: "completed",
    referenceId: withdrawal._id,
    referenceModel: "Withdrawal",
  });

  return withdrawal;
};

const rejectWithdrawal = async (withdrawalId, remarks = "") => {
  const withdrawal = await Withdrawal.findById(withdrawalId);

  if (!withdrawal) {
    throw new ApiError(404, "Withdrawal not found");
  }

  if (withdrawal.status !== "pending") {
    throw new ApiError(400, "Only pending withdrawals can be rejected");
  }

  withdrawal.status = "rejected";
  withdrawal.remarks = remarks;
  withdrawal.notes = remarks;
  await withdrawal.save();

  return withdrawal;
};

module.exports = {
  approveWithdrawal,
  createWithdrawalRequest,
  getPromoterWithdrawals,
  getPendingWithdrawals,
  getPendingWithdrawalTotal,
  rejectWithdrawal,
};
