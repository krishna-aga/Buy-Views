const { z } = require("./common.validator");

const createSubmissionSchema = z.object({
  body: z
    .object({
      campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid campaign id"),
      reelUrl: z.string().trim().url("Enter a valid YouTube Shorts URL"),
      platform: z.literal("youtube").default("youtube"),
    })
    .superRefine(({ reelUrl }, ctx) => {
      try {
        const { hostname } = new URL(reelUrl);
        const normalizedHost = hostname.replace(/^www\./, "");

        if (!["youtube.com", "m.youtube.com", "youtu.be"].includes(normalizedHost)) {
          ctx.addIssue({
            code: "custom",
            path: ["reelUrl"],
            message: "Enter a valid YouTube Shorts or YouTube video URL",
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["reelUrl"],
          message: "Enter a valid YouTube Shorts or YouTube video URL",
        });
      }
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createSubmissionSchema,
};
