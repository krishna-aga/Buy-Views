const payoutAccountService = require("../services/payoutAccount.service");

const getMyPayoutAccount = async (req, res) => {
  const payoutAccount = await payoutAccountService.getPayoutAccount(req.user._id);
  res.status(200).json({ success: true, payoutAccount });
};

const saveMyPayoutAccount = async (req, res) => {
  const payoutAccount = await payoutAccountService.upsertPayoutAccount(
    req.user._id,
    req.validated.body
  );

  res.status(200).json({ success: true, payoutAccount });
};

module.exports = {
  getMyPayoutAccount,
  saveMyPayoutAccount,
};
