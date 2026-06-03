const Campaign = require("../models/Campaign");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const ApiError = require("../utils/ApiError");
const { calculateEarnings, roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");
const { getVideoViews } = require("./youtubeAnalytics.service");
const { extractYoutubeVideoId } = require("./youtube.service");

const applySubmissionMetrics = async ({ submission, campaign, promoter, views, markRemoved = false }) => {
  const nextEarnings = calculateEarnings(views, campaign.payoutPer1000Views);
  const earningsDelta = roundCurrency(nextEarnings - submission.earnings);
  const viewsDelta = views - submission.views;

  if (earningsDelta > 0 && campaign.remainingBudget < earningsDelta) {
    throw new ApiError(400, "Campaign does not have enough remaining budget for this view update");
  }

  if (promoter.approvedEarnings + earningsDelta < 0) {
    throw new ApiError(400, "View reduction would push promoter earnings below zero");
  }

  submission.views = views;
  submission.earnings = nextEarnings;
  submission.lastSyncedAt = new Date();

  if (markRemoved) {
    submission.status = "removed";
  }

  campaign.totalViews += viewsDelta;
  campaign.totalSpent = roundCurrency(campaign.totalSpent + earningsDelta);
  campaign.remainingBudget = roundCurrency(campaign.budget - campaign.totalSpent);

  if (campaign.remainingBudget <= 0) {
    campaign.remainingBudget = 0;
    campaign.status = "completed";
  } else if (campaign.status === "completed") {
    campaign.status = "active";
  }

  promoter.approvedEarnings = roundCurrency(promoter.approvedEarnings + earningsDelta);

  await submission.save();
  await campaign.save();
  await promoter.save();

  if (earningsDelta !== 0) {
    await createTransaction({
      userId: promoter._id,
      amount: Math.abs(earningsDelta),
      type: "earning_approved",
      description:
        earningsDelta > 0
          ? `Earnings approved for submission ${submission._id}`
          : `Earnings adjusted for submission ${submission._id}`,
      referenceId: submission._id,
      referenceModel: "Submission",
    });
  }

  return submission;
};

const listUsers = async () => User.find().select("-password").sort({ createdAt: -1 });

const listCampaigns = async () =>
  Campaign.find().populate("creatorId", "name email").sort({ createdAt: -1 });

const updateSubmissionViews = async (submissionId, views) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  const campaign = await Campaign.findById(submission.campaignId);
  const promoter = await User.findById(submission.promoterId);

  if (!campaign || !promoter) {
    throw new ApiError(404, "Associated campaign or promoter not found");
  }

  return applySubmissionMetrics({
    submission,
    campaign,
    promoter,
    views,
  });
};

const syncSubmissionViews = async (submissionId) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  const campaign = await Campaign.findById(submission.campaignId);
  const promoter = await User.findById(submission.promoterId).select("+youtubeRefreshToken");

  if (!campaign || !promoter) {
    throw new ApiError(404, "Associated campaign or promoter not found");
  }

  if (!submission.youtubeVideoId) {
    submission.youtubeVideoId = extractYoutubeVideoId(submission.reelUrl);
  }

  if (!submission.youtubeVideoId) {
    throw new ApiError(400, "This submission does not contain a valid YouTube video id");
  }

  const { exists, views } = await getVideoViews({
    refreshToken: promoter.youtubeRefreshToken,
    videoId: submission.youtubeVideoId,
  });

  if (!exists) {
    submission.status = "removed";
    submission.lastSyncedAt = new Date();
    await submission.save();
    return submission;
  }

  submission.status = "active";

  return applySubmissionMetrics({
    submission,
    campaign,
    promoter,
    views,
  });
};

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
  updateSubmissionViews,
  syncSubmissionViews,
  approveWithdrawal,
  rejectWithdrawal,
};
