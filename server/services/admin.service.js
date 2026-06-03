const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const ApiError = require("../utils/ApiError");
const { roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");
const { syncSubmissionViews, updateSubmissionViews } = require("./submissionSync.service");

const listUsers = async () => User.find().select("-password").sort({ createdAt: -1 });

const listCampaigns = async () =>
  Campaign.find().populate("creatorId", "name email").sort({ createdAt: -1 });

const listWithdrawals = async () =>
  Withdrawal.find().populate("promoterId", "name email").sort({ createdAt: -1 });

const approveWithdrawal = async (withdrawalId, notes = "") => {
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

  withdrawal.status = "approved";
  withdrawal.notes = notes;
  promoter.totalWithdrawn = roundCurrency(promoter.totalWithdrawn + withdrawal.amount);

  await withdrawal.save();
  await promoter.save();

  await createTransaction({
    userId: promoter._id,
    amount: withdrawal.amount,
    type: "withdrawal_approved",
    description: "Withdrawal approved by admin",
    referenceId: withdrawal._id,
    referenceModel: "Withdrawal",
  });

  return withdrawal;
};

const rejectWithdrawal = async (withdrawalId, notes = "") => {
  const withdrawal = await Withdrawal.findById(withdrawalId);

  if (!withdrawal) {
    throw new ApiError(404, "Withdrawal not found");
  }

  if (withdrawal.status !== "pending") {
    throw new ApiError(400, "Only pending withdrawals can be rejected");
  }

  const promoter = await User.findById(withdrawal.promoterId);

  if (!promoter) {
    throw new ApiError(404, "Promoter not found");
  }

  withdrawal.status = "rejected";
  withdrawal.notes = notes;
  promoter.approvedEarnings = roundCurrency(promoter.approvedEarnings + withdrawal.amount);

  await withdrawal.save();
  await promoter.save();

  await createTransaction({
    userId: promoter._id,
    amount: withdrawal.amount,
    type: "withdrawal_rejected",
    description: "Withdrawal rejected and amount returned to wallet",
    status: "rejected",
    referenceId: withdrawal._id,
    referenceModel: "Withdrawal",
  });

  return withdrawal;
};

module.exports = {
  listUsers,
  listCampaigns,
  listWithdrawals,
  updateSubmissionViews,
  syncSubmissionViews,
  approveWithdrawal,
  rejectWithdrawal,
};
