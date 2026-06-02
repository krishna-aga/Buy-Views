const Withdrawal = require("../models/Withdrawal");
const { roundCurrency } = require("../utils/finance");

const getWalletSnapshot = async (user) => {
  const pendingWithdrawals = await Withdrawal.aggregate([
    {
      $match: {
        promoterId: user._id,
        status: "pending",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return {
    walletBalance: roundCurrency(user.walletBalance),
    pendingEarnings: roundCurrency(user.pendingEarnings),
    approvedEarnings: roundCurrency(user.approvedEarnings),
    withdrawableBalance: roundCurrency(user.approvedEarnings),
    totalWithdrawn: roundCurrency(user.totalWithdrawn),
    pendingWithdrawals: roundCurrency(pendingWithdrawals[0]?.total || 0),
  };
};

module.exports = {
  getWalletSnapshot,
};
