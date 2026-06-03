const PayoutAccount = require("../models/PayoutAccount");

const maskAccountNumber = (value = "") => {
  if (!value) return "";
  return `••••${value.slice(-4)}`;
};

const sanitizePayoutAccount = (account) => {
  if (!account) return null;

  return {
    id: account._id,
    userId: account.userId,
    accountType: account.accountType,
    accountHolderName: account.accountHolderName,
    phone: account.phone,
    accountNumberMasked: maskAccountNumber(account.accountNumber),
    ifscCode: account.ifscCode,
    upiId: account.upiId,
    verified: account.verified,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
};

const getPayoutAccount = async (userId) => {
  const account = await PayoutAccount.findOne({ userId });
  return sanitizePayoutAccount(account);
};

const upsertPayoutAccount = async (userId, payload) => {
  const account = await PayoutAccount.findOneAndUpdate(
    { userId },
    {
      userId,
      accountType: payload.accountType,
      accountHolderName: payload.accountHolderName,
      phone: payload.phone,
      accountNumber: payload.accountType === "bank_account" ? payload.accountNumber : "",
      ifscCode: payload.accountType === "bank_account" ? payload.ifscCode : "",
      upiId: payload.accountType === "vpa" ? payload.upiId : "",
      verified: false,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return sanitizePayoutAccount(account);
};

module.exports = {
  getPayoutAccount,
  upsertPayoutAccount,
};
