const withdrawalService = require("../services/withdrawal.service");

const getWithdrawals = async (_req, res) => {
  const withdrawals = await withdrawalService.getPendingWithdrawals();
  res.status(200).json({
    success: true,
    data: { withdrawals },
    withdrawals,
  });
};

const approveWithdrawal = async (req, res) => {
  const remarks = req.validated.body?.remarks || req.validated.body?.notes || "Simulated payout approved";
  const withdrawal = await withdrawalService.approveWithdrawal(req.validated.params.id, remarks);

  res.status(200).json({
    success: true,
    message: "Withdrawal completed successfully",
    data: {
      payoutReference: withdrawal.payoutReference,
      withdrawal,
    },
    withdrawal,
  });
};

const rejectWithdrawal = async (req, res) => {
  const remarks = req.validated.body?.remarks || req.validated.body?.notes || "Withdrawal rejected by admin";
  const withdrawal = await withdrawalService.rejectWithdrawal(req.validated.params.id, remarks);

  res.status(200).json({
    success: true,
    message: "Withdrawal rejected successfully",
    data: { withdrawal },
    withdrawal,
  });
};

module.exports = {
  approveWithdrawal,
  getWithdrawals,
  rejectWithdrawal,
};
