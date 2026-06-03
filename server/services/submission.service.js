const Campaign = require("../models/Campaign");
const Submission = require("../models/Submission");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { verifyYoutubeSubmissionOwnership } = require("./youtube.service");
const { syncSubmissionViews } = require("./submissionSync.service");

const createSubmission = async (promoterId, payload) => {
  const campaign = await Campaign.findById(payload.campaignId);

  if (!campaign || campaign.status !== "active") {
    throw new ApiError(404, "Active campaign not found");
  }

  const promoter = await User.findById(promoterId).select("+youtubeRefreshToken");

  if (!promoter) {
    throw new ApiError(404, "Promoter not found");
  }

  const { videoId } = await verifyYoutubeSubmissionOwnership(promoter, payload.reelUrl);

  const existingSubmission = await Submission.findOne({
    campaignId: payload.campaignId,
    promoterId,
    reelUrl: payload.reelUrl,
  });

  if (existingSubmission) {
    throw new ApiError(409, "This reel has already been submitted for the selected campaign");
  }

  const submission = await Submission.create({
    ...payload,
    promoterId,
    youtubeVideoId: videoId,
  });

  try {
    return await syncSubmissionViews(submission._id);
  } catch (error) {
    await Submission.findByIdAndDelete(submission._id);
    throw error;
  }
};

const getPromoterSubmissions = async (promoterId) =>
  Submission.find({ promoterId })
    .populate("campaignId", "title payoutPer1000Views status")
    .sort({ createdAt: -1 });

module.exports = {
  createSubmission,
  getPromoterSubmissions,
};
