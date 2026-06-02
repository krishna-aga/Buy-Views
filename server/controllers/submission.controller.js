const submissionService = require("../services/submission.service");

const createSubmission = async (req, res) => {
  const submission = await submissionService.createSubmission(req.user._id, req.validated.body);
  res.status(201).json({ success: true, submission });
};

const getMySubmissions = async (req, res) => {
  const submissions = await submissionService.getPromoterSubmissions(req.user._id);
  res.status(200).json({ success: true, submissions });
};

module.exports = {
  createSubmission,
  getMySubmissions,
};
