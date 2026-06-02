const Campaign = require("../models/Campaign");
const Submission = require("../models/Submission");
const ApiError = require("../utils/ApiError");

const createSubmission = async (promoterId, payload) => {
  const campaign = await Campaign.findById(payload.campaignId);

  if (!campaign || campaign.status !== "active") {
    throw new ApiError(404, "Active campaign not found");
  }

  const existingSubmission = await Submission.findOne({
    campaignId: payload.campaignId,
    promoterId,
    reelUrl: payload.reelUrl,
  });

  if (existingSubmission) {
    throw new ApiError(409, "This reel has already been submitted for the selected campaign");
  }

  return Submission.create({
    ...payload,
    promoterId,
  });
};

const getPromoterSubmissions = async (promoterId) =>
  Submission.find({ promoterId })
    .populate("campaignId", "title payoutPer1000Views status")
    .sort({ createdAt: -1 });

module.exports = {
  createSubmission,
  getPromoterSubmissions,
};
