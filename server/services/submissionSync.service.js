const Campaign = require("../models/Campaign");
const Submission = require("../models/Submission");
const User = require("../models/User");
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

module.exports = {
  syncSubmissionViews,
  updateSubmissionViews,
};
