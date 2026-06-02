const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/Transaction");

const createTransaction = async ({
  userId,
  amount,
  type,
  description,
  status = "completed",
  referenceId = null,
  referenceModel = null,
}) =>
  Transaction.create({
    transactionId: uuidv4(),
    userId,
    amount,
    type,
    description,
    status,
    referenceId,
    referenceModel,
  });

module.exports = {
  createTransaction,
};
