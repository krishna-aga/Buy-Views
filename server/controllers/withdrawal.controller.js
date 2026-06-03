const withdrawalService = require("../services/withdrawal.service");

const createWithdrawal = async (req, res) => {
  const withdrawal = await withdrawalService.createWithdrawalRequest(
    req.user._id,
    req.validated.body.amount
  );

  res.status(201).json({
    success: true,
    message: "Withdrawal request created successfully",
    data: { withdrawal },
    withdrawal,
  });
};

const getMyWithdrawals = async (req, res) => {
  const withdrawals = await withdrawalService.getPromoterWithdrawals(req.user._id);
  res.status(200).json({
    success: true,
    data: { withdrawals },
    withdrawals,
  });
};

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
};
