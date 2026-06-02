const Campaign = require("../models/Campaign");
const Submission = require("../models/Submission");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { roundCurrency } = require("../utils/finance");
const { createTransaction } = require("./transaction.service");

const createCampaign = async (creatorId, payload) => {
  const creator = await User.findById(creatorId);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  if (creator.walletBalance < payload.budget) {
    throw new ApiError(400, "Insufficient wallet balance to lock this campaign budget");
  }

  creator.walletBalance = roundCurrency(creator.walletBalance - payload.budget);
  await creator.save();

  const campaign = await Campaign.create({
    ...payload,
    creatorId,
    remainingBudget: payload.budget,
  });

  await createTransaction({
    userId: creatorId,
    amount: payload.budget,
    type: "campaign_budget_locked",
    description: `Budget locked for campaign "${campaign.title}"`,
    referenceId: campaign._id,
    referenceModel: "Campaign",
  });

  return campaign;
};

const getCampaigns = async ({ user, query }) => {
  const filter = {};

  if (user.role === "promoter") {
    filter.status = "active";
  } else if (query.status) {
    filter.status = query.status;
  }

  return Campaign.find(filter).populate("creatorId", "name email");
};

const getCreatorCampaigns = async (creatorId) =>
  Campaign.find({ creatorId }).sort({ createdAt: -1 });

const getCampaignById = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId).populate("creatorId", "name email");

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  return campaign;
};

const updateCampaign = async (campaignId, creatorId, payload) => {
  const campaign = await Campaign.findOne({ _id: campaignId, creatorId });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const creator = await User.findById(creatorId);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  if (payload.budget !== undefined) {
    if (payload.budget < campaign.totalSpent) {
      throw new ApiError(400, "Budget cannot be less than total spent");
    }

    const difference = roundCurrency(payload.budget - campaign.budget);

    if (difference > 0) {
      if (creator.walletBalance < difference) {
        throw new ApiError(400, "Insufficient wallet balance to increase campaign budget");
      }

      creator.walletBalance = roundCurrency(creator.walletBalance - difference);
      await createTransaction({
        userId: creatorId,
        amount: difference,
        type: "campaign_budget_locked",
        description: `Additional budget locked for campaign "${campaign.title}"`,
        referenceId: campaign._id,
        referenceModel: "Campaign",
      });
    }

    if (difference < 0) {
      creator.walletBalance = roundCurrency(creator.walletBalance + Math.abs(difference));
      await createTransaction({
        userId: creatorId,
        amount: Math.abs(difference),
        type: "campaign_budget_released",
        description: `Unused budget released from campaign "${campaign.title}"`,
        referenceId: campaign._id,
        referenceModel: "Campaign",
      });
    }

    campaign.budget = payload.budget;
    campaign.remainingBudget = roundCurrency(campaign.budget - campaign.totalSpent);
  }

  if (payload.title !== undefined) campaign.title = payload.title;
  if (payload.description !== undefined) campaign.description = payload.description;
  if (payload.longVideoUrl !== undefined) campaign.longVideoUrl = payload.longVideoUrl;
  if (payload.payoutPer1000Views !== undefined) campaign.payoutPer1000Views = payload.payoutPer1000Views;
  if (payload.status !== undefined) campaign.status = payload.status;

  await creator.save();
  await campaign.save();

  return campaign;
};

const deleteCampaign = async (campaignId, creatorId) => {
  const campaign = await Campaign.findOne({ _id: campaignId, creatorId });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const creator = await User.findById(creatorId);
  const refundableAmount = roundCurrency(campaign.remainingBudget);

  if (refundableAmount > 0 && creator) {
    creator.walletBalance = roundCurrency(creator.walletBalance + refundableAmount);
    await creator.save();

    await createTransaction({
      userId: creatorId,
      amount: refundableAmount,
      type: "campaign_budget_released",
      description: `Remaining budget returned for campaign "${campaign.title}"`,
      referenceId: campaign._id,
      referenceModel: "Campaign",
    });
  }

  campaign.status = "cancelled";
  campaign.remainingBudget = 0;
  await campaign.save();

  return campaign;
};

const getCreatorAnalytics = async (creatorId) => {
  const campaigns = await Campaign.find({ creatorId });
  const submissions = await Submission.find({
    campaignId: { $in: campaigns.map((campaign) => campaign._id) },
  });

  return {
    totalCampaigns: campaigns.length,
    totalSpend: roundCurrency(campaigns.reduce((sum, campaign) => sum + campaign.totalSpent, 0)),
    totalViews: campaigns.reduce((sum, campaign) => sum + campaign.totalViews, 0),
    totalSubmissions: submissions.length,
  };
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCreatorCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getCreatorAnalytics,
};
