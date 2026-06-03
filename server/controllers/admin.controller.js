const adminService = require("../services/admin.service");

const getUsers = async (_req, res) => {
  const users = await adminService.listUsers();
  res.status(200).json({ success: true, users });
};

const getCampaigns = async (_req, res) => {
  const campaigns = await adminService.listCampaigns();
  res.status(200).json({ success: true, campaigns });
};

const getSubmissions = async (_req, res) => {
  const submissions = await adminService.listSubmissions();
  res.status(200).json({ success: true, submissions });
};

const getWithdrawals = async (_req, res) => {
  const withdrawals = await adminService.listWithdrawals();
  res.status(200).json({ success: true, withdrawals });
};

const updateSubmissionViews = async (req, res) => {
  const submission = await adminService.updateSubmissionViews(
    req.validated.params.id,
    req.validated.body.views
  );

  res.status(200).json({ success: true, submission });
};

const approveWithdrawal = async (req, res) => {
  const withdrawal = await adminService.approveWithdrawal(
    req.validated.params.id,
    req.validated.body.notes
  );

  res.status(200).json({ success: true, withdrawal });
};

const rejectWithdrawal = async (req, res) => {
  const withdrawal = await adminService.rejectWithdrawal(
    req.validated.params.id,
    req.validated.body.notes
  );

  res.status(200).json({ success: true, withdrawal });
};

module.exports = {
  getUsers,
  getCampaigns,
  getSubmissions,
  getWithdrawals,
  updateSubmissionViews,
  approveWithdrawal,
  rejectWithdrawal,
};
