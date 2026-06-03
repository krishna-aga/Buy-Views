const withdrawalService = require("../services/withdrawal.service");

const createWithdrawal = async (req, res) => {
  const withdrawal = await withdrawalService.createWithdrawalRequest(
    req.user._id,
    req.validated.body.amount
  );

  res.status(201).json({ success: true, withdrawal });
};

const getMyWithdrawals = async (req, res) => {
  const withdrawals = await withdrawalService.getPromoterWithdrawals(req.user._id);
  res.status(200).json({ success: true, withdrawals });
};

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
};
