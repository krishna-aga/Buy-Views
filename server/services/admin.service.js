const Campaign = require("../models/Campaign");
const User = require("../models/User");
const { syncSubmissionViews, updateSubmissionViews } = require("./submissionSync.service");

const listUsers = async () => User.find().select("-password").sort({ createdAt: -1 });

const listCampaigns = async () =>
  Campaign.find().populate("creatorId", "name email").sort({ createdAt: -1 });

module.exports = {
  listUsers,
  listCampaigns,
  updateSubmissionViews,
  syncSubmissionViews,
};
