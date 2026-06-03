const { z, objectId } = require("./common.validator");

const createWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive("Withdrawal amount must be greater than 0"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const approveWithdrawalSchema = z.object({
  body: z
    .object({
      remarks: z.string().trim().max(300).optional(),
      notes: z.string().trim().max(300).optional(),
    })
    .optional(),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

const rejectWithdrawalSchema = approveWithdrawalSchema;

module.exports = {
  approveWithdrawalSchema,
  createWithdrawalSchema,
  rejectWithdrawalSchema,
};
