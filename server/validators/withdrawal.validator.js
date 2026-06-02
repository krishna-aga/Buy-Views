const { z } = require("./common.validator");

const createWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive("Withdrawal amount must be greater than 0"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createWithdrawalSchema,
};
