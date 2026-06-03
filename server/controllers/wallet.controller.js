const {
  createWalletOrder,
  getWalletSnapshot,
  verifyWalletPayment,
} = require("../services/wallet.service");

const getWallet = async (req, res) => {
  const wallet = await getWalletSnapshot(req.user);
  res.status(200).json({ success: true, wallet });
};

const createOrder = async (req, res) => {
  const order = await createWalletOrder(req.user, req.validated.body.amount);
  res.status(201).json({ success: true, order });
};

const verifyPayment = async (req, res) => {
  const wallet = await verifyWalletPayment(req.user, req.validated.body);
  res.status(200).json({ success: true, wallet });
};

module.exports = {
  createOrder,
  getWallet,
  verifyPayment,
};
