const campaignService = require("../services/campaign.service");

const createCampaign = async (req, res) => {
  const campaign = await campaignService.createCampaign(req.user._id, req.validated.body);
  res.status(201).json({ success: true, campaign });
};

const getCampaigns = async (req, res) => {
  const campaigns = await campaignService.getCampaigns({
    user: req.user,
    query: req.query,
  });

  res.status(200).json({ success: true, campaigns });
};

const getMyCampaigns = async (req, res) => {
  const campaigns = await campaignService.getCreatorCampaigns(req.user._id);
  const analytics = await campaignService.getCreatorAnalytics(req.user._id);

  res.status(200).json({ success: true, campaigns, analytics });
};

const getCampaignById = async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.validated.params.id);
  res.status(200).json({ success: true, campaign });
};

const updateCampaign = async (req, res) => {
  const campaign = await campaignService.updateCampaign(
    req.validated.params.id,
    req.user._id,
    req.validated.body
  );

  res.status(200).json({ success: true, campaign });
};

const deleteCampaign = async (req, res) => {
  const campaign = await campaignService.deleteCampaign(req.validated.params.id, req.user._id);
  res.status(200).json({ success: true, campaign });
};

module.exports = {
  createCampaign,
  getCampaigns,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
