const { z } = require("./common.validator");

const payoutAccountSchema = z.object({
  body: z
    .object({
      accountType: z.enum(["bank_account", "vpa"]),
      accountHolderName: z.string().trim().min(3, "Account holder name is required").max(120),
      phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number"),
      accountNumber: z.string().trim().min(5).max(35).optional().or(z.literal("")),
      ifscCode: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, "Enter a valid IFSC code").optional().or(z.literal("")),
      upiId: z.string().trim().regex(/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/, "Enter a valid UPI ID").optional().or(z.literal("")),
    })
    .superRefine((body, ctx) => {
      if (body.accountType === "bank_account") {
        if (!body.accountNumber) {
          ctx.addIssue({
            code: "custom",
            path: ["accountNumber"],
            message: "Account number is required",
          });
        }

        if (!body.ifscCode) {
          ctx.addIssue({
            code: "custom",
            path: ["ifscCode"],
            message: "IFSC code is required",
          });
        }
      }

      if (body.accountType === "vpa" && !body.upiId) {
        ctx.addIssue({
          code: "custom",
          path: ["upiId"],
          message: "UPI ID is required",
        });
      }
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  payoutAccountSchema,
};
