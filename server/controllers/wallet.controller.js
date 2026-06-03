const { getWalletSnapshot } = require("../services/wallet.service");

const getWallet = async (req, res) => {
  const wallet = await getWalletSnapshot(req.user);
  res.status(200).json({ success: true, wallet });
};

module.exports = {
  getWallet,
};
