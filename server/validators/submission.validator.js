const { z } = require("./common.validator");

const createSubmissionSchema = z.object({
  body: z.object({
    campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign id"),
    reelUrl: z.string().trim().url("Enter a valid short-form post URL"),
    platform: z.enum(["instagram", "youtube", "tiktok", "other"]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createSubmissionSchema,
};
